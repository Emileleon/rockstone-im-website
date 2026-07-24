# agent/tools.py — Outils de l'agent
# Généré par AgentKit — profil : ROCKSTONE IM (immobilier)

"""
Outils spécifiques au métier de ROCKSTONE IM.
Ces fonctions étendent les capacités de l'agent au-delà de la simple réponse texte.
Cas d'usage retenus : FAQ, qualification de leads, prise de rendez-vous de visite.

NOTE : ces fonctions sont des points d'extension. Les stubs de qualification de
leads et de rendez-vous journalisent la demande et retournent une confirmation ;
à brancher sur votre CRM / agenda réel (HubSpot, Calendly, Google Calendar, etc.).
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
# Outils métier — ROCKSTONE IM (immobilier)
# ════════════════════════════════════════════════════════════

def registrar_lead(telefono: str, nombre: str, interes: str) -> str:
    """
    Enregistre un prospect (acheteur, locataire ou investisseur).
    À brancher sur votre CRM. Pour l'instant, journalise et confirme.

    Args:
        telefono: Numéro WhatsApp du prospect
        nombre: Nom du prospect
        interes: Type de bien / budget / secteur recherché

    Returns:
        Message de confirmation
    """
    logger.info(f"[LEAD] {nombre} ({telefono}) — intérêt : {interes}")
    return f"Merci {nombre}, votre demande a bien été enregistrée. Un conseiller ROCKSTONE IM vous recontactera rapidement."


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


def escalar_a_asesor(telefono: str, contexto: str) -> str:
    """
    Transfère la conversation à un conseiller humain lorsque la demande
    dépasse le périmètre de l'agent (négociation, dossier juridique, litige).

    Args:
        telefono: Numéro WhatsApp du client
        contexto: Résumé de la demande

    Returns:
        Message de transfert
    """
    logger.info(f"[ESCALADE] {telefono} — contexte : {contexto}")
    return "Je transmets votre demande à un conseiller ROCKSTONE IM qui prendra le relais dans les meilleurs délais."
