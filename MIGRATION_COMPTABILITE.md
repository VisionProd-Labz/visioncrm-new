# 🗄️ Migration Base de Données - Module Comptabilité

## Vue d'ensemble

Le schéma Prisma a été étendu pour inclure le module comptabilité. Vous devez maintenant créer et appliquer la migration pour créer les nouvelles tables en base de données.

---

## ✅ Étapes pour appliquer la migration

### Option 1: Environnement de développement (Recommandé)

Si vous êtes en mode développement local, exécutez:

```bash
npx prisma migrate dev --name add_accounting_module
```

Cette commande va:
1. Créer le fichier de migration SQL
2. Appliquer la migration à votre base de données
3. Générer le client Prisma

### Option 2: Environnement de production

Si vous êtes en production (Vercel), utilisez:

```bash
npx prisma migrate deploy
```

Cette commande appliquera toutes les migrations en attente.

---

## 📋 Nouvelles tables créées

La migration ajoutera les tables suivantes à votre base de données:

### 🏦 Module Banques
- `bank_accounts` - Comptes bancaires
- `bank_transactions` - Transactions bancaires
- `bank_reconciliations` - Rapprochements bancaires

### 💰 Module Dépenses
- `expenses` - Dépenses et achats

### 📦 Module Inventaire
- `inventory_items` - Articles en stock

### 📑 Module Documents
- `tax_documents` - Documents fiscaux
- `payroll_documents` - Documents de paie
- `legal_documents` - Documents juridiques

### 📊 Module Rapports
- `financial_reports` - Rapports financiers

### ⚖️ Module Litiges
- `litigations` - Gestion des litiges

---

## 🔄 Modifications des tables existantes

### Table `contacts`
- Ajout du champ `is_supplier` (Boolean) pour identifier les fournisseurs

### Table `tenants`
- Ajout de relations vers toutes les nouvelles tables comptables

---

## 🆕 Nouveaux enums

Les enums suivants ont été ajoutés:

- `TransactionType` - Type de transaction (DEBIT, CREDIT)
- `TransactionStatus` - Statut de transaction
- `ReconciliationStatus` - Statut de rapprochement
- `ExpenseStatus` - Statut de dépense (DRAFT, SUBMITTED, APPROVED, PAID, REJECTED)
- `ExpenseCategory` - Catégories de dépenses (RENT, UTILITIES, INSURANCE, etc.)
- `TaxDocumentType` - Types de documents fiscaux
- `PayrollStatus` - Statut de paie
- `LegalDocumentType` - Types de documents juridiques

---

## ⚠️ Points d'attention

### Avant d'appliquer la migration

1. **Sauvegardez votre base de données**
   ```bash
   # Créez un backup de votre base Supabase via le dashboard
   ```

2. **Vérifiez votre connexion à la base de données**
   ```bash
   npx prisma db pull
   ```

3. **Testez en local d'abord**
   - Appliquez la migration sur une base de test
   - Vérifiez que tout fonctionne
   - Puis appliquez en production

### Après avoir appliqué la migration

1. **Vérifiez que toutes les tables ont été créées**
   ```bash
   npx prisma studio
   ```

2. **Testez la connexion depuis l'application**
   - Redémarrez votre serveur de développement
   - Accédez à `/accounting`
   - Vérifiez qu'il n'y a pas d'erreurs

---

## 🐛 Dépannage

### Erreur: "Table already exists"

Si une table existe déjà, vous pouvez:

1. **Supprimer les tables manuellement** (⚠️ ATTENTION: perte de données)
   ```sql
   DROP TABLE IF EXISTS bank_accounts CASCADE;
   DROP TABLE IF EXISTS bank_transactions CASCADE;
   -- etc.
   ```

2. **Ou réinitialiser la migration**
   ```bash
   npx prisma migrate reset
   ```
   ⚠️ **ATTENTION:** Cela supprimera TOUTES vos données !

### Erreur: "Environment is non-interactive"

Si vous voyez cette erreur dans un environnement CI/CD:

```bash
# Utilisez plutôt:
npx prisma migrate deploy
```

### Erreur de connexion à la base de données

Vérifiez votre `DATABASE_URL` dans le fichier `.env`:

```bash
DATABASE_URL="postgresql://postgres.ieptwyxmjqfrtuiwauof:VOTRE_MDP@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
```

---

## 📊 Statistiques de la migration

- **Nouvelles tables**: 9
- **Tables modifiées**: 2 (contacts, tenants)
- **Nouveaux enums**: 8
- **Nouveaux index**: ~25
- **Relations ajoutées**: 15+

---

## 🎯 Prochaines étapes

Une fois la migration appliquée:

1. ✅ Redémarrez votre application
2. ✅ Testez l'accès au module comptabilité
3. ✅ Vérifiez les permissions des utilisateurs
4. ✅ Créez des données de test

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs de Prisma
2. Consultez la documentation: https://www.prisma.io/docs/concepts/components/prisma-migrate
3. Vérifiez les permissions de votre utilisateur PostgreSQL

---

**Date:** 2026-01-09
**Version:** 1.0
**Module:** Comptabilité
**Type:** Migration initiale
