# 🔧 FIX COMPLET - Problème Prisma UUID vs TEXT

## ✅ **Étape 1: Schema Prisma corrigé**
Le fichier `prisma/schema.prisma` a été mis à jour avec `@db.Uuid` sur TOUS les id et foreign keys.

---

## 🗄️ **Étape 2: Nettoyer Supabase**

### A. Aller dans Supabase SQL Editor
1. Ouvrir https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **SQL Editor** (menu de gauche)

### B. Copier/Coller le script
Ouvrir `supabase_fix.sql` et copier tout le contenu, puis l'exécuter dans SQL Editor.

**OU** exécuter directement ces commandes:

```sql
-- Nettoyer toutes les tables
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.webhooks CASCADE;
DROP TABLE IF EXISTS public.ai_usage CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.service_records CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.user_consents CASCADE;
DROP TABLE IF EXISTS public.verification_tokens CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.contacts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- Drop enums
DROP TYPE IF EXISTS public.activity_type CASCADE;
DROP TYPE IF EXISTS public.priority CASCADE;
DROP TYPE IF EXISTS public.task_status CASCADE;
DROP TYPE IF EXISTS public.payment_method CASCADE;
DROP TYPE IF EXISTS public.invoice_status CASCADE;
DROP TYPE IF EXISTS public.quote_status CASCADE;
DROP TYPE IF EXISTS public.role CASCADE;
DROP TYPE IF EXISTS public.plan CASCADE;

-- Enable extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### C. Vérifier le résultat
Vous devriez voir: `✅ Success. No rows returned`

---

## 🔄 **Étape 3: Recréer avec Prisma**

### A. Supprimer le dossier migrations existant
```bash
# Windows PowerShell
Remove-Item -Recurse -Force prisma\migrations
```

### B. Générer le client Prisma
```bash
pnpm prisma generate
```

### C. Créer la migration initiale
```bash
pnpm prisma migrate dev --name init
```

**Réponse attendue:**
- Prisma va créer toutes les tables avec les types UUID corrects
- Pas d'erreur de type mismatch
- Success message

### D. Seed la base avec données demo
```bash
pnpm prisma db seed
```

**Résultat attendu:**
```
🌱 Seeding database...
✅ Created tenant: Garage Demo
✅ Created user: demo@visioncrm.app
✅ Created contacts
✅ Created vehicles
...
🎉 Seeding complete!
```

---

## 🧪 **Étape 4: Vérifier**

### A. Ouvrir Prisma Studio
```bash
pnpm prisma studio
```

### B. Vérifier les données
- Onglet `tenants`: 1 tenant "Garage Demo"
- Onglet `users`: 1 user "demo@visioncrm.app"
- Onglet `contacts`: 2 contacts
- Onglet `vehicles`: 2 véhicules

### C. Tester l'application
```bash
pnpm dev
```

Ouvrir http://localhost:3000

---

## 🚀 **Étape 5: Lancer l'app**

```bash
pnpm dev
```

**Login demo:**
- Email: `demo@visioncrm.app`
- Password: `demo123456!`

---

## ⚠️ **En cas d'erreur**

### Erreur: "relation does not exist"
→ La migration n'a pas créé les tables
```bash
pnpm prisma migrate reset --force
pnpm prisma migrate dev --name init
```

### Erreur: "type mismatch" persiste
→ Supabase cache ancien schema
1. Aller dans Supabase Dashboard
2. Settings → Database → Connection Pooler
3. Restart pooler
4. Réessayer `pnpm prisma migrate dev`

### Erreur: "constraint already exists"
→ Tables pas complètement nettoyées
1. Retourner dans SQL Editor Supabase
2. Réexécuter le script de nettoyage complet
3. Réessayer

---

## ✅ **Checklist finale**

- [ ] Schema.prisma a `@db.Uuid` partout
- [ ] SQL nettoyage exécuté dans Supabase
- [ ] Ancien dossier migrations supprimé
- [ ] `pnpm prisma generate` OK
- [ ] `pnpm prisma migrate dev --name init` OK
- [ ] `pnpm prisma db seed` OK
- [ ] Prisma Studio montre les données demo
- [ ] `pnpm dev` lance l'app
- [ ] Login avec demo@visioncrm.app fonctionne

---

## 🎯 **Résultat attendu**

Database propre avec:
- ✅ TOUS les IDs en UUID (pas text)
- ✅ TOUTES les FK en UUID
- ✅ Données demo chargées
- ✅ Multi-tenancy fonctionnel
- ✅ Prêt pour dev

**Temps estimé:** 5 minutes max

---

**Si toujours bloqué, copie l'erreur exacte et je debug.**
