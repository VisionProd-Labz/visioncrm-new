# ✅ CHECKLIST DÉPLOIEMENT PRODUCTION

## AVANT DE DÉPLOYER

### 1. Base de données (5 min)
- [ ] Créer un compte Supabase: https://supabase.com
- [ ] Créer un nouveau projet PostgreSQL
- [ ] Noter la `DATABASE_URL` (Settings > Database > Connection String)
- [ ] Vérifier que la connexion fonctionne localement

### 2. Variables d'environnement
- [ ] Générer `AUTH_SECRET`: `openssl rand -base64 32`
- [ ] Préparer `AUTH_URL` (sera l'URL Vercel)
- [ ] (Optionnel) Créer compte Resend.com pour emails

---

## DÉPLOIEMENT VERCEL (10 MIN)

### 3. Préparer le code
- [ ] Vérifier que le build passe: `npm run build`
- [ ] Commit et push final:
```bash
git add .
git commit -m "Production ready - MVP"
git push origin main
```

### 4. Créer compte Vercel
- [ ] Aller sur https://vercel.com/signup
- [ ] Se connecter avec GitHub
- [ ] Autoriser l'accès au repository

### 5. Importer le projet
- [ ] Cliquer "Add New..." > "Project"
- [ ] Sélectionner `visioncrm`
- [ ] Framework: Next.js (auto-détecté) ✓

### 6. Configurer les variables
Ajouter dans Vercel > Environment Variables:

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@...
AUTH_SECRET=[généré avec openssl]
AUTH_URL=https://[votre-app].vercel.app
NODE_VERSION=20
```

- [ ] `DATABASE_URL` ajoutée
- [ ] `AUTH_SECRET` ajouté (32+ caractères)
- [ ] `AUTH_URL` ajouté
- [ ] `NODE_VERSION=20` ajouté

### 7. Déployer
- [ ] Cliquer "Deploy"
- [ ] Attendre 2-3 minutes
- [ ] Vérifier que le déploiement est réussi ✓

### 8. Récupérer l'URL
- [ ] Noter l'URL: `https://[votre-app].vercel.app`
- [ ] Mettre à jour `AUTH_URL` avec cette URL exacte
- [ ] Redéployer si nécessaire

---

## POST-DÉPLOIEMENT

### 9. Migrer la base de données

**Option A: Localement**
```bash
DATABASE_URL="[votre-supabase-url]" pnpm prisma migrate deploy
```

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel env pull .env.production
pnpm prisma migrate deploy
```

- [ ] Migrations appliquées avec succès

### 10. Créer le compte admin

**Via Supabase SQL Editor:**
```sql
-- 1. Créer le tenant
INSERT INTO tenants (id, name, subdomain, plan)
VALUES (gen_random_uuid(), 'Ma Société', 'demo', 'PRO');

-- 2. Créer l'utilisateur admin
INSERT INTO users (id, tenant_id, email, name, role, email_verified)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM tenants WHERE subdomain = 'demo'),
  'admin@votresociete.com',
  'Admin Principal',
  'OWNER',
  NOW()
);
```

- [ ] Tenant créé
- [ ] Utilisateur admin créé
- [ ] Email admin noté: __________________

### 11. Définir le mot de passe
1. Aller sur `https://[votre-app].vercel.app`
2. Cliquer "Se connecter"
3. Entrer l'email admin
4. Cliquer "Mot de passe oublié"
5. Vérifier les logs Vercel pour le lien de réinitialisation
6. Définir un mot de passe fort

- [ ] Mot de passe défini

---

## TESTS DE VALIDATION

### 12. Tester l'application

- [ ] **Login:** Se connecter avec le compte admin
- [ ] **Dashboard:** Vérifier que le dashboard charge
- [ ] **Contacts:** Créer un contact de test
- [ ] **Devis:** Créer un devis
- [ ] **Planning:** Vérifier que le calendrier s'affiche
- [ ] **Comptabilité:** Accéder aux modules
- [ ] **Settings:** Modifier les infos de l'entreprise

### 13. Vérifier les performances
- [ ] Page d'accueil charge en < 2s
- [ ] Pas d'erreurs dans la console navigateur
- [ ] Pas d'erreurs dans les logs Vercel

---

## CONFIGURATION OPTIONNELLE

### 14. Domaine personnalisé (optionnel)
- [ ] Vercel > Settings > Domains
- [ ] Ajouter votre domaine
- [ ] Configurer les DNS (A ou CNAME)
- [ ] Mettre à jour `AUTH_URL`

### 15. Emails (optionnel)
- [ ] Créer compte Resend.com
- [ ] Récupérer API key
- [ ] Ajouter `RESEND_API_KEY` dans Vercel
- [ ] Tester l'envoi d'email

### 16. Monitoring
- [ ] Activer Vercel Analytics
- [ ] Configurer les alertes d'erreur
- [ ] Vérifier les Web Vitals

---

## SÉCURITÉ

### 17. Checklist sécurité
- [ ] `AUTH_SECRET` est unique et fort (32+ caractères)
- [ ] `DATABASE_URL` contient `sslmode=require`
- [ ] HTTPS activé (automatique sur Vercel)
- [ ] `.env` non committé (vérifier `.gitignore`)
- [ ] Backups DB activés sur Supabase

---

## 🎉 PRODUCTION READY!

### Étapes suivantes recommandées:

1. **Communiquer l'URL** aux utilisateurs
2. **Créer une documentation utilisateur** basique
3. **Planifier des backups** hebdomadaires
4. **Monitorer les performances** les premiers jours
5. **Collecter les retours** utilisateurs

---

## 📞 Support

**Problèmes Vercel:**
- Dashboard: https://vercel.com/dashboard
- Logs: `vercel logs`
- Support: https://vercel.com/help

**Problèmes DB:**
- Supabase Dashboard: https://supabase.com/dashboard
- SQL Editor pour requêtes manuelles

**Problèmes App:**
- Vérifier logs Vercel
- Tester build localement: `npm run build`
- Consulter `DEPLOIEMENT.md` pour dépannage

---

## ⏱️ TEMPS ESTIMÉ

- Configuration Supabase: **5 min**
- Déploiement Vercel: **5 min**
- Migration DB: **2 min**
- Création admin: **2 min**
- Tests: **5 min**

**TOTAL: ~20 minutes maximum**

Bon déploiement! 🚀
