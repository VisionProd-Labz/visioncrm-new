# 📋 Commandes Utiles - VisionCRM

## 🚀 **Développement**

### Démarrer l'application
```bash
pnpm dev
```
→ Ouvre http://localhost:3000

### Build production
```bash
pnpm build
pnpm start
```

### Vérifier le code
```bash
pnpm lint          # ESLint
pnpm type-check    # TypeScript
pnpm format        # Prettier
```

---

## 💾 **Base de données**

### Prisma Studio (GUI)
```bash
pnpm prisma studio
```
→ Ouvre http://localhost:5555

### Migrations
```bash
# Créer une nouvelle migration
pnpm prisma migrate dev --name description

# Appliquer les migrations en prod
pnpm prisma migrate deploy

# Reset database (DEV ONLY!)
pnpm prisma migrate reset
```

### Seed data
```bash
pnpm prisma db seed
```

### Régénérer le client Prisma
```bash
pnpm prisma generate
```

---

## 🧪 **Tests**

### Unit tests
```bash
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
```

### E2E tests (Playwright)
```bash
pnpm test:e2e          # Headless
pnpm test:e2e:ui       # UI mode
```

---

## 📦 **Dépendances**

### Installer
```bash
pnpm install
```

### Ajouter un package
```bash
pnpm add package-name
pnpm add -D package-name  # Dev dependency
```

### Mettre à jour
```bash
pnpm update
```

---

## 🔑 **Compte Demo**

**Login:**
```
Email: demo@visioncrm.app
Password: demo123456!
```

**Tenant:**
```
Subdomain: demo
Name: Garage Demo
Plan: PRO
```

---

## 🌐 **URLs Importantes**

### Local
- App: http://localhost:3000
- Prisma Studio: http://localhost:5555
- API: http://localhost:3000/api

### Production (quand déployé)
- App: https://demo.visioncrm.app
- Dashboard Supabase: https://supabase.com/dashboard
- Dashboard Vercel: https://vercel.com/dashboard

---

## 🐛 **Debugging**

### Voir les logs Prisma
```bash
# Dans .env.local
DATABASE_URL="...?connection_limit=1&pool_timeout=20&schema=public&log=query"
```

### Clear cache Next.js
```bash
Remove-Item -Recurse -Force .next
pnpm dev
```

### Restart Supabase pooler
```
1. Aller dans Supabase Dashboard
2. Settings → Database → Connection Pooler
3. Restart Pooler
```

---

## 📊 **Monitoring**

### Check database
```bash
# Dans Supabase SQL Editor
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Check tables created
```bash
pnpm prisma db execute --stdin < query.sql
```

---

## 🚢 **Déploiement**

### Vercel (Recommandé)
```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

### Variables d'environnement
```bash
# Ajouter une variable
vercel env add GEMINI_API_KEY

# Pull les variables
vercel env pull
```

---

## 🔧 **Utilitaires**

### Generate UUID
```bash
# Node
node -e "console.log(require('crypto').randomUUID())"
```

### Generate secret
```bash
# Windows PowerShell
openssl rand -base64 32
```

### Check port 3000
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
```

---

## 📝 **Git**

### Workflow standard
```bash
git status
git add .
git commit -m "feat: description"
git push
```

### Branches
```bash
git checkout -b feature/nom-feature
git checkout main
git merge feature/nom-feature
```

---

## 💡 **Astuces**

### Hot reload pas marche?
```bash
# Restart dev server
Ctrl+C
pnpm dev
```

### Erreur Prisma client?
```bash
pnpm prisma generate
# Restart VSCode
```

### Supprimer node_modules
```bash
Remove-Item -Recurse -Force node_modules
pnpm install
```

---

## 📞 **Support**

- **PRD:** `docs/PRD.md`
- **Progress:** `docs/PROGRESS_UPDATE.md`
- **Architecture:** `docs/IMPLEMENTATION_STATUS.md`
- **Fix Prisma:** `FIX_STEPS.md`

---

**Bon développement! 🚀**
