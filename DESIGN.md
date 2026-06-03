# Rockstone IM — Refonte 2026 → 2027

Site vitrine du Multi-Family Office immobilier, reconstruit en **Next.js 16 +
React 19 + Tailwind v4 (TypeScript)**, avec l'agent conversationnel **Adam** et
une intégration WhatsApp.

## Direction artistique

Identité **luxe sombre & or** issue de la charte graphique (v2), avec **mode
jour + mode nuit**. Sobre, crédible, intemporel.

### Design tokens (sémantiques, theme-aware)

Définis dans `src/app/globals.css`. Les couleurs de surface/texte basculent
selon le thème ; l'or et les pastels d'état sont partagés.

| Token | 🌙 Nuit | ☀️ Jour |
|---|---|---|
| `canvas` | `#0D0D0D` | `#F5F0E8` |
| `surface` | `#161616` | `#EDE8DE` |
| `card` | `#1C1C1E` | `#FDFAF4` |
| `card-alt` | `#242426` | `#F0EBE0` |
| `line` | `#2C2C2E` | `#E2DDD3` |
| `ink` (texte) | `#E8E4DC` | `#1A1A1A` |
| `muted` | `#8A8A8E` | `#7A7570` |
| `faint` | `#48484C` | `#C0BAB0` |
| `gold` | `#C9A96E` | `#C9A96E` |

- **Polices** : Cormorant Garamond (titres), DM Sans (corps), Bebas Neue (chiffres).
- **Thème** : `dark` par défaut, bascule via `ThemeToggle`, persistée en
  `localStorage` (`rs-theme`), sans flash grâce au script d'init dans `<head>`.

## Structure de la page d'accueil

`src/app/page.tsx` — pattern « Trust & Authority + Conversion » :
Hero → Chiffres clés → Expertises (Investissement · Conseil · Asset Management)
→ Approche & valeurs (+ encart Innovation IA) → Contact → Footer + widget Adam.

## Agent Adam (état actuel)

`src/components/AdamConcierge.tsx` — widget concierge flottant : panneau de chat
élégant, réponses rapides, et bouton **« Continuer sur WhatsApp »** qui
transmet la conversation via un lien `wa.me` pré-rempli (`src/lib/site.ts`).

> Le panneau on-site est aujourd'hui une **démo d'interface** ; la prochaine
> étape connecte Adam à l'IA + WhatsApp Business Cloud API.

## Prochaine étape — WhatsApp Business Cloud API (Meta)

Pour qu'Adam réponde **directement dans WhatsApp**, il faut côté Rockstone :

1. Un **compte Meta Business vérifié** (business.facebook.com).
2. L'app **WhatsApp** dans developers.facebook.com → récupérer
   `PHONE_NUMBER_ID`, `BUSINESS_ACCOUNT_ID`, `ACCESS_TOKEN` (permanent),
   définir un `VERIFY_TOKEN` et `APP_SECRET`.
3. Un **numéro dédié** WhatsApp Business (différent du standard).
4. Une **clé API IA** (ex. Anthropic Claude) pour les réponses d'Adam.

Voir `.env.example`. Le webhook (`/api/whatsapp`) et la logique IA seront
ajoutés à l'étape suivante.

## Développement

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
```
