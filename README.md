# VisionCRM

CRM moderne pour la gestion de véhicules, devis, factures et comptabilité.

## Stack Technique

- **Frontend:** Next.js 15.5.9, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de données:** PostgreSQL
- **Auth:** Auth.js v5
- **UI:** shadcn/ui

## Installation Locale

```bash
# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Migrer la base de données
pnpm prisma migrate deploy

# Lancer en développement
pnpm dev

# Build production
pnpm build
pnpm start
```

## Variables d'Environnement Requises

```env
# Base de données
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Auth
AUTH_SECRET=votre-secret-aleatoire-securise
AUTH_URL=https://votre-domaine.com

# Email (optionnel)
RESEND_API_KEY=re_...
```

## Déploiement

Compatible avec Vercel, Docker, ou serveur Node.js.

Voir `.env.example` pour la configuration complète.

## Licence

Propriétaire
