# agent/providers/base.py — Classe de base pour les fournisseurs WhatsApp
# Généré par AgentKit

"""
Définit l'interface commune que tous les fournisseurs WhatsApp doivent implémenter.
Cela permet de changer de fournisseur sans modifier le reste du code.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from fastapi import Request


@dataclass
class MensajeEntrante:
    """Message normalisé — même format quel que soit le fournisseur."""
    telefono: str       # Numéro de l'expéditeur
    texto: str          # Contenu du message
    mensaje_id: str     # Identifiant unique du message
    es_propio: bool     # True si le message a été envoyé par l'agent (ignoré)


class ProveedorWhatsApp(ABC):
    """Interface que chaque fournisseur WhatsApp doit implémenter."""

    @abstractmethod
    async def parsear_webhook(self, request: Request) -> list[MensajeEntrante]:
        """Extrait et normalise les messages du payload du webhook."""
        ...

    @abstractmethod
    async def enviar_mensaje(self, telefono: str, mensaje: str) -> bool:
        """Envoie un message texte. Retourne True en cas de succès."""
        ...

    async def validar_webhook(self, request: Request) -> dict | int | None:
        """Vérification GET du webhook (requise uniquement par Meta). Retourne la réponse ou None."""
        return None
