# Guide de monitoring - VisionCRM

Guide complet pour surveiller VisionCRM en production.

## 📊 Vue d'ensemble

### Objectifs du monitoring

1. **Détecter les problèmes** avant qu'ils affectent les utilisateurs
2. **Diagnostiquer rapidement** la cause des incidents
3. **Mesurer la performance** et l'expérience utilisateur
4. **Suivre les métriques business** (signups, conversions, etc.)
5. **Alerter l'équipe** en cas d'anomalie

### Stack de monitoring

| Outil | Usage | Criticité |
|-------|-------|-----------|
| **Sentry** | Error tracking, performance | 🔴 Critique |
| **Vercel Analytics** | Web Vitals, traffic | 🟠 Important |
| **UptimeRobot** | Uptime monitoring | 🔴 Critique |
| **Datadog/CloudWatch** | Infrastructure metrics | 🟡 Nice-to-have |
| **PostHog** | Product analytics | 🟡 Nice-to-have |

---

## 🚨 Sentry - Error Tracking

### Configuration de base

#### Installation (déjà fait)

```javascript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0, // 100% des transactions
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
});
```

```javascript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% des transactions (économie de quota)
  environment: process.env.NODE_ENV,
});
```

### Métriques clés à surveiller

#### 1. Error Rate

**Threshold:**
- 🟢 Normal: < 0.1% des requêtes
- 🟡 Warning: 0.1-1%
- 🔴 Critical: > 1%

**Dashboard Sentry:**
- Issues → View: All Unresolved
- Group by: Error type
- Time range: Last 24h

**Action si threshold dépassé:**
1. Identifier l'erreur la plus fréquente
2. Check si affecte tous utilisateurs ou subset
3. Créer issue GitHub si bug confirmé
4. Deploy hotfix si critique

#### 2. Performance Monitoring

**Métriques:**
- **Average Response Time**: < 500ms (p95)
- **Slowest Transactions**: Identifier top 10
- **Throughput**: Requests per minute

**Dashboard:**
- Performance → Transactions
- Filter: `transaction.op:http.server`
- Sort by: p95 duration

**Slow queries à investiguer:**
```sql
-- Si query > 1s, optimiser avec index
SELECT * FROM "Contact" WHERE email = 'xxx'; -- Ajouter index sur email
```

#### 3. Release Tracking

**Tag releases:**
```bash
# Automatic avec Vercel
export SENTRY_RELEASE=$(git rev-parse HEAD)
```

**Comparer releases:**
- Releases → Compare
- Metric: Error count, crash-free sessions
- Rollback si dégradation > 50%

### Alertes Sentry

#### Configuration des alertes

1. **Alerts → Create Alert Rule**

**Alert #1: Error Spike**
- Metric: Event count
- Threshold: > 10 errors in 5 minutes
- Action: Email + Slack
- Severity: Critical

**Alert #2: Performance Degradation**
- Metric: Transaction duration (p95)
- Threshold: > 1s for 10 minutes
- Action: Email
- Severity: Warning

**Alert #3: New Release Issues**
- Metric: New issues
- Threshold: > 5 new issues in first hour of release
- Action: Email + PagerDuty
- Severity: High

#### Notification channels

```javascript
// Integrations:
- Email: tech-team@visioncrm.com
- Slack: #alerts-production
- PagerDuty: (pour on-call)
```

---

## 📈 Vercel Analytics

### Web Vitals

Surveillez les Core Web Vitals:

#### 1. LCP (Largest Contentful Paint)

**Target:** < 2.5s

**Si dégradé:**
- Optimiser images (next/image)
- Lazy load composants lourds
- Activer caching

```javascript
// Exemple: Lazy loading
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <Spinner />,
  ssr: false,
});
```

#### 2. FID (First Input Delay)

**Target:** < 100ms

**Si dégradé:**
- Réduire JavaScript bundle
- Code splitting
- Déplacer scripts non-critiques en defer

#### 3. CLS (Cumulative Layout Shift)

**Target:** < 0.1

**Si dégradé:**
- Définir width/height sur images
- Éviter insertion dynamique de contenu
- Réserver espace pour ads/embeds

### Real User Monitoring (RUM)

**Métriques disponibles:**
- Page load time par route
- Geography distribution
- Device breakdown (mobile/desktop)
- Browser versions

**Analyse:**
1. Project → Analytics → Audience
2. Identifier pages lentes
3. Filter par device/browser si problème spécifique

---

## 🔍 Uptime Monitoring

### UptimeRobot configuration

#### Monitors à créer

**Monitor #1: Homepage**
- Type: HTTP(S)
- URL: `https://app.visioncrm.com`
- Interval: 5 minutes
- Expected status: 200
- Alert when down for: 2 minutes

**Monitor #2: API Health**
- Type: HTTP(S)
- URL: `https://app.visioncrm.com/api/health`
- Interval: 5 minutes
- Expected response: `{"status":"ok"}`
- Alert when down for: 1 minute

**Monitor #3: Database Connection**
- Type: HTTP(S)
- URL: `https://app.visioncrm.com/api/health/database`
- Interval: 10 minutes
- Expected status: 200
- Alert when down for: 2 minutes

**Monitor #4: Email Service**
- Type: HTTP(S)
- URL: `https://app.visioncrm.com/api/health/email`
- Interval: 30 minutes
- Expected status: 200
- Alert when down for: 5 minutes

#### Status Page publique

Créez une status page publique:

**URL:** `status.visioncrm.com`

**Services à afficher:**
- Application Web
- API
- Base de données
- Email Service

**Configuration:**
1. UptimeRobot → Status Pages
2. Create Public Status Page
3. Select monitors
4. Custom domain: status.visioncrm.com
5. Add CNAME: `status.visioncrm.com → stats.uptimerobot.com`

### Alertes Uptime

**Channels:**
- Email: ops@visioncrm.com
- SMS: +33 X XX XX XX XX (on-call)
- Slack: #incidents
- Webhook: PagerDuty

---

## 🗄️ Database Monitoring

### Supabase Dashboard

#### Métriques clés

**1. Database Health**
- CPU utilization: < 70%
- Memory usage: < 80%
- Disk usage: < 80%
- Active connections: < 80% of max

**Dashboard:** Project → Database → Health

**Alert thresholds:**
```
CPU > 80% for 10 min → Scale up
Memory > 90% → Investigate queries
Connections > 100 → Check connection pooling
```

**2. Query Performance**

**Dashboard:** Project → Database → Query Performance

**Queries > 1s:**
```sql
-- Exemple: Requête lente à optimiser
SELECT * FROM "Quote"
LEFT JOIN "Contact" ON "Quote"."contactId" = "Contact".id
WHERE "Quote"."status" = 'PENDING';

-- Solution: Ajouter index
CREATE INDEX idx_quote_status ON "Quote"("status");
```

**3. Backup Status**

**Vérifier:** Project → Settings → Database → Backups

**Checklist:**
- [ ] Daily backups enabled
- [ ] Point-in-time recovery enabled
- [ ] Retention: 30 days minimum
- [ ] Last backup: < 24h ago
- [ ] Test restoration: mensuel

### Prisma Metrics (via Sentry)

**Slow queries tracking:**

```typescript
// prisma/middleware.ts (déjà configuré)
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  const queryTime = after - before;

  if (queryTime > 1000) {
    Sentry.captureMessage(`Slow query: ${params.model}.${params.action}`, {
      level: 'warning',
      extra: { queryTime, params },
    });
  }

  return result;
});
```

---

## 📊 Business Metrics

### KPIs à surveiller quotidiennement

#### 1. Signup Funnel

**Métriques:**
```
- Visits to /register: X
- Signup started: X (%)
- Signup completed: X (%)
- Email verified: X (%)
- First login: X (%)
```

**Conversion rate target:**
- Signup started → completed: > 70%
- Completed → verified: > 80%
- Verified → first login: > 90%

**Si dégradation:**
- Check form validation errors (Sentry)
- Check email delivery (SMTP logs)
- A/B test simplification du formulaire

#### 2. Engagement

**Daily Active Users (DAU):**
```sql
SELECT COUNT(DISTINCT "userId")
FROM "Session"
WHERE "createdAt" >= NOW() - INTERVAL '24 hours';
```

**Weekly Active Users (WAU):**
```sql
SELECT COUNT(DISTINCT "userId")
FROM "Session"
WHERE "createdAt" >= NOW() - INTERVAL '7 days';
```

**Target:** DAU/WAU ratio > 30% (stickiness)

#### 3. Activation

**Activated users** = Users who created ≥ 1 quote

```sql
SELECT COUNT(DISTINCT u.id)
FROM "User" u
INNER JOIN "Quote" q ON u.id = q."userId"
WHERE u."createdAt" >= NOW() - INTERVAL '7 days';
```

**Activation rate target:** > 60% within first 7 days

#### 4. Revenue Tracking

**Invoices created:**
```sql
SELECT
  DATE_TRUNC('day', "createdAt") as day,
  COUNT(*) as invoice_count,
  SUM("totalTTC") as total_amount
FROM "Invoice"
WHERE "createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day;
```

**GMV (Gross Merchandise Value):**
- Total amount invoiced per month
- Target growth: +20% MoM

### Dashboards

#### Dashboard Metabase / Redash

**Configuration:**

```yaml
# metrics.yaml
dashboards:
  - name: "Daily Overview"
    queries:
      - signups_today
      - dau
      - quotes_created
      - invoices_sent

  - name: "Engagement"
    queries:
      - dau_wau_ratio
      - activated_users
      - retention_cohort

  - name: "Revenue"
    queries:
      - gmv_daily
      - invoices_paid_rate
      - mrr_calculation
```

---

## 🔔 Alerting Strategy

### Alert Levels

| Level | Response Time | Notification |
|-------|---------------|--------------|
| 🟢 **Info** | No action | Log only |
| 🟡 **Warning** | Next business day | Email |
| 🟠 **High** | Within 2 hours | Email + Slack |
| 🔴 **Critical** | Immediate | Email + Slack + SMS + PagerDuty |

### Alert Runbooks

#### Critical Alert: Site Down

**Trigger:** Homepage returns 500/502/503

**Runbook:**
1. Check Vercel deployment status
2. Check database connectivity (`/api/health/database`)
3. Check recent deployments (potential bad deploy)
4. If bad deploy: Rollback immediately
   ```bash
   vercel rollback
   ```
5. If database issue: Check Supabase status
6. If infrastructure: Contact Vercel support
7. Update status page: "Investigating"
8. Post-incident: Write postmortem

#### High Alert: Error Rate Spike

**Trigger:** > 50 errors in 5 minutes

**Runbook:**
1. Open Sentry: Identify error type
2. Check if single error or multiple
3. Check affected users (all or subset)
4. If new deployment: Consider rollback
5. If data-related: Check database
6. Create GitHub issue
7. Deploy hotfix if critical
8. Update affected users via status page

#### Warning: Slow Response Time

**Trigger:** p95 > 1s for 10 minutes

**Runbook:**
1. Check slow transactions in Sentry
2. Identify slow queries (Prisma logs)
3. Check database CPU/memory
4. Optimize query or add index
5. Monitor improvement
6. Document optimization in wiki

---

## 📝 Incident Response

### Incident Severity Levels

**SEV-1 (Critical):**
- Site completely down
- Data loss
- Security breach
- Revenue-impacting

**Response:** Immediate (< 5 min), all hands on deck

**SEV-2 (High):**
- Core feature broken (can't create quotes)
- Significant performance degradation
- Partial outage

**Response:** Within 30 minutes, on-call engineer

**SEV-3 (Medium):**
- Minor feature broken
- Performance issues (non-critical)
- Visual bugs

**Response:** Next business day

**SEV-4 (Low):**
- Cosmetic issues
- Enhancement requests

**Response:** Backlog

### Incident Response Process

**1. Detection**
- Alert received OR user report

**2. Triage** (< 5 min)
- Assess severity
- Assign owner
- Create incident channel (#incident-YYYY-MM-DD)

**3. Investigation** (< 15 min)
- Gather data (logs, metrics, errors)
- Identify root cause
- Estimate impact

**4. Mitigation**
- Deploy fix OR rollback OR workaround
- Verify fix in production
- Monitor for regression

**5. Communication**
- Update status page
- Notify affected users
- Internal updates (#incidents)

**6. Resolution**
- Confirm issue resolved
- Close incident
- Schedule postmortem

**7. Postmortem** (within 48h)
- Timeline of events
- Root cause analysis
- Action items
- Document learnings

### Postmortem Template

```markdown
# Incident Postmortem: [Title]

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** SEV-X
**Impact:** X users affected

## Summary
[Brief description of what happened]

## Timeline
- 14:32: Alert received (error rate spike)
- 14:35: Incident declared, team notified
- 14:40: Root cause identified (bad deployment)
- 14:45: Rollback initiated
- 14:50: Services restored
- 15:00: Incident resolved

## Root Cause
[Detailed explanation]

## Impact
- X users unable to create quotes for Y minutes
- Z failed requests
- Revenue impact: €XX

## Resolution
[How we fixed it]

## Action Items
- [ ] Add E2E test for this scenario (Owner: Dev Lead, Due: 2026-XX-XX)
- [ ] Improve deployment checklist (Owner: DevOps, Due: 2026-XX-XX)
- [ ] Add monitoring for this metric (Owner: SRE, Due: 2026-XX-XX)

## Lessons Learned
- What went well
- What could be improved
```

---

## 🛠️ Monitoring Tools Setup

### Quick Setup Guide

#### 1. Sentry

```bash
# Already installed
pnpm add @sentry/nextjs

# Configure
npx @sentry/wizard -i nextjs

# Set env vars
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
```

#### 2. UptimeRobot

1. [uptimerobot.com](https://uptimerobot.com)
2. Create monitors (see above)
3. Configure alerts
4. Create public status page

#### 3. Vercel Analytics

Automatic avec Vercel deployment.

Dashboard: Project → Analytics

#### 4. PostHog (optionnel)

```bash
pnpm add posthog-js

# pages/_app.tsx
import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
});
```

---

## 📞 On-Call

### On-Call Rotation

**Schedule:**
- Week 1: Engineer A
- Week 2: Engineer B
- Week 3: Engineer C
- Backup: CTO

**Responsibilities:**
- Monitor alerts 24/7
- Respond to critical incidents < 15 min
- Escalate if needed
- Update status page
- Write incident postmortem

### On-Call Checklist

**Before your week:**
- [ ] Test PagerDuty notifications
- [ ] Review recent incidents
- [ ] Ensure laptop + phone charged
- [ ] Know escalation contacts
- [ ] Access to all tools (Vercel, Supabase, etc.)

**During your week:**
- [ ] Check alerts daily
- [ ] Monitor #incidents channel
- [ ] Be responsive (< 15 min ACK)
- [ ] Document any actions taken

**After your week:**
- [ ] Handoff to next on-call
- [ ] Document issues encountered
- [ ] Suggest improvements

---

## ✅ Daily Monitoring Checklist

**Every morning (10 min):**

- [ ] Check Sentry: any new critical errors?
- [ ] Check UptimeRobot: 100% uptime last 24h?
- [ ] Check Vercel Analytics: traffic normal?
- [ ] Check business metrics: signups, DAU normal?
- [ ] Review #incidents Slack: any issues reported?
- [ ] Check database health: CPU/memory normal?
- [ ] Check error budget: on track for 99.9% uptime?

**Weekly review (30 min):**

- [ ] Trends: errors increasing/decreasing?
- [ ] Performance: any degradation?
- [ ] Slow queries: any new ones?
- [ ] User feedback: any patterns?
- [ ] Action items from incidents: completed?

---

**Version:** 1.0
**Dernière mise à jour:** Janvier 2026

[← Retour à la checklist](./PRODUCTION_CHECKLIST.md)
