# 🚀 GUIDE DE DÉPLOIEMENT PRODUCTION

## 📋 PRÉ-REQUIS

### 1. Base de données PostgreSQL en production

**Option A: Supabase (Recommandé - Gratuit)**
1. Aller sur https://supabase.com
2. Créer un compte et un nouveau projet
3. Récupérer la `Connection String` (onglet Settings > Database)
4. Format: `postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`

**Option B: Neon (Gratuit)**
1. Aller sur https://neon.tech
2. Créer un projet PostgreSQL
3. Récupérer la connection string

**Option C: Railway (Payant mais simple)**
1. Aller sur https://railway.app
2. Créer un nouveau projet PostgreSQL
3. Récupérer la DATABASE_URL

---

## 🎯 OPTION 1: VERCEL (RECOMMANDÉ - 5 MIN)

### Avantages
- ✅ Déploiement automatique depuis GitHub
- ✅ HTTPS automatique
- ✅ Edge Functions rapides
- ✅ Gratuit jusqu'à 100GB bandwidth/mois
- ✅ Domaine .vercel.app inclus

### Étapes

#### 1. Préparer le projet

```bash
# S'assurer que tout est commité
git add .
git commit -m "Production ready"
git push origin main
```

#### 2. Créer un compte Vercel
1. Aller sur https://vercel.com/signup
2. Se connecter avec GitHub
3. Autoriser l'accès au repository

#### 3. Importer le projet
1. Cliquer sur "Add New..." > "Project"
2. Sélectionner le repository `visioncrm`
3. Configuration automatique détectée ✓

#### 4. Configurer les variables d'environnement

**IMPORTANT:** Ajouter ces variables dans Vercel:

```env
# Base de données (de Supabase/Neon)
DATABASE_URL=postgresql://...

# Auth - GÉNÉRER UN NOUVEAU SECRET!
AUTH_SECRET=
AUTH_URL=https://votre-app.vercel.app

# Node (Important pour Prisma)
NODE_VERSION=20

# Email (optionnel)
RESEND_API_KEY=
```

**Générer AUTH_SECRET:**
```bash
# Dans votre terminal local
openssl rand -base64 32
```

Copier le résultat dans Vercel > Settings > Environment Variables

#### 5. Déployer

1. Cliquer sur "Deploy"
2. Attendre 2-3 minutes
3. ✅ Votre app sera en ligne!

#### 6. Migrer la base de données

**Option A: Depuis votre terminal local**
```bash
# Définir DATABASE_URL dans .env
DATABASE_URL="postgresql://..." pnpm prisma migrate deploy
```

**Option B: Via Vercel CLI**
```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer les migrations
vercel env pull .env.production
pnpm prisma migrate deploy
```

#### 7. Configurer un domaine personnalisé (optionnel)

1. Vercel > Settings > Domains
2. Ajouter votre domaine
3. Configurer les DNS selon les instructions

---

## 🐳 OPTION 2: DOCKER + VPS

### Prérequis
- Serveur Ubuntu/Debian (DigitalOcean, Hetzner, OVH)
- Docker et Docker Compose installés

### Étapes

#### 1. Créer `.env.production` sur le serveur

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_URL=https://votre-domaine.com
RESEND_API_KEY=...
```

#### 2. Déployer avec Docker Compose

```bash
# Sur le serveur
git clone https://github.com/votre-username/visioncrm.git
cd visioncrm

# Copier .env
cp .env.production .env

# Lancer
docker-compose -f docker-compose.prod.yml up -d

# Migrer la base
docker-compose -f docker-compose.prod.yml exec app pnpm prisma migrate deploy
```

#### 3. Configurer Nginx (reverse proxy)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 4. Installer SSL avec Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

---

## 🔥 OPTION 3: DÉPLOIEMENT RAPIDE (Node.js)

### Sur n'importe quel serveur avec Node.js

```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/visioncrm.git
cd visioncrm

# 2. Installer les dépendances
pnpm install --prod

# 3. Configurer .env
cat > .env << EOF
DATABASE_URL=postgresql://...
AUTH_SECRET=$(openssl rand -base64 32)
AUTH_URL=https://votre-ip:3000
NODE_ENV=production
EOF

# 4. Build
pnpm build

# 5. Migrer la DB
pnpm prisma migrate deploy

# 6. Lancer avec PM2
npm install -g pm2
pm2 start npm --name "visioncrm" -- start
pm2 save
pm2 startup
```

---

## ✅ POST-DÉPLOIEMENT

### 1. Créer le premier compte admin

```bash
# Via Prisma Studio
pnpm prisma studio

# Ou créer directement en SQL
psql $DATABASE_URL << EOF
INSERT INTO tenants (id, name, subdomain, plan)
VALUES (gen_random_uuid(), 'Ma Société', 'demo', 'PRO');

INSERT INTO users (id, tenant_id, email, name, role, email_verified)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM tenants WHERE subdomain = 'demo'),
  'admin@votresociete.com',
  'Admin',
  'OWNER',
  NOW()
);
EOF
```

### 2. Tester l'application

1. Aller sur votre URL
2. Login avec l'email admin
3. Utiliser "Mot de passe oublié" pour définir le mot de passe
4. Vérifier:
   - ✅ Dashboard charge
   - ✅ Contacts fonctionnent
   - ✅ Devis/Factures créent
   - ✅ Planning s'affiche

### 3. Configurer les emails (optionnel)

1. Créer un compte sur https://resend.com (gratuit 100 emails/jour)
2. Récupérer l'API key
3. Ajouter `RESEND_API_KEY` dans les variables d'environnement
4. Redéployer

---

## 🔒 SÉCURITÉ

### Checklist avant production

- [ ] `AUTH_SECRET` est un secret aléatoire fort (32+ caractères)
- [ ] `DATABASE_URL` contient `sslmode=require`
- [ ] `.env` n'est PAS committé dans Git (vérifier `.gitignore`)
- [ ] Toutes les variables sensibles sont dans l'environnement de déploiement
- [ ] HTTPS est activé (via Vercel ou Certbot)
- [ ] Backups automatiques de la DB configurés

---

## 📊 MONITORING

### Logs

**Vercel:**
```bash
vercel logs
```

**Docker:**
```bash
docker-compose logs -f app
```

**PM2:**
```bash
pm2 logs visioncrm
```

### Métriques

Vercel inclut automatiquement:
- Analytics
- Web Vitals
- Error tracking

---

## 🆘 DÉPANNAGE

### Erreur "Database connection failed"

```bash
# Tester la connexion DB
psql $DATABASE_URL -c "SELECT 1"

# Vérifier que les migrations sont appliquées
pnpm prisma migrate status
```

### Erreur "Auth callback error"

- Vérifier que `AUTH_URL` correspond exactement à votre domaine
- S'assurer que `AUTH_SECRET` est défini

### Build échoue sur Vercel

- Vérifier que `NODE_VERSION=20` est défini
- Vérifier les logs de build
- Tester le build localement: `pnpm build`

---

## 🎯 RECOMMANDATION FINALE

Pour aller en prod AUJOURD'HUI:

1. **Créer une DB sur Supabase** (2 min)
2. **Déployer sur Vercel** (5 min)
3. **Migrer la DB** (1 min)
4. **Créer le compte admin** (2 min)

**Total: ~10 minutes pour être en ligne!**

Vercel est gratuit, automatique et inclut HTTPS + monitoring.

---

Besoin d'aide? Le support Vercel répond en ~1h sur Discord.
