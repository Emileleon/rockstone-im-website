# agent/tools.py — Outils de l'agent
# Généré par AgentKit — profil : ROCKSTONE IM (immobilier)

"""
Outils spécifiques aux deux métiers de ROCKSTONE IM :
  - GESTION IMMOBILIÈRE (cœur de métier) : demandes de mandat de gestion des
    propriétaires/investisseurs et demandes des locataires des biens gérés.
  - TRANSACTION : achat, vente et location (qualification + visites).

Ces fonctions étendent les capacités de l'agent au-delà de la simple réponse texte.

NOTE : ce sont des points d'extension. Les stubs journalisent la demande et
retournent une confirmation ; à brancher sur votre CRM / agenda réel
(HubSpot, Calendly, Google Calendar, etc.).
"""

import os
import yaml
import logging
from datetime import datetime

logger = logging.getLogger("agentkit")


def cargar_info_negocio() -> dict:
    """Charge les informations de l'entreprise depuis business.yaml."""
    try:
        with open("config/business.yaml", "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        logger.error("config/business.yaml introuvable")
        return {}


def obtener_horario() -> dict:
    """Retourne les horaires d'ouverture de l'entreprise."""
    info = cargar_info_negocio()
    return {
        "horario": info.get("negocio", {}).get("horario", "Non disponible"),
        "esta_abierto": True,  # TODO : calculer selon l'heure actuelle et les horaires
    }


def buscar_en_knowledge(consulta: str) -> str:
    """
    Recherche des informations pertinentes dans les fichiers de /knowledge.
    Retourne le contenu le plus pertinent trouvé.
    """
    resultados = []
    knowledge_dir = "knowledge"

    if not os.path.exists(knowledge_dir):
        return "Aucun fichier de connaissances disponible."

    for archivo in os.listdir(knowledge_dir):
        ruta = os.path.join(knowledge_dir, archivo)
        if archivo.startswith(".") or not os.path.isfile(ruta):
            continue
        try:
            with open(ruta, "r", encoding="utf-8") as f:
                contenido = f.read()
                # Recherche simple par correspondance de texte
                if consulta.lower() in contenido.lower():
                    resultados.append(f"[{archivo}] : {contenido[:500]}")
        except (UnicodeDecodeError, IOError):
            continue

    if resultados:
        return "\n---\n".join(resultados)
    return "Je n'ai pas trouvé d'information précise à ce sujet dans mes fichiers."


# ════════════════════════════════════════════════════════════
# Outils métier — ROCKSTONE IM
# Deux métiers DISTINCTS : la gestion immobilière (cœur de métier)
# et la transaction (vente / location). Les outils sont séparés
# en conséquence. À brancher sur votre CRM / agenda réels.
# ════════════════════════════════════════════════════════════

# ── Métier 1 : GESTION IMMOBILIÈRE (cœur de métier) ──────────

def registrar_demande_gestion(telefono: str, nombre: str, bien: str, situation: str = "") -> str:
    """
    Enregistre une demande de mandat de GESTION d'un propriétaire ou investisseur
    qui souhaite confier son patrimoine à ROCKSTONE IM.

    Args:
        telefono: Numéro WhatsApp du client
        nombre: Nom du propriétaire / investisseur
        bien: Nature et localisation du bien à gérer
        situation: Situation locative actuelle (loué, vacant, en travaux…)

    Returns:
        Message de confirmation
    """
    logger.info(f"[GESTION] {nombre} ({telefono}) — bien : {bien} — situation : {situation}")
    return (
        f"Merci {nombre}, votre demande de gestion est bien enregistrée. "
        "Un interlocuteur dédié ROCKSTONE IM vous recontacte rapidement pour étudier "
        "la gestion de votre patrimoine."
    )


def registrar_demande_locataire(telefono: str, referencia_bien: str, demande: str) -> str:
    """
    Enregistre la demande d'un LOCATAIRE d'un bien géré par ROCKSTONE IM
    (question, incident, entretien, travaux) et la transmet à l'interlocuteur dédié.

    Args:
        telefono: Numéro WhatsApp du locataire
        referencia_bien: Référence ou adresse du bien géré
        demande: Description de la demande

    Returns:
        Message de confirmation
    """
    logger.info(f"[LOCATAIRE] {telefono} — bien {referencia_bien} — demande : {demande}")
    return (
        "Votre demande est bien prise en compte et transmise à votre interlocuteur "
        "dédié ROCKSTONE IM, qui revient vers vous dans les meilleurs délais."
    )


# ── Métier 2 : TRANSACTION (vente / location) ────────────────

def registrar_lead_transaction(telefono: str, nombre: str, operacion: str, criterios: str) -> str:
    """
    Enregistre un prospect de TRANSACTION : achat, vente, ou (mise en) location.
    À brancher sur votre CRM. Pour l'instant, journalise et confirme.

    Args:
        telefono: Numéro WhatsApp du prospect
        nombre: Nom du prospect
        operacion: Type d'opération ("achat", "vente", "location_locataire", "location_bailleur")
        criterios: Type de bien / budget / secteur / caractéristiques

    Returns:
        Message de confirmation
    """
    logger.info(f"[TRANSACTION:{operacion}] {nombre} ({telefono}) — critères : {criterios}")
    return (
        f"Merci {nombre}, votre projet ({operacion}) est bien enregistré. "
        "Un conseiller transaction ROCKSTONE IM vous recontacte rapidement."
    )


def agendar_visita(telefono: str, referencia_bien: str, fecha: str, hora: str) -> dict:
    """
    Enregistre une demande de rendez-vous pour la visite d'un bien.
    À brancher sur votre agenda (Calendly, Google Calendar). Pour l'instant, journalise.

    Args:
        telefono: Numéro WhatsApp du client
        referencia_bien: Référence ou adresse du bien
        fecha: Date souhaitée (ex : 2026-08-05)
        hora: Heure souhaitée (ex : 14:30)

    Returns:
        Dictionnaire de confirmation
    """
    logger.info(f"[VISITE] {telefono} — bien {referencia_bien} le {fecha} à {hora}")
    return {
        "estado": "en_attente_de_confirmation",
        "bien": referencia_bien,
        "fecha": fecha,
        "hora": hora,
        "mensaje": f"Votre demande de visite du bien {referencia_bien} le {fecha} à {hora} est enregistrée. Nous vous confirmons le créneau très vite.",
    }


# ── Commun aux deux métiers ──────────────────────────────────

def escalar_a_interlocutor_dedicado(telefono: str, contexto: str) -> str:
    """
    Transfère la conversation à l'interlocuteur dédié / un conseiller humain lorsque
    la demande dépasse le périmètre de l'agent (négociation, dossier juridique, litige,
    situation sensible), quel que soit le métier concerné.

    Args:
        telefono: Numéro WhatsApp du client
        contexto: Résumé de la demande

    Returns:
        Message de transfert
    """
    logger.info(f"[ESCALADE] {telefono} — contexte : {contexto}")
    return "Je transmets votre demande à votre interlocuteur dédié ROCKSTONE IM, qui prendra le relais dans les meilleurs délais."
