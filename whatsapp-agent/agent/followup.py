# agent/followup.py — Relances proactives des prospects silencieux
# Généré par AgentKit

"""
Planificateur de relances. Si un prospect ne répond plus, Louise le relance selon
une escalade de délais successifs (par défaut : 5 min, puis 30 min, puis 2 h, puis 5 h).

Fenêtre horaire : toute relance qui tomberait en dehors de la plage [9h, 20h[
(heure locale, Europe/Paris par défaut) est décalée au lendemain à 9h — pour ne pas
déranger le prospect le soir ou la nuit.

IMPORTANT — Fenêtre de 24 h WhatsApp :
  Meta Cloud API et Twilio n'autorisent l'envoi de messages libres que dans les
  24 h suivant le dernier message du prospect. Les premières relances passent ; une
  relance décalée au lendemain peut tomber HORS de cette fenêtre — en production elle
  nécessite alors un TEMPLATE pré-approuvé. Si l'envoi échoue, c'est journalisé.
"""

import os
import asyncio
import logging
from datetime import datetime, timedelta, timezone

from agent.memory import (
    guardar_mensaje,
    obtener_relances_pendientes,
    avanzar_seguimiento,
    cancelar_seguimiento,
    obtener_historial,
)
from agent.brain import generar_relance

logger = logging.getLogger("agentkit")


def _parse_delais() -> list[timedelta]:
    """Délais successifs entre relances (en minutes) depuis .env, sinon défaut."""
    raw = os.getenv("RELANCE_DELAIS_MINUTES", "5,30,120,300")
    delais = [timedelta(minutes=float(p)) for p in raw.split(",") if p.strip()]
    return delais or [timedelta(minutes=5)]


DELAIS = _parse_delais()
MAX_RELANCES = len(DELAIS)

# Fenêtre horaire d'envoi (heure locale)
HEURE_DEBUT = int(os.getenv("RELANCE_HEURE_DEBUT", "9"))
HEURE_FIN = int(os.getenv("RELANCE_HEURE_FIN", "20"))
INTERVALO_SEGUNDOS = int(os.getenv("SEGUIMIENTO_INTERVALO_SEGUNDOS", "60"))

_TZNAME = os.getenv("RELANCE_TIMEZONE", "Europe/Paris")
try:
    from zoneinfo import ZoneInfo
    _TZ = ZoneInfo(_TZNAME)
except Exception as e:  # tzdata absent : on n'applique pas la fenêtre horaire
    logger.warning(f"Fuseau '{_TZNAME}' indisponible ({e}) — fenêtre horaire désactivée")
    _TZ = None


def _aplicar_horario(candidato: datetime) -> datetime:
    """
    Décale un horaire (UTC naïf) hors de la plage [HEURE_DEBUT, HEURE_FIN[ vers
    la prochaine ouverture à HEURE_DEBUT (heure locale). Retourne un UTC naïf.
    """
    if _TZ is None:
        return candidato
    local = candidato.replace(tzinfo=timezone.utc).astimezone(_TZ)
    if local.hour >= HEURE_FIN:
        local = (local + timedelta(days=1)).replace(
            hour=HEURE_DEBUT, minute=0, second=0, microsecond=0)
    elif local.hour < HEURE_DEBUT:
        local = local.replace(hour=HEURE_DEBUT, minute=0, second=0, microsecond=0)
    return local.astimezone(timezone.utc).replace(tzinfo=None)


def proxima_relance(etapa: int, ahora: datetime) -> datetime | None:
    """
    Échéance de la prochaine relance selon le nombre de relances déjà envoyées.
    Retourne None quand le nombre maximum de relances est atteint.
    """
    if etapa >= MAX_RELANCES:
        return None
    return _aplicar_horario(ahora + DELAIS[etapa])


async def procesar_relances(proveedor, ahora: datetime):
    """Envoie les relances dues et replanifie (ou clôt) chaque suivi."""
    pendientes = await obtener_relances_pendientes(ahora)
    for item in pendientes:
        telefono, etapa = item["telefono"], item["etapa"]

        if etapa >= MAX_RELANCES:
            await cancelar_seguimiento(telefono)
            continue

        historial = await obtener_historial(telefono)
        mensaje = await generar_relance(historial, telefono, etapa)

        enviado = await proveedor.enviar_mensaje(telefono, mensaje)
        if not enviado:
            logger.warning(f"[RELANCE] Échec d'envoi à {telefono} (fenêtre 24 h ? template requis ?)")
        await guardar_mensaje(telefono, "assistant", mensaje)

        nueva_etapa = etapa + 1
        proxima = proxima_relance(nueva_etapa, ahora)
        if proxima is None:
            await avanzar_seguimiento(telefono, nueva_etapa, None, activo=False)
        else:
            await avanzar_seguimiento(telefono, nueva_etapa, proxima, activo=True)
        logger.info(f"[RELANCE] Envoyée à {telefono} (étape {nueva_etapa}/{MAX_RELANCES})")


async def loop_seguimiento(proveedor):
    """Boucle de fond : scanne les relances dues à intervalle régulier."""
    minutos = ", ".join(str(int(d.total_seconds() // 60)) for d in DELAIS)
    logger.info(
        f"Boucle de relances active — délais (min) : {minutos} ; "
        f"fenêtre {HEURE_DEBUT}h-{HEURE_FIN}h ({_TZNAME})"
    )
    while True:
        try:
            await procesar_relances(proveedor, datetime.utcnow())
        except Exception as e:
            logger.error(f"Erreur dans la boucle de relances : {e}")
        await asyncio.sleep(INTERVALO_SEGUNDOS)
