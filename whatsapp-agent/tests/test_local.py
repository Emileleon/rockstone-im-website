# tests/test_local.py — Simulateur de chat en terminal
# Généré par AgentKit

"""
Testez votre agent sans WhatsApp.
Simule une conversation dans le terminal.
"""

import asyncio
import sys
import os

# Ajouter le répertoire racine au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.brain import generar_respuesta
from agent.memory import inicializar_db, guardar_mensaje, obtener_historial, limpiar_historial

TELEFONO_TEST = "test-local-001"


async def main():
    """Boucle principale du chat de test."""
    await inicializar_db()

    print()
    print("=" * 55)
    print("   AgentKit — Test Local")
    print("=" * 55)
    print()
    print("  Écrivez des messages comme si vous étiez un client.")
    print("  Commandes spéciales :")
    print("    'limpiar'  — efface l'historique")
    print("    'salir'    — termine le test")
    print()
    print("-" * 55)
    print()

    while True:
        try:
            mensaje = input("Vous : ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\nTest terminé.")
            break

        if not mensaje:
            continue

        if mensaje.lower() in ("salir", "quitter", "exit"):
            print("\nTest terminé.")
            break

        if mensaje.lower() in ("limpiar", "effacer"):
            await limpiar_historial(TELEFONO_TEST)
            print("[Historique effacé]\n")
            continue

        # Récupérer l'historique AVANT d'enregistrer (brain.py ajoute le message actuel)
        historial = await obtener_historial(TELEFONO_TEST)

        # Générer la réponse
        print("\nAgent : ", end="", flush=True)
        respuesta = await generar_respuesta(mensaje, historial, TELEFONO_TEST)
        print(respuesta)
        print()

        # Enregistrer le message de l'utilisateur et la réponse de l'agent
        await guardar_mensaje(TELEFONO_TEST, "user", mensaje)
        await guardar_mensaje(TELEFONO_TEST, "assistant", respuesta)


if __name__ == "__main__":
    asyncio.run(main())
