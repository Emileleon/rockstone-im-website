# agent/brain.py — Cerveau de l'agent : connexion à l'API Claude
# Généré par AgentKit

"""
Logique d'IA de l'agent. Lit le system prompt depuis prompts.yaml, génère les
réponses via l'API Anthropic Claude, et laisse Louise enregistrer les données
qualifiées du prospect au fil de la conversation (outil guardar_calificacion).
"""

import os
import yaml
import logging
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

from agent.memory import upsert_lead, obtener_lead

load_dotenv()
logger = logging.getLogger("agentkit")

# Client Anthropic
client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Modèle configurable via .env (par défaut : dernier Sonnet disponible)
MODELO = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5")

# Outil de qualification : Louise l'appelle pour enregistrer ce qu'elle apprend
HERRAMIENTAS = [
    {
        "name": "guardar_calificacion",
        "description": (
            "Enregistre ou met à jour les informations du prospect DÈS que tu les "
            "apprends dans la conversation. Appelle cet outil à chaque nouvelle "
            "information, même partielle. Ne demande jamais une info déjà connue."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "nombre": {"type": "string", "description": "Nom / prénom du prospect"},
                "tipo": {
                    "type": "string",
                    "enum": ["gestion", "transaction"],
                    "description": "Métier concerné : gestion immobilière ou transaction (vente/location)",
                },
                "operacion": {
                    "type": "string",
                    "description": "Opération : mandat de gestion, achat, vente, location (bailleur/locataire)",
                },
                "bien": {"type": "string", "description": "Nature et localisation du bien"},
                "presupuesto": {"type": "string", "description": "Budget d'achat ou loyer visé"},
                "sector": {"type": "string", "description": "Secteur / quartier recherché"},
                "plazo": {"type": "string", "description": "Délai ou échéance du projet"},
                "objeto": {"type": "string", "description": "Objet détaillé de la demande, avec le maximum de précisions"},
            },
        },
    }
]

_MAX_ITER = 5  # garde-fou anti-boucle sur les appels d'outils


def cargar_config_prompts() -> dict:
    """Lit toute la configuration depuis config/prompts.yaml."""
    try:
        with open("config/prompts.yaml", "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except FileNotFoundError:
        logger.error("config/prompts.yaml introuvable")
        return {}


def cargar_system_prompt() -> str:
    """Lit le system prompt depuis config/prompts.yaml."""
    config = cargar_config_prompts()
    return config.get("system_prompt", "Tu es un assistant utile. Réponds en français.")


def obtener_mensaje_error() -> str:
    config = cargar_config_prompts()
    return config.get("error_message", "Désolé, je rencontre un problème technique. Merci de réessayer dans quelques minutes.")


def obtener_mensaje_fallback() -> str:
    config = cargar_config_prompts()
    return config.get("fallback_message", "Pardon, je n'ai pas compris votre message. Pourriez-vous le reformuler ?")


def _texto_de(content) -> str:
    """Concatène les blocs texte d'une réponse de l'API."""
    return "".join(b.text for b in content if getattr(b, "type", None) == "text").strip()


async def _ejecutar_herramienta(telefono: str, nombre: str, entrada: dict) -> str:
    """Exécute un appel d'outil de Louise. Retourne le résultat pour l'API."""
    if nombre == "guardar_calificacion":
        estado = await upsert_lead(telefono, **entrada)
        faltantes = [c for c in ("nombre", "tipo", "operacion", "objeto") if not estado.get(c)]
        return (
            "Enregistré. "
            + ("Qualification complète." if estado.get("completo")
               else "Encore à préciser : " + ", ".join(faltantes) + ".")
        )
    return "Outil inconnu."


async def generar_respuesta(mensaje: str, historial: list[dict], telefono: str = "inconnu") -> str:
    """
    Génère une réponse via l'API Claude, avec qualification structurée du prospect.

    Args:
        mensaje: Nouveau message de l'utilisateur
        historial: Messages précédents [{"role": "user/assistant", "content": "..."}]
        telefono: Identifiant du prospect (pour enregistrer sa qualification)
    """
    if not mensaje or len(mensaje.strip()) < 2:
        return obtener_mensaje_fallback()

    system_prompt = cargar_system_prompt()
    mensajes = [{"role": m["role"], "content": m["content"]} for m in historial]
    mensajes.append({"role": "user", "content": mensaje})

    try:
        for _ in range(_MAX_ITER):
            response = await client.messages.create(
                model=MODELO,
                max_tokens=1024,
                system=system_prompt,
                tools=HERRAMIENTAS,
                messages=mensajes,
            )

            if response.stop_reason == "tool_use":
                # Louise enregistre une info : on exécute puis on relance la boucle
                mensajes.append({"role": "assistant", "content": response.content})
                resultados = []
                for bloque in response.content:
                    if getattr(bloque, "type", None) == "tool_use":
                        salida = await _ejecutar_herramienta(telefono, bloque.name, bloque.input or {})
                        resultados.append({
                            "type": "tool_result",
                            "tool_use_id": bloque.id,
                            "content": salida,
                        })
                mensajes.append({"role": "user", "content": resultados})
                continue

            return _texto_de(response.content) or obtener_mensaje_fallback()

        # Sécurité : trop d'itérations d'outils
        return obtener_mensaje_fallback()

    except Exception as e:
        logger.error(f"Erreur API Claude : {e}")
        return obtener_mensaje_error()


async def generar_relance(historial: list[dict], telefono: str, etapa: int) -> str:
    """
    Génère un message de RELANCE pour un prospect qui ne répond plus.

    Args:
        historial: Historique de la conversation
        telefono: Identifiant du prospect (pour lire sa qualification)
        etapa: 0 = 1ère relance (~30 min), 1 = relance du lendemain
    """
    system_prompt = cargar_system_prompt()
    lead = await obtener_lead(telefono) or {}
    faltantes = [c for c in ("nombre", "tipo", "operacion", "bien", "presupuesto", "sector", "plazo", "objeto")
                 if not lead.get(c)]

    if etapa == 0:
        cadence = "Le prospect n'a pas répondu depuis une trentaine de minutes."
    else:
        cadence = "Le prospect n'a pas répondu depuis hier ; c'est une seconde et dernière relance."

    instruccion = (
        f"[INSTRUCTION INTERNE — ne pas la mentionner] {cadence} "
        "Rédige une relance COURTE (1 à 2 phrases), chaleureuse, professionnelle et non insistante, "
        "en français, qui réengage la conversation. "
        + (f"Cherche à obtenir en priorité : {', '.join(faltantes)}. " if faltantes else "")
        + "Propose une question simple et ouverte. Ne t'excuse pas lourdement, reste élégante."
    )

    mensajes = [{"role": m["role"], "content": m["content"]} for m in historial]
    mensajes.append({"role": "user", "content": instruccion})

    try:
        response = await client.messages.create(
            model=MODELO,
            max_tokens=400,
            system=system_prompt,
            messages=mensajes,
        )
        return _texto_de(response.content) or "Bonjour, souhaitez-vous que nous avancions ensemble sur votre projet ?"
    except Exception as e:
        logger.error(f"Erreur API Claude (relance) : {e}")
        return "Bonjour, je reste à votre disposition pour avancer sur votre projet. Comment puis-je vous aider ?"
