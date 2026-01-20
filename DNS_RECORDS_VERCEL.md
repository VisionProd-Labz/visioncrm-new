# 📋 DNS Records pour Vercel - vision-crm.app

Configuration DNS complète pour `vision-crm.app` dans Vercel.

---

## ⚠️ IMPORTANT

Les records DKIM ci-dessous sont des **exemples**. Vous DEVEZ copier les valeurs **exactes** depuis votre dashboard Resend après avoir ajouté le domaine.

---

## 🔧 Records à ajouter dans Vercel

### Accès Vercel DNS

1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Cliquer sur votre projet `visioncrm` (ou nom du projet)
3. Onglet **Domains**
4. Cliquer sur `vision-crm.app`
5. Section **DNS Records**
6. Cliquer **Add** pour chaque record ci-dessous

---

## 📧 Records Email (Resend)

### 1. SPF Record

**Permet aux serveurs email de savoir que Resend est autorisé à envoyer des emails depuis vision-crm.app**

```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
TTL: Auto (ou 3600)
```

**Vérification:**
```bash
# Dans terminal
dig TXT vision-crm.app

# Devrait contenir:
# vision-crm.app. 3600 IN TXT "v=spf1 include:resend.com ~all"
```

---

### 2. DKIM Record

**⚠️ IMPORTANT:** Vous DEVEZ copier cette valeur depuis Resend Dashboard !

**Étapes:**
1. Dashboard Resend → **Domains** → `vision-crm.app`
2. Section "DNS Records"
3. Copier la **valeur complète** du record DKIM (commence par `v=DKIM1; k=rsa; p=MIGf...`)

**Format dans Vercel:**

```
Type: TXT
Name: resend._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (COPIER depuis Resend)
TTL: Auto (ou 3600)
```

**⚠️ La valeur est TRÈS LONGUE** (~270+ caractères). Copiez-la en entier !

**Vérification:**
```bash
dig TXT resend._domainkey.vision-crm.app

# Devrait contenir:
# resend._domainkey.vision-crm.app. 3600 IN TXT "v=DKIM1; k=rsa; p=MIGf..."
```

---

### 3. Return-Path (CNAME) - Optionnel

**⚠️ Le nom (em####) est fourni par Resend**

```
Type: CNAME
Name: em#### (remplacer #### par le code fourni par Resend)
Value: resend.net
TTL: Auto (ou 3600)
```

**Exemple:**
- Si Resend affiche `em1234`, alors:
  ```
  Type: CNAME
  Name: em1234
  Value: resend.net
  ```

---

### 4. DMARC Record - Recommandé

**Politique DMARC pour protéger contre le spoofing**

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@vision-crm.app; pct=100; adkim=s; aspf=s
TTL: Auto (ou 3600)
```

**Explications:**
- `p=quarantine` : Emails suspects vont en spam (pas rejetés)
- `rua=mailto:dmarc@vision-crm.app` : Rapports quotidiens
- `pct=100` : Appliqué à 100% des emails
- `adkim=s` et `aspf=s` : Strict alignment

**Vérification:**
```bash
dig TXT _dmarc.vision-crm.app

# Devrait contenir:
# _dmarc.vision-crm.app. 3600 IN TXT "v=DMARC1; p=quarantine..."
```

---

## 📊 Résumé des 4 records

| Type | Name | Value | Requis |
|------|------|-------|--------|
| TXT | `@` | `v=spf1 include:resend.com ~all` | ✅ Oui |
| TXT | `resend._domainkey` | `v=DKIM1; k=rsa; p=...` (depuis Resend) | ✅ Oui |
| CNAME | `em####` | `resend.net` | ⚠️ Optionnel |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=...` | ⚠️ Recommandé |

---

## 🔍 Vérification complète

### Méthode 1: dig (Terminal)

```bash
# SPF
dig TXT vision-crm.app +short
# Expected: "v=spf1 include:resend.com ~all"

# DKIM
dig TXT resend._domainkey.vision-crm.app +short
# Expected: "v=DKIM1; k=rsa; p=MIGfMA0..."

# DMARC
dig TXT _dmarc.vision-crm.app +short
# Expected: "v=DMARC1; p=quarantine; rua=..."
```

### Méthode 2: MxToolbox

1. Aller sur https://mxtoolbox.com/SuperTool.aspx
2. Entrer: `vision-crm.app`
3. Vérifier:
   - ✅ SPF Record Lookup
   - ✅ DKIM Record Lookup
   - ✅ DMARC Record Lookup

### Méthode 3: Resend Dashboard

1. Dashboard Resend → **Domains**
2. `vision-crm.app` doit afficher:
   - ✅ **Verified** (badge vert)
   - ✅ SPF ✓
   - ✅ DKIM ✓
   - ✅ Return-Path ✓ (si configuré)

---

## ⏱️ Propagation DNS

**Temps de propagation:** 5-10 minutes (parfois jusqu'à 24-48h)

**Vérifier propagation:**
- https://dnschecker.org/
- Entrer: `vision-crm.app`
- Type: `TXT`
- Vérifier que tous les serveurs voient le record

---

## 🧪 Test final: mail-tester.com

**Après configuration DNS:**

1. Attendre 10 minutes (propagation)
2. Aller sur https://www.mail-tester.com/
3. Copier l'adresse email unique
4. Éditer `scripts/test-email-deliverability.ts`
5. Remplacer `TEST_EMAIL` par l'adresse mail-tester
6. Exécuter:
   ```bash
   npx tsx scripts/test-email-deliverability.ts
   ```
7. Retourner sur mail-tester.com
8. Cliquer "Then check your score"
9. **Target:** Score > 8/10 ✅

**Si score < 8/10:**
- Vérifier que tous les records sont présents
- Attendre 24h (propagation complète)
- Vérifier valeur DKIM exacte (très longue)
- Consulter rapport détaillé mail-tester

---

## 📝 Exemple de configuration Resend

### Ce que vous verrez dans Resend Dashboard

Après avoir ajouté `vision-crm.app` dans Resend, vous verrez une page similaire à :

```
DNS Records for vision-crm.app

✅ SPF Record
   Add this TXT record to your DNS:
   Name: @
   Value: v=spf1 include:resend.com ~all

✅ DKIM Record
   Add this TXT record to your DNS:
   Name: resend._domainkey
   Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCB...
   (très longue valeur - environ 270 caractères)

✅ Return-Path (Optional)
   Add this CNAME record to your DNS:
   Name: em1234
   Value: resend.net

Status: ⏳ Pending Verification

[Verify Records] Button
```

**⚠️ Copier ces valeurs EXACTES dans Vercel DNS !**

---

## 🆘 Troubleshooting

### Record non détecté par Resend

**Problème:** Resend ne voit pas vos records après 30 min

**Solutions:**
1. Vérifier propagation: `dig TXT vision-crm.app`
2. Vérifier typos dans Name/Value
3. Supprimer et recréer le record dans Vercel
4. Attendre 24h (propagation complète)
5. Contacter support Resend si persiste

### DKIM value trop longue

**Problème:** Vercel refuse la valeur DKIM (trop longue)

**Solution:**
- Vérifier que vous copiez la **valeur seule** (pas le "v=DKIM1; k=rsa; p=" au début)
- Vercel accepte jusqu'à 512 caractères
- Si vraiment trop long, contacter support Vercel

### SPF multiple records

**Problème:** Vous avez déjà un record SPF

**Solution:**
- Combiner les records:
  ```
  v=spf1 include:resend.com include:autreservice.com ~all
  ```
- NE PAS créer 2 records SPF séparés (invalide)

---

## ✅ Checklist finale

- [ ] SPF record ajouté dans Vercel DNS
- [ ] DKIM record ajouté (valeur exacte depuis Resend)
- [ ] Return-Path CNAME ajouté (optionnel)
- [ ] DMARC record ajouté (recommandé)
- [ ] Attendre 10 min (propagation)
- [ ] Vérifier avec `dig` ou MxToolbox
- [ ] Cliquer "Verify" dans Resend
- [ ] Status Resend: ✅ Verified
- [ ] Test mail-tester.com score > 8/10

---

**Version:** 1.0
**Domaine:** vision-crm.app
**Service:** Resend
**Dernière mise à jour:** Janvier 2026
