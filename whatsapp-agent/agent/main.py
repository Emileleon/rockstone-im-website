# agent/main.py — Serveur FastAPI + Webhook WhatsApp
# Généré par AgentKit

"""
Serveur principal de l'agent WhatsApp.
Fonctionne avec n'importe quel fournisseur (Meta, Twilio) grâce à la couche providers.
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import PlainTextResponse
from dotenv import load_dotenv

from agent.brain import generar_respuesta
from agent.memory import inicializar_db, guardar_mensaje, obtener_historial
from agent.providers import obtener_proveedor

load_dotenv()

# Configuration du logging selon l'environnement
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
log_level = logging.DEBUG if ENVIRONMENT == "development" else logging.INFO
logging.basicConfig(level=log_level)
logger = logging.getLogger("agentkit")

# Fournisseur WhatsApp (configuré dans .env via WHATSAPP_PROVIDER)
proveedor = obtener_proveedor()
PORT = int(os.getenv("PORT", 8000))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise la base de données au démarrage du serveur."""
    await inicializar_db()
    logger.info("Base de données initialisée")
    logger.info(f"Serveur AgentKit démarré sur le port {PORT}")
    logger.info(f"Fournisseur WhatsApp : {proveedor.__class__.__name__}")
    yield


app = FastAPI(
    title="AgentKit — Agent WhatsApp IA",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/")
async def health_check():
    """Endpoint de santé pour Railway / monitoring."""
    return {"status": "ok", "service": "agentkit"}


@app.get("/webhook")
async def webhook_verificacion(request: Request):
    """Vérification GET du webhook (requise par Meta Cloud API, sans effet pour les autres)."""
    resultado = await proveedor.validar_webhook(request)
    if resultado is not None:
        return PlainTextResponse(str(resultado))
    return {"status": "ok"}


@app.post("/webhook")
async def webhook_handler(request: Request):
    """
    Reçoit les messages WhatsApp via le fournisseur configuré.
    Traite le message, génère une réponse avec Claude et la renvoie.
    """
    try:
        # Analyse du webhook — le fournisseur normalise le format
        mensajes = await proveedor.parsear_webhook(request)

        for msg in mensajes:
            # Ignorer les messages propres ou vides
            if msg.es_propio or not msg.texto:
                continue

            logger.info(f"Message de {msg.telefono} : {msg.texto}")

            # Récupérer l'historique AVANT d'enregistrer le message actuel
            # (brain.py ajoute le message actuel, évitant les doublons)
            historial = await obtener_historial(msg.telefono)

            # Générer la réponse avec Claude
            respuesta = await generar_respuesta(msg.texto, historial)

            # Enregistrer le message de l'utilisateur ET la réponse de l'agent
            await guardar_mensaje(msg.telefono, "user", msg.texto)
            await guardar_mensaje(msg.telefono, "assistant", respuesta)

            # Envoyer la réponse par WhatsApp via le fournisseur
            await proveedor.enviar_mensaje(msg.telefono, respuesta)

            logger.info(f"Réponse à {msg.telefono} : {respuesta}")

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Erreur dans le webhook : {e}")
        raise HTTPException(status_code=500, detail=str(e))
