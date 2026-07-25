# agent/followup.py — Relances proactives des prospects silencieux
# Généré par AgentKit

"""
Planificateur de relances : si un prospect ne répond plus, Louise le relance
une première fois après ~30 min, puis une seconde fois le lendemain.

IMPORTANT — Fenêtre de 24 h WhatsApp :
  Meta Cloud API et Twilio n'autorisent l'envoi de messages libres que dans les
  24 h suivant le dernier message du prospect. La relance à 30 min passe sans
  problème ; la relance « du lendemain » peut tomber HORS de cette fenêtre — en
  production elle nécessite alors un TEMPLATE pré-approuvé par le fournisseur.
  Ici, l'envoi est tenté tel quel : s'il échoue (hors fenêtre), c'est journalisé.
"""

import os
import asyncio
import logging
from datetime import datetime, timedelta

from agent.memory import (
    guardar_mensaje,
    obtener_relances_pendientes,
    avanzar_seguimiento,
    cancelar_seguimiento,
    obtener_historial,
)
from agent.brain import generar_relance

logger = logging.getLogger("agentkit")

# Cadence configurable via .env
RELANCE_1_MINUTES = int(os.getenv("RELANCE_1_MINUTES", "30"))     # 1ère relance
RELANCE_2_HORAS = int(os.getenv("RELANCE_2_HORAS", "24"))         # 2ème relance (lendemain)
MAX_RELANCES = int(os.getenv("MAX_RELANCES", "2"))               # nb total de relances
INTERVALO_SEGUNDOS = int(os.getenv("SEGUIMIENTO_INTERVALO_SEGUNDOS", "60"))  # fréquence du scan


def calcular_proxima(etapa: int, ahora: datetime) -> datetime | None:
    """Échéance de la relance à venir selon l'étape déjà atteinte."""
    if etapa == 0:
        return ahora + timedelta(minutes=RELANCE_1_MINUTES)
    if etapa == 1:
        return ahora + timedelta(hours=RELANCE_2_HORAS)
    return None


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
        proxima = calcular_proxima(nueva_etapa, ahora)
        if proxima is None or nueva_etapa >= MAX_RELANCES:
            await avanzar_seguimiento(telefono, nueva_etapa, None, activo=False)
        else:
            await avanzar_seguimiento(telefono, nueva_etapa, proxima, activo=True)
        logger.info(f"[RELANCE] Envoyée à {telefono} (étape {nueva_etapa}/{MAX_RELANCES})")


async def loop_seguimiento(proveedor):
    """Boucle de fond : scanne les relances dues à intervalle régulier."""
    logger.info(
        f"Boucle de relances active (1ère : {RELANCE_1_MINUTES} min, "
        f"2ème : +{RELANCE_2_HORAS} h, max {MAX_RELANCES})"
    )
    while True:
        try:
            await procesar_relances(proveedor, datetime.utcnow())
        except Exception as e:
            logger.error(f"Erreur dans la boucle de relances : {e}")
        await asyncio.sleep(INTERVALO_SEGUNDOS)
