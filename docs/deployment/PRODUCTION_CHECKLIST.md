# Checklist de déploiement production - VisionCRM

Checklist complète à suivre avant le déploiement en production de VisionCRM.

## 📋 Vue d'ensemble

- **Objectif**: Lancement beta avec 5-10 clients pilotes
- **Timeline**: Phase 3 - Q1 2026
- **Environnement cible**: Production (app.visioncrm.com)
- **Stack**: Next.js 15 + PostgreSQL + Vercel/AWS

---

## ✅ Checklist par catégorie

### 1. Code et qualité

#### Build et compilation
- [ ] `pnpm run build` réussit sans erreurs
- [ ] `pnpm run lint` passe sans erreurs critiques
- [ ] `pnpm run type-check` (si séparé) valide tous les types
- [ ] Aucun warning TypeScript bloquant
- [ ] Bundle size < 300 KB (First Load JS)

#### Tests
- [ ] Tests E2E Playwright passent (100% success rate)
  ```bash
  pnpm exec playwright test
  ```
- [ ] Tests unitaires passent (si implémentés)
- [ ] Tests d'intégration API passent
- [ ] Couverture minimale: 70% sur routes critiques

#### Code quality
- [ ] Pas de `console.log()` non nécessaires
- [ ] Pas de TODO bloquants
- [ ] Pas de code commenté inutilement
- [ ] Pas de secrets/credentials hardcodés
- [ ] ESLint rules respectées

---

### 2. Variables d'environnement

#### Fichiers .env
- [ ] `.env.production` créé et rempli
- [ ] `.env.example` à jour avec toutes les variables
- [ ] `.env`, `.env.local` dans `.gitignore`
- [ ] Aucun secret commité dans git

#### Variables obligatoires production
- [ ] `DATABASE_URL` - PostgreSQL production
- [ ] `DIRECT_URL` - Connection pooling
- [ ] `NEXTAUTH_URL` - `https://app.visioncrm.com`
- [ ] `NEXTAUTH_SECRET` - Secret 32+ caractères random
- [ ] `EMAIL_SERVER_HOST` - SMTP server
- [ ] `EMAIL_SERVER_PORT` - SMTP port
- [ ] `EMAIL_SERVER_USER` - SMTP user
- [ ] `EMAIL_SERVER_PASSWORD` - SMTP password
- [ ] `EMAIL_FROM` - `noreply@visioncrm.com`

#### Variables optionnelles mais recommandées
- [ ] `SENTRY_DSN` - Error tracking
- [ ] `SENTRY_AUTH_TOKEN` - Sentry uploads
- [ ] `STRIPE_SECRET_KEY` - Paiements (si activé)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhooks Stripe
- [ ] `NODE_ENV=production`
- [ ] `VERCEL_ENV=production` (si Vercel)

#### Vérification
```bash
# Script de validation des env vars
node scripts/validate-env.js
```

---

### 3. Base de données

#### Configuration PostgreSQL
- [ ] Base de données production créée
- [ ] User PostgreSQL avec droits appropriés
- [ ] SSL/TLS activé pour connexions
- [ ] Connection pooling configuré (PgBouncer/Supabase)
- [ ] Backups automatiques activés (quotidiens minimum)
- [ ] Point-in-time recovery configuré

#### Migrations Prisma
- [ ] Toutes migrations testées en staging
- [ ] `prisma migrate deploy` en production
- [ ] Seed data initial (si nécessaire)
  ```bash
  npx prisma migrate deploy
  npx prisma db seed
  ```
- [ ] Schéma vérifié: `npx prisma db pull`

#### Performance
- [ ] Index créés sur colonnes fréquemment requêtées
- [ ] Queries optimisées (explain analyze)
- [ ] Connection pool size approprié (10-20)
- [ ] Timeout query configuré (30s max)

#### Sécurité base de données
- [ ] Mot de passe fort (32+ caractères)
- [ ] IP whitelisting configuré
- [ ] Accès réseau restreint (VPC si possible)
- [ ] Chiffrement at-rest activé
- [ ] Logs d'audit activés

---

### 4. Sécurité application

#### Authentification
- [ ] NextAuth.js correctement configuré
- [ ] Secret NEXTAUTH_SECRET unique et sécurisé
- [ ] Session timeout approprié (24h max)
- [ ] Cookie samesite=strict
- [ ] CSRF protection activée
- [ ] Rate limiting sur login (max 5 tentatives)

#### Mots de passe
- [ ] bcrypt avec cost factor ≥ 12
- [ ] Validation force mot de passe (zod schema)
- [ ] Reset password sécurisé (token expiration 1h)
- [ ] Email verification obligatoire

#### Headers sécurité
```javascript
// next.config.js
headers: [
  {
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ..."
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      }
    ]
  }
]
```
- [ ] Tous headers sécurité configurés
- [ ] CSP (Content Security Policy) définie
- [ ] HSTS activé

#### HTTPS/SSL
- [ ] Certificat SSL valide
- [ ] Redirection HTTP → HTTPS automatique
- [ ] HSTS header configuré
- [ ] Certificat auto-renewal (Let's Encrypt)

#### API Security
- [ ] Rate limiting sur toutes routes API (100 req/min)
- [ ] Input validation (Zod) sur toutes requêtes
- [ ] Output sanitization (XSS protection)
- [ ] SQL injection protection (Prisma ORM)
- [ ] CORS correctement configuré

#### Secrets et credentials
- [ ] Aucun secret dans le code source
- [ ] Variables d'environnement pour tous secrets
- [ ] .env* dans .gitignore
- [ ] Audit git history pour secrets accidentels
  ```bash
  git secrets --scan
  ```

---

### 5. RGPD et conformité

#### Obligations légales
- [ ] Politique de confidentialité publiée
- [ ] CGU/CGV publiées
- [ ] Mentions légales complètes
- [ ] Cookie banner (consentement)
- [ ] DPO désigné (si nécessaire)

#### Fonctionnalités RGPD
- [ ] Export données utilisateur (JSON)
- [ ] Suppression compte et données
- [ ] Gestion des consentements
- [ ] Registre des traitements
- [ ] Email opt-in/opt-out

#### Documentation compliance
- [ ] Privacy policy accessible (/legal/privacy-policy)
- [ ] Terms of service accessibles (/legal/terms)
- [ ] Cookie policy accessible (/legal/cookies)
- [ ] RGPD info page accessible (/legal/rgpd)

---

### 6. Performance

#### Optimisations Next.js
- [ ] Images optimisées (next/image)
- [ ] Fonts optimisées (next/font)
- [ ] Code splitting automatique activé
- [ ] Tree shaking configuré
- [ ] Compression Gzip/Brotli activée

#### Lighthouse scores cibles
- [ ] Performance: ≥ 90
- [ ] Accessibility: ≥ 95
- [ ] Best Practices: ≥ 95
- [ ] SEO: ≥ 90

#### Métriques Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

#### Caching
- [ ] Static assets cached (immutable, 1 year)
- [ ] API responses cached (quand approprié)
- [ ] CDN configuré (Vercel Edge, CloudFront)
- [ ] Database query caching (Redis si nécessaire)

---

### 7. Monitoring et observabilité

#### Error tracking
- [ ] Sentry configuré et testé
- [ ] Source maps uploadés
- [ ] Error alerts configurées (email/Slack)
- [ ] Error grouping et deduplication

#### Logging
- [ ] Logs structurés (JSON format)
- [ ] Log levels appropriés (info, warn, error)
- [ ] Logs centralisés (Datadog, CloudWatch)
- [ ] Retention policy définie (30 jours min)

#### Métriques
- [ ] APM configuré (Application Performance Monitoring)
- [ ] Database query monitoring
- [ ] API latency tracking
- [ ] Memory/CPU usage alerts

#### Uptime monitoring
- [ ] Service uptime monitoring (UptimeRobot, Pingdom)
- [ ] Health check endpoint (`/api/health`)
- [ ] Status page publique (status.visioncrm.com)
- [ ] Incident notifications (PagerDuty)

#### Dashboards
- [ ] Dashboard temps réel (Vercel Analytics, Datadog)
- [ ] Dashboard erreurs (Sentry)
- [ ] Dashboard business metrics
- [ ] Alertes configurées (thresholds)

---

### 8. Email et communications

#### Configuration SMTP
- [ ] Serveur SMTP production configuré
- [ ] SPF record configuré (DNS)
- [ ] DKIM configuré
- [ ] DMARC policy définie
- [ ] Sender reputation surveillée

#### Templates emails
- [ ] Email verification template
- [ ] Password reset template
- [ ] Quote sent template
- [ ] Invoice sent template
- [ ] Payment reminder template
- [ ] Tous templates testés

#### Deliverability
- [ ] Emails testés dans tous clients (Gmail, Outlook, etc.)
- [ ] Spam score vérifié (mail-tester.com)
- [ ] Unsubscribe link dans tous emails marketing
- [ ] Bounce handling configuré

---

### 9. Infrastructure et déploiement

#### Environnements
- [ ] Production environment configuré
- [ ] Staging environment disponible (pré-prod)
- [ ] Dev environment isolé
- [ ] Branch protection rules (main)

#### CI/CD
- [ ] Pipeline CI/CD configuré (GitHub Actions, Vercel)
- [ ] Tests automatiques sur PR
- [ ] Deploy preview pour chaque PR
- [ ] Auto-deploy main → production

#### Domaines et DNS
- [ ] Domaine principal: app.visioncrm.com
- [ ] Certificat SSL configuré
- [ ] DNS records configurés:
  - [ ] A/AAAA records
  - [ ] CNAME records
  - [ ] MX records (emails)
  - [ ] TXT records (SPF, DKIM, DMARC)
  - [ ] CAA record (Certificate Authority Authorization)

#### Scaling et resources
- [ ] Server resources appropriés (CPU, RAM)
- [ ] Auto-scaling configuré (si cloud)
- [ ] Load balancer configuré (si multi-instance)
- [ ] CDN activé (static assets)

#### Backups
- [ ] Backup base de données (quotidien)
- [ ] Backup fichiers uploadés (si applicable)
- [ ] Backup codes source (git)
- [ ] Procédure de restoration testée
- [ ] Backup retention policy (30 jours min)

---

### 10. Documentation

#### Documentation technique
- [ ] README.md à jour
- [ ] CONTRIBUTING.md si open source
- [ ] API documentation (si API publique)
- [ ] Architecture diagram
- [ ] Deployment guide

#### Documentation utilisateur
- [x] Guide de démarrage rapide
- [x] Guide des fonctionnalités
- [x] FAQ
- [x] Troubleshooting guide
- [x] Feedback guide

#### Runbooks
- [ ] Incident response playbook
- [ ] Backup restoration procedure
- [ ] Database migration procedure
- [ ] Rollback procedure
- [ ] Emergency contacts list

---

### 11. Tests finaux pré-déploiement

#### Tests fonctionnels complets
- [ ] Parcours utilisateur complet (signup → quote → invoice)
- [ ] Tous workflows critiques testés
- [ ] Tous rôles utilisateurs testés (admin, manager, etc.)
- [ ] Gestion d'erreurs testée

#### Tests de charge
- [ ] Load testing (JMeter, k6, Artillery)
- [ ] 100 utilisateurs concurrents supportés
- [ ] Stress testing (limites du système)
- [ ] Spike testing (montée en charge rapide)

#### Tests de sécurité
- [ ] Vulnerability scan (OWASP ZAP, Burp Suite)
- [ ] Penetration testing (si budget)
- [ ] Dependency audit: `npm audit`
- [ ] HTTPS/SSL test (SSL Labs)

#### Tests compatibilité
- [ ] Chrome (dernière version)
- [ ] Firefox (dernière version)
- [ ] Safari (dernière version)
- [ ] Edge (dernière version)
- [ ] Mobile (iOS Safari, Chrome Android)
- [ ] Tablette (iPad, Android tablets)

---

### 12. Communication et support

#### Équipe préparée
- [ ] Support email configuré (beta@visioncrm.com)
- [ ] Procédures support documentées
- [ ] Équipe formée sur le produit
- [ ] Escalation process défini
- [ ] Horaires support communiqués

#### Communication lancement
- [ ] Emails beta testeurs préparés
- [ ] Annonce lancement rédigée
- [ ] Social media posts préparés
- [ ] Press release (si applicable)

#### Assets marketing
- [ ] Screenshots produit à jour
- [ ] Vidéo démo (optionnel)
- [ ] Landing page mise à jour
- [ ] Pricing page finalisée

---

### 13. Post-déploiement immédiat

#### Vérifications J+0 (jour du lancement)
- [ ] Site accessible (app.visioncrm.com)
- [ ] HTTPS fonctionnel (certificat valide)
- [ ] Login fonctionne
- [ ] Signup fonctionne
- [ ] Email verification envoyé
- [ ] Dashboard charge correctement
- [ ] Aucune erreur 500 dans Sentry

#### Monitoring actif
- [ ] Surveiller Sentry (première heure)
- [ ] Surveiller analytics (trafic)
- [ ] Surveiller logs serveur
- [ ] Surveiller database performance
- [ ] Vérifier emails délivrés

#### Support réactif
- [ ] Équipe disponible pour questions
- [ ] Réponse rapide aux premiers utilisateurs
- [ ] Feedback collecté activement
- [ ] Bugs signalés triés et priorisés

---

## 📊 Métriques de succès

### Critères de go-live

**Critères techniques (tous obligatoires):**
- ✅ 0 erreurs critiques (Sentry)
- ✅ Uptime > 99.5% (staging)
- ✅ Tests E2E 100% pass
- ✅ Lighthouse performance > 90
- ✅ Security headers A+ (securityheaders.com)

**Critères fonctionnels:**
- ✅ Tous parcours critiques fonctionnels
- ✅ Emails envoyés et délivrés
- ✅ Paiements testés (test mode)
- ✅ Export PDF fonctionnel

**Critères sécurité:**
- ✅ Penetration test sans vulnérabilités critiques
- ✅ `npm audit` sans high/critical
- ✅ RGPD compliance validée

### KPIs à surveiller semaine 1

**Technique:**
- Uptime (target: 99.9%)
- Error rate (target: < 0.1%)
- Response time API (target: < 500ms p95)
- Database query time (target: < 100ms median)

**Business:**
- Nombre d'inscriptions beta
- Taux d'activation (signup → premier devis)
- Taux de rétention J+7
- NPS (Net Promoter Score) beta testeurs

---

## 🚨 Plan de rollback

### Quand rollback?

**Triggers de rollback automatique:**
- Error rate > 5% pendant 5 minutes
- Uptime < 95% sur 1 heure
- Database inaccessible > 2 minutes

**Triggers de rollback manuel:**
- Vulnérabilité sécurité critique découverte
- Perte de données utilisateur
- Fonctionnalité critique cassée

### Procédure de rollback

```bash
# 1. Rollback code (Vercel)
vercel rollback

# 2. Rollback database migrations (si nécessaire)
npx prisma migrate resolve --rolled-back [migration_name]

# 3. Vérifier le rollback
curl https://app.visioncrm.com/api/health

# 4. Communiquer aux utilisateurs
# Email + status page update
```

**Time to rollback:** < 5 minutes

---

## ✅ Sign-off final

**Avant de déployer en production, toutes les sections doivent être validées.**

| Catégorie | Responsable | Statut | Date |
|-----------|-------------|--------|------|
| 1. Code et qualité | Dev Lead | ☐ | |
| 2. Variables d'environnement | DevOps | ☐ | |
| 3. Base de données | DBA | ☐ | |
| 4. Sécurité application | Security Lead | ☐ | |
| 5. RGPD et conformité | Legal/DPO | ☐ | |
| 6. Performance | Dev Lead | ☐ | |
| 7. Monitoring | DevOps | ☐ | |
| 8. Email et communications | Marketing | ☐ | |
| 9. Infrastructure | DevOps | ☐ | |
| 10. Documentation | Tech Writer | ☐ | |
| 11. Tests finaux | QA Lead | ☐ | |
| 12. Communication | Marketing | ☐ | |

**Validation finale:**
- [ ] CTO sign-off
- [ ] CEO sign-off (pour lancement beta)

**Date de déploiement prévue:** ___/___/2026

**Go / No-Go decision:** __________

---

**Version:** 1.0
**Dernière mise à jour:** Janvier 2026
**Propriétaire:** Équipe VisionCRM

[← Retour aux docs](../README.md)
