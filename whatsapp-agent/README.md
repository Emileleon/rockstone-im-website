# Agent WhatsApp — ROCKSTONE IM

Agent WhatsApp IA pour ROCKSTONE IM, généré avec [AgentKit](https://github.com/Hainrixz/whatsapp-agentkit).
Stack : **FastAPI + Claude API + SQLite/PostgreSQL**, avec une couche fournisseur
(**Meta Cloud API** ou **Twilio**) interchangeable.

> Ce dossier est autonome : c'est un projet Python indépendant du site Next.js
> qui l'entoure. Il peut tourner en local, en Docker, ou être déployé sur Railway.

## Structure

```
whatsapp-agent/
├── agent/
│   ├── main.py            # Serveur FastAPI + webhook (agnostique au fournisseur)
│   ├── brain.py           # Connexion Claude API + system prompt
│   ├── memory.py          # SQLAlchemy + historique par numéro
│   ├── tools.py           # Outils métier ROCKSTONE (leads, visites, escalade)
│   └── providers/         # Adaptateurs Meta et Twilio + factory
├── config/
│   ├── business.yaml      # Données de l'entreprise
│   └── prompts.yaml       # System prompt de l'agent (français, haut de gamme)
├── knowledge/             # Vos fichiers privés (mandats, FAQ, tarifs…) — non commités
├── tests/test_local.py    # Chat de test en terminal (sans WhatsApp)
├── Dockerfile
├── docker-compose.yml
└── .env.example           # Modèle de configuration — copier en .env
```

## Démarrage rapide

```bash
cd whatsapp-agent

# 1. Dépendances
pip install -r requirements.txt

# 2. Configuration (remplissez vos clés)
cp .env.example .env
#   → ANTHROPIC_API_KEY = votre clé sk-ant-...
#   → WHATSAPP_PROVIDER = twilio (ou meta)
#   → + les identifiants du fournisseur choisi

# 3. Test en local (sans WhatsApp)
python tests/test_local.py

# 4. Serveur (webhook)
uvicorn agent.main:app --reload --port 8000
```

> `python tests/test_local.py` et `uvicorn` nécessitent une `ANTHROPIC_API_KEY`
> valide. `WHATSAPP_PROVIDER` n'est requis que pour lancer le serveur webhook
> (`main.py`), pas pour le chat de test.

## Qualification des prospects & relances

- **Qualification** : Louise fait parler le prospect (une question à la fois) et
  enregistre au fil de l'eau ses données via l'outil `guardar_calificacion` →
  table `leads` (nom, gestion/transaction, opération, bien, budget, secteur, délai,
  objet détaillé). Un lead est marqué « complet » dès que l'essentiel est connu.
- **Relances proactives** : si le prospect ne répond plus, Louise le relance après
  `RELANCE_1_MINUTES` (30 min par défaut), puis après `RELANCE_2_HORAS` (le lendemain).
  Chaque réponse du prospect réinitialise le compteur ; une qualification complète
  arrête les relances. Réglages dans `.env`.

> ⚠️ **Fenêtre 24 h WhatsApp** : Meta/Twilio n'autorisent l'envoi libre que dans les
> 24 h suivant le dernier message du prospect. La relance à 30 min passe ; la relance
> « du lendemain » peut tomber hors fenêtre → en production, elle nécessite un
> **template pré-approuvé** par le fournisseur. Sinon l'envoi échoue (c'est journalisé).

## Personnalisation

- **Ton / identité de l'agent** → `config/prompts.yaml`
- **Infos entreprise** → `config/business.yaml`
- **Base de connaissances** → déposez vos fichiers dans `knowledge/` puis intégrez
  leur contenu utile dans la section « Informations sur l'entreprise » de `prompts.yaml`
- **Modèle Claude** → variable `ANTHROPIC_MODEL` du `.env` (défaut : `claude-sonnet-5`)
- **Outils métier** → `agent/tools.py` (stubs à brancher sur votre CRM / agenda)

## Déploiement (Railway)

1. Poussez le projet sur un dépôt GitHub.
2. Railway → New Project → Deploy from GitHub repo.
3. Renseignez les variables d'environnement (`ANTHROPIC_API_KEY`, `WHATSAPP_PROVIDER`,
   identifiants du fournisseur, `ENVIRONMENT=production`, `DATABASE_URL` PostgreSQL).
4. Configurez l'URL de webhook chez votre fournisseur :
   `https://<votre-app>.up.railway.app/webhook`.

## Sécurité

- Le fichier `.env` (clés API) est **exclu de git** — ne le commitez jamais.
- Le dossier `knowledge/` (données privées) est également exclu (sauf `.gitkeep`).
