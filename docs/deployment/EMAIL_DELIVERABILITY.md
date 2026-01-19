# Email Deliverability Guide - VisionCRM

Guide complet pour configurer l'authentification des emails et maximiser la délivrabilité.

## 📊 Objectifs

- ✅ Score > 8/10 sur [mail-tester.com](https://www.mail-tester.com)
- ✅ SPF configuré correctement
- ✅ DKIM configuré correctement
- ✅ DMARC policy définie
- ✅ Emails arrivent en inbox (pas spam)

## 🔧 Configuration par provider

### Option 1 : Resend (Recommandé)

[Resend](https://resend.com) - Service moderne d'emailing avec React Email.

#### Étape 1 : Créer compte Resend

1. Aller sur [resend.com](https://resend.com/signup)
2. Créer un compte gratuit (3,000 emails/mois)
3. Aller dans **"API Keys"** → Créer une clé
4. Copier la clé (commence par `re_...`)

#### Étape 2 : Ajouter domaine

1. Dans Resend Dashboard → **"Domains"** → **"Add Domain"**
2. Entrer votre domaine : `visioncrm.app`
3. Cliquer **"Add"**

#### Étape 3 : Configurer DNS

Resend vous fournira 3 records DNS à ajouter :

**Records à ajouter chez votre registrar DNS (Cloudflare, OVH, etc.) :**

```dns
# SPF Record
TXT  @  "v=spf1 include:resend.com ~all"

# DKIM Record
TXT  resend._domainkey  "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA..."

# Return-Path (optionnel)
CNAME  em1234  resend.net
```

#### Étape 4 : Vérifier configuration

1. Attendre 5-10 minutes (propagation DNS)
2. Dans Resend → **"Domains"** → Cliquer **"Verify"**
3. Status doit être ✅ **"Verified"**

#### Étape 5 : Configurer VisionCRM

Ajouter dans `.env.production` :

```bash
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM="VisionCRM <noreply@visioncrm.app>"
EMAIL_REPLY_TO="support@visioncrm.app"
```

#### Étape 6 : Tester l'envoi

```typescript
// Test dans Node.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'VisionCRM <noreply@visioncrm.app>',
  to: 'test@mail-tester.com',
  subject: 'Test email deliverability',
  html: '<p>This is a test email</p>',
});
```

---

### Option 2 : SendGrid

[SendGrid](https://sendgrid.com) - Provider populaire (100 emails/jour gratuit).

#### Étape 1 : Créer compte SendGrid

1. Aller sur [sendgrid.com/pricing](https://sendgrid.com/pricing)
2. Créer compte Free (100 emails/jour)
3. Aller dans **"Settings"** → **"API Keys"** → **"Create API Key"**
4. Copier la clé (commence par `SG.`)

#### Étape 2 : Domain Authentication

1. **Settings** → **"Sender Authentication"** → **"Authenticate Your Domain"**
2. Entrer votre domaine : `visioncrm.app`
3. Suivre le wizard

#### Étape 3 : Configurer DNS

SendGrid fournira des records similaires à :

```dns
# SPF Record
TXT  @  "v=spf1 include:sendgrid.net ~all"

# DKIM Records
CNAME  s1._domainkey  s1.domainkey.u12345.wl.sendgrid.net
CNAME  s2._domainkey  s2.domainkey.u12345.wl.sendgrid.net

# Domain Key
CNAME  em1234  u12345.wl.sendgrid.net
```

#### Étape 4 : Vérifier authentication

1. Attendre 24-48h (propagation DNS complète)
2. Dans SendGrid → **"Sender Authentication"** → Status doit être ✅ **"Verified"**

#### Étape 5 : Configurer VisionCRM

Ajouter dans `.env.production` :

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM="VisionCRM <noreply@visioncrm.app>"
EMAIL_REPLY_TO="support@visioncrm.app"
```

---

### Option 3 : AWS SES (Production)

[AWS SES](https://aws.amazon.com/ses/) - Très bon marché ($0.10 pour 1000 emails).

#### Étape 1 : Configurer AWS SES

1. AWS Console → **"Simple Email Service"**
2. **"Verified identities"** → **"Create identity"**
3. Type: **Domain**
4. Domain: `visioncrm.app`

#### Étape 2 : Configurer DNS

AWS SES fournira 3 CNAME records :

```dns
# DKIM Records (3 CNAME)
CNAME  abc123._domainkey  abc123.dkim.amazonses.com
CNAME  def456._domainkey  def456.dkim.amazonses.com
CNAME  ghi789._domainkey  ghi789.dkim.amazonses.com

# MX Record (pour recevoir bounces)
MX  @  10 feedback-smtp.us-east-1.amazonses.com
```

Ajouter SPF manuellement :

```dns
TXT  @  "v=spf1 include:amazonses.com ~all"
```

#### Étape 3 : Sortir du Sandbox

Par défaut, SES est en "Sandbox mode" (50 emails/jour, uniquement vers verified emails).

Pour sortir :

1. AWS SES Console → **"Account dashboard"**
2. Cliquer **"Request production access"**
3. Remplir le formulaire :
   - **Use case**: Transactional emails (verification, password reset)
   - **Website URL**: https://visioncrm.app
   - **Compliance**: Yes, all emails have unsubscribe link
4. AWS répond en 24-48h

#### Étape 4 : Créer SMTP Credentials

1. AWS SES Console → **"SMTP settings"**
2. Cliquer **"Create SMTP credentials"**
3. Télécharger credentials (username + password)

#### Étape 5 : Configurer VisionCRM

Ajouter dans `.env.production` :

```bash
# AWS SES SMTP Configuration
EMAIL_SERVER_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=AKIAXXXXXXXXXXXXX
EMAIL_SERVER_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="VisionCRM <noreply@visioncrm.app>"
EMAIL_REPLY_TO="support@visioncrm.app"
```

---

## 🔒 Configuration DMARC

DMARC (Domain-based Message Authentication, Reporting and Conformance) ajoute une couche de sécurité.

### Record DMARC recommandé

Ajouter chez votre registrar DNS :

```dns
TXT  _dmarc  "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@visioncrm.app; ruf=mailto:dmarc-forensics@visioncrm.app; pct=100; adkim=s; aspf=s"
```

**Explication :**
- `v=DMARC1` : Version DMARC
- `p=quarantine` : Policy (none, quarantine, reject)
- `rua=mailto:...` : Aggregate reports (quotidien)
- `ruf=mailto:...` : Forensic reports (échecs en temps réel)
- `pct=100` : Appliquer à 100% des emails
- `adkim=s` : DKIM strict alignment
- `aspf=s` : SPF strict alignment

### Progression DMARC

1. **Phase 1** (monitoring) : `p=none`
   - Recevez des rapports sans bloquer d'emails
   - Durée : 2 semaines

2. **Phase 2** (quarantine) : `p=quarantine`
   - Emails échoués vont en spam
   - Durée : 2 semaines

3. **Phase 3** (reject) : `p=reject`
   - Emails échoués sont bloqués
   - Production finale

---

## 📧 Templates d'emails professionnels

VisionCRM utilise React Email pour des templates modernes et responsive.

### Templates créés

1. **verification-email.tsx** - Email de vérification
2. **password-reset-email.tsx** - Réinitialisation mot de passe

### Créer un nouveau template

```typescript
// lib/email/templates/quote-sent-email.tsx
import { Body, Button, Container, Html, Text } from '@react-email/components';

interface QuoteSentEmailProps {
  customerName: string;
  quoteNumber: string;
  quoteUrl: string;
}

export function QuoteSentEmail({
  customerName,
  quoteNumber,
  quoteUrl,
}: QuoteSentEmailProps) {
  return (
    <Html>
      <Body style={{ backgroundColor: '#f6f9fc' }}>
        <Container style={{ padding: '20px' }}>
          <Text>Bonjour {customerName},</Text>
          <Text>
            Votre devis #{quoteNumber} est prêt !
          </Text>
          <Button href={quoteUrl}>
            Consulter mon devis
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

### Utiliser un template

```typescript
import { render } from '@react-email/render';
import { VerificationEmail } from '@/lib/email/templates/verification-email';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string,
  userName: string
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const html = render(
    VerificationEmail({ verificationUrl, userName })
  );

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: 'Vérifiez votre adresse email - VisionCRM',
    html,
  });
}
```

---

## 🧪 Tester la délivrabilité

### Test 1 : mail-tester.com (Recommandé)

1. Aller sur [mail-tester.com](https://www.mail-tester.com/)
2. Copier l'adresse email unique (ex: `test-abc123@mail-tester.com`)
3. Envoyer un email de test depuis VisionCRM :

```typescript
// Dans Node.js REPL ou script
await sendVerificationEmail(
  'test-abc123@mail-tester.com',
  'fake-token-123',
  'Test User'
);
```

4. Retourner sur mail-tester.com
5. Cliquer **"Then check your score"**

**Score attendu : > 8/10 (idéal : 10/10)**

### Test 2 : GlockApps (Avancé)

[GlockApps](https://glockapps.com/) teste la délivrabilité sur tous les providers (Gmail, Outlook, Yahoo, etc.).

**Prix :** 49€ pour 100 tests

### Test 3 : MxToolbox

Vérifier SPF, DKIM, DMARC :

1. [mxtoolbox.com/SuperTool.aspx](https://mxtoolbox.com/SuperTool.aspx)
2. Entrer `visioncrm.app`
3. Vérifier tous les records

---

## 🐛 Troubleshooting

### Score < 8/10 sur mail-tester

**Problèmes courants :**

1. **SPF not found**
   - Vérifier record TXT SPF : `dig TXT visioncrm.app`
   - Doit contenir `v=spf1 include:...`

2. **DKIM not found**
   - Vérifier records DKIM : `dig TXT resend._domainkey.visioncrm.app`
   - Attendre 24h propagation DNS

3. **DMARC not found**
   - Ajouter record DMARC : `_dmarc.visioncrm.app`

4. **Reverse DNS mismatch**
   - Provider (Resend/SendGrid) gère automatiquement
   - Rien à faire

5. **Spam words détectés**
   - Éviter : "Free", "Click here", "!!!!", "100% guaranteed"
   - Utiliser langage professionnel

### Emails vont en spam Gmail

**Solutions :**

1. **Authentification complète** : SPF + DKIM + DMARC
2. **Warm-up** : Commencer avec petit volume (10-20 emails/jour)
3. **Engagement** : Encourager destinataires à ajouter aux contacts
4. **Unsubscribe link** : Obligatoire dans emails marketing
5. **List hygiene** : Supprimer bounces et emails invalides

### Bounce rate élevé

**Causes :**

- Emails invalides dans la base
- Boîtes pleines
- Serveur destinataire down

**Solution :**

Implémenter bounce handling :

```typescript
// webhooks/email-bounce.ts
export async function handleBounce(event: BounceEvent) {
  if (event.type === 'hard_bounce') {
    // Désactiver email définitivement
    await prisma.contact.update({
      where: { email: event.email },
      data: { email_valid: false },
    });
  }
}
```

---

## ✅ Checklist pré-beta launch

- [ ] Provider email choisi (Resend recommandé)
- [ ] Domaine ajouté et vérifié
- [ ] SPF record configuré
- [ ] DKIM records configurés
- [ ] DMARC record configuré (mode `p=none` initial)
- [ ] Test mail-tester.com > 8/10
- [ ] Templates professionnels créés
- [ ] Test envoi email verification
- [ ] Test envoi password reset
- [ ] Bounce handling implémenté
- [ ] Logs emails configurés (Resend Dashboard)

---

## 📊 Métriques à surveiller

### Dashboard provider (Resend/SendGrid)

**Métriques clés :**

| Métrique | Target | Action si dégradé |
|----------|--------|-------------------|
| **Delivery rate** | > 98% | Vérifier bounces, clean list |
| **Open rate** | > 20% | Améliorer subject lines |
| **Bounce rate** | < 2% | Supprimer emails invalides |
| **Spam rate** | < 0.1% | Améliorer contenu, auth |
| **Click rate** | > 5% | Améliorer CTAs |

### Surveillance quotidienne

```sql
-- Emails envoyés aujourd'hui
SELECT COUNT(*) FROM email_logs
WHERE created_at >= CURRENT_DATE;

-- Taux d'échec
SELECT
  COUNT(CASE WHEN status = 'failed' THEN 1 END) * 100.0 / COUNT(*) as failure_rate
FROM email_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
```

---

**Version:** 1.0
**Dernière mise à jour:** Janvier 2026
**Propriétaire:** DevOps Team

## 📚 Ressources

- [Resend Documentation](https://resend.com/docs)
- [SendGrid Best Practices](https://sendgrid.com/blog/best-practices/)
- [AWS SES Developer Guide](https://docs.aws.amazon.com/ses/)
- [DMARC.org](https://dmarc.org/)
- [mail-tester.com](https://www.mail-tester.com/)
