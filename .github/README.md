# GitHub Actions CI/CD Setup

Ce document explique comment configurer le pipeline CI/CD GitHub Actions pour VisionCRM.

## 📋 Vue d'ensemble

Le workflow CI/CD comprend 5 jobs :

1. **Lint & Type Check** - ESLint + TypeScript build
2. **E2E Tests** - Tests Playwright avec PostgreSQL
3. **Security Audit** - npm audit + détection de secrets
4. **Deploy Staging** - Déploiement automatique sur la branche `develop`
5. **Deploy Production** - Déploiement automatique sur la branche `main`

## 🔑 Configuration des secrets GitHub

### Étape 1 : Obtenir les tokens Vercel

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Se connecter à Vercel
vercel login

# 3. Lier le projet (à la racine du repo)
cd /path/to/visioncrm
vercel link

# 4. Récupérer les IDs
cat .vercel/project.json
```

Vous obtiendrez :
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

### Étape 2 : Créer un token Vercel

1. Aller sur [https://vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Cliquer sur **"Create Token"**
3. Nom : `GitHub Actions CI/CD`
4. Scope : `Full Account`
5. Expiration : `No Expiration` (ou 1 an)
6. Copier le token (commence par `vercel_...`)

### Étape 3 : Ajouter les secrets dans GitHub

1. Aller sur GitHub : `https://github.com/VisionProd-Labz/visioncrm-new/settings/secrets/actions`
2. Cliquer sur **"New repository secret"**
3. Ajouter les secrets suivants :

#### Secrets Vercel (obligatoires)

| Nom du secret | Valeur | Exemple |
|---------------|--------|---------|
| `VERCEL_TOKEN` | Token Vercel (étape 2) | `vercel_abc123...` |
| `VERCEL_ORG_ID` | Org ID (étape 1) | `team_xxxxxxxxxxxxx` |
| `VERCEL_PROJECT_ID` | Project ID (étape 1) | `prj_xxxxxxxxxxxxx` |

#### Secrets Staging (optionnels)

Ces secrets sont utilisés pour l'environnement staging uniquement :

| Nom du secret | Valeur | Description |
|---------------|--------|-------------|
| `STAGING_DATABASE_URL` | `postgresql://user:pass@host:5432/db` | URL de la DB staging |
| `STAGING_NEXTAUTH_SECRET` | `random_32_chars` | Secret NextAuth staging |
| `STAGING_NEXTAUTH_URL` | `https://staging.visioncrm.app` | URL staging |

**Note :** Si vous n'utilisez pas de staging séparé, ces secrets ne sont pas nécessaires. Vercel utilisera les variables d'environnement configurées dans le dashboard.

### Étape 4 : Vérifier la configuration

```bash
# Push vers develop pour tester le staging deploy
git checkout -b develop
git push origin develop

# Vérifier le workflow
# GitHub → Actions → CI/CD Pipeline
```

## 🔒 Sécurité

Le workflow inclut plusieurs vérifications de sécurité :

- **npm audit** - Vérifie les dépendances pour les vulnérabilités HIGH/CRITICAL
- **Secret detection** - Scanne le code pour des clés API hardcodées
- **Type checking** - Valide tous les types TypeScript

## 📊 Badges de statut

Ajoutez ces badges dans votre README.md :

```markdown
[![CI/CD Pipeline](https://github.com/VisionProd-Labz/visioncrm-new/actions/workflows/ci.yml/badge.svg)](https://github.com/VisionProd-Labz/visioncrm-new/actions/workflows/ci.yml)
```

## 🚀 Déploiement

### Déploiement automatique

- **Staging** : Push vers `develop` → Déploiement automatique
- **Production** : Push vers `main` → Déploiement automatique (nécessite approbation manuelle)

### Déploiement manuel

```bash
# Déclencher manuellement via GitHub UI
# GitHub → Actions → CI/CD Pipeline → Run workflow
```

## 🐛 Troubleshooting

### Erreur : "Error: No Vercel token found"

**Solution :** Vérifier que `VERCEL_TOKEN` est configuré dans les secrets GitHub.

### Erreur : "Error: Project not found"

**Solution :** Vérifier `VERCEL_ORG_ID` et `VERCEL_PROJECT_ID`.

### Tests E2E échouent en CI

**Solution :** Vérifier que le seed de test fonctionne correctement :

```bash
# Localement
export DATABASE_URL="postgresql://postgres:password@localhost:5432/test"
pnpm prisma migrate deploy
pnpm db:seed:test
```

### Build timeout

**Solution :** Augmenter le timeout dans le workflow :

```yaml
- name: Build application
  run: pnpm run build
  timeout-minutes: 15  # Augmenter de 10 à 15 minutes
```

## 📝 Variables d'environnement

### Variables requises pour le build

- `DATABASE_URL` - URL PostgreSQL
- `DIRECT_URL` - URL directe PostgreSQL (sans pooling)
- `NEXTAUTH_SECRET` - Secret NextAuth (32+ caractères)
- `NEXTAUTH_URL` - URL de l'application

### Variables optionnelles

- `SENTRY_DSN` - Pour error tracking
- `SENTRY_AUTH_TOKEN` - Pour upload des source maps
- `STRIPE_SECRET_KEY` - Pour les paiements
- `EMAIL_SERVER_HOST` - Pour les emails

## 🔗 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)

---

**Version:** 1.0
**Dernière mise à jour:** Janvier 2026
