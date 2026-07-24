# agent/brain.py — Cerveau de l'agent : connexion à l'API Claude
# Généré par AgentKit

"""
Logique d'IA de l'agent. Lit le system prompt depuis prompts.yaml
et génère les réponses via l'API Anthropic Claude.
"""

import os
import yaml
import logging
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("agentkit")

# Client Anthropic
client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Modèle configurable via .env (par défaut : dernier Sonnet disponible)
MODELO = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5")


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
    """Retourne le message d'erreur configuré dans prompts.yaml."""
    config = cargar_config_prompts()
    return config.get("error_message", "Désolé, je rencontre un problème technique. Merci de réessayer dans quelques minutes.")


def obtener_mensaje_fallback() -> str:
    """Retourne le message de repli configuré dans prompts.yaml."""
    config = cargar_config_prompts()
    return config.get("fallback_message", "Pardon, je n'ai pas compris votre message. Pourriez-vous le reformuler ?")


async def generar_respuesta(mensaje: str, historial: list[dict]) -> str:
    """
    Génère une réponse via l'API Claude.

    Args:
        mensaje: Le nouveau message de l'utilisateur
        historial: Liste des messages précédents [{"role": "user/assistant", "content": "..."}]

    Returns:
        La réponse générée par Claude
    """
    # Si le message est trop court ou vide, utiliser le message de repli
    if not mensaje or len(mensaje.strip()) < 2:
        return obtener_mensaje_fallback()

    system_prompt = cargar_system_prompt()

    # Construire les messages pour l'API
    mensajes = []
    for msg in historial:
        mensajes.append({
            "role": msg["role"],
            "content": msg["content"]
        })

    # Ajouter le message actuel
    mensajes.append({
        "role": "user",
        "content": mensaje
    })

    try:
        response = await client.messages.create(
            model=MODELO,
            max_tokens=1024,
            system=system_prompt,
            messages=mensajes
        )

        respuesta = response.content[0].text
        logger.info(f"Réponse générée ({response.usage.input_tokens} in / {response.usage.output_tokens} out)")
        return respuesta

    except Exception as e:
        logger.error(f"Erreur API Claude : {e}")
        return obtener_mensaje_error()
