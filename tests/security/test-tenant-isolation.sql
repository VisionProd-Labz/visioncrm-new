-- ====================================================================
-- TEST D'ISOLATION MULTI-TENANT - VALIDATION SÉCURITÉ
-- ====================================================================
-- À exécuter dans Supabase SQL Editor après la correction
-- ====================================================================

-- ÉTAPE 1: Créer 2 tenants de test
DO $$
DECLARE
  tenant1_id UUID;
  tenant2_id UUID;
BEGIN
  -- Créer Tenant 1
  INSERT INTO tenants (id, name, subdomain, plan, created_at, updated_at)
  VALUES (gen_random_uuid(), 'Test Tenant 1', 'test1', 'PRO', NOW(), NOW())
  RETURNING id INTO tenant1_id;

  -- Créer Tenant 2
  INSERT INTO tenants (id, name, subdomain, plan, created_at, updated_at)
  VALUES (gen_random_uuid(), 'Test Tenant 2', 'test2', 'PRO', NOW(), NOW())
  RETURNING id INTO tenant2_id;

  RAISE NOTICE 'Tenant 1 ID: %', tenant1_id;
  RAISE NOTICE 'Tenant 2 ID: %', tenant2_id;
END $$;

-- ÉTAPE 2: Insérer des données sensibles pour chaque tenant
WITH tenant_ids AS (
  SELECT id, subdomain FROM tenants WHERE subdomain IN ('test1', 'test2')
)
-- Documents
INSERT INTO documents (id, tenant_id, name, category, file_url, file_type, file_size, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  'Document Confidentiel ' || subdomain,
  'contracts',
  'https://example.com/doc.pdf',
  'pdf',
  1024,
  NOW(),
  NOW()
FROM tenant_ids;

-- Comptes bancaires (CRITIQUE)
WITH tenant_ids AS (
  SELECT id, subdomain FROM tenants WHERE subdomain IN ('test1', 'test2')
)
INSERT INTO bank_accounts (id, tenant_id, bank_name, account_number, iban, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  'Banque Test ' || subdomain,
  '123456789' || id::text,
  'FR76' || LPAD((random() * 1000000000)::bigint::text, 23, '0'),
  NOW(),
  NOW()
FROM tenant_ids;

-- Transactions bancaires (CRITIQUE)
WITH accounts AS (
  SELECT id, tenant_id FROM bank_accounts WHERE account_number LIKE '123456789%'
)
INSERT INTO bank_transactions (id, tenant_id, bank_account_id, date, amount, description, created_at, updated_at)
SELECT
  gen_random_uuid(),
  tenant_id,
  id,
  NOW(),
  1000.00,
  'Transaction sensible',
  NOW(),
  NOW()
FROM accounts;

-- Emails logs
WITH tenant_ids AS (
  SELECT id, subdomain FROM tenants WHERE subdomain IN ('test1', 'test2')
)
INSERT INTO email_logs (id, tenant_id, to_address, subject, status, created_at)
SELECT
  gen_random_uuid(),
  id,
  'client@' || subdomain || '.com',
  'Email confidentiel',
  'sent',
  NOW()
FROM tenant_ids;

-- ÉTAPE 3: Vérifier l'isolation (doit retourner 0 lignes)
-- ====================================================================
-- TEST 1: Vérifier documents cross-tenant
-- ====================================================================
SELECT
  'DOCUMENTS CROSS-TENANT' as test_name,
  COUNT(*) as violations,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS - Aucune fuite détectée'
    ELSE '🔴 FAIL - Fuite de données détectée!'
  END as result
FROM (
  SELECT d.id, d.tenant_id, t.subdomain
  FROM documents d
  CROSS JOIN tenants t
  WHERE d.tenant_id != t.id
    AND t.subdomain IN ('test1', 'test2')
    AND d.name LIKE 'Document Confidentiel%'
) violations;

-- ====================================================================
-- TEST 2: Vérifier bank_accounts cross-tenant (CRITIQUE)
-- ====================================================================
SELECT
  'BANK ACCOUNTS CROSS-TENANT' as test_name,
  COUNT(*) as violations,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS - Comptes bancaires isolés'
    ELSE '🔴 FAIL - CRITIQUE: Accès cross-tenant aux comptes bancaires!'
  END as result
FROM (
  SELECT b.id, b.tenant_id, b.iban, t.subdomain
  FROM bank_accounts b
  CROSS JOIN tenants t
  WHERE b.tenant_id != t.id
    AND t.subdomain IN ('test1', 'test2')
    AND b.account_number LIKE '123456789%'
) violations;

-- ====================================================================
-- TEST 3: Vérifier bank_transactions cross-tenant (CRITIQUE)
-- ====================================================================
SELECT
  'BANK TRANSACTIONS CROSS-TENANT' as test_name,
  COUNT(*) as violations,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS - Transactions bancaires isolées'
    ELSE '🔴 FAIL - CRITIQUE: Accès cross-tenant aux transactions!'
  END as result
FROM (
  SELECT bt.id, bt.tenant_id, bt.amount, t.subdomain
  FROM bank_transactions bt
  CROSS JOIN tenants t
  WHERE bt.tenant_id != t.id
    AND t.subdomain IN ('test1', 'test2')
) violations;

-- ====================================================================
-- TEST 4: Vérifier email_logs cross-tenant
-- ====================================================================
SELECT
  'EMAIL LOGS CROSS-TENANT' as test_name,
  COUNT(*) as violations,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ PASS - Emails isolés'
    ELSE '🔴 FAIL - Fuite historique emails!'
  END as result
FROM (
  SELECT e.id, e.tenant_id, e.to_address, t.subdomain
  FROM email_logs e
  CROSS JOIN tenants t
  WHERE e.tenant_id != t.id
    AND t.subdomain IN ('test1', 'test2')
    AND e.to_address LIKE 'client@%'
) violations;

-- ====================================================================
-- RÉSUMÉ DES TESTS
-- ====================================================================
SELECT
  '🎯 RÉSUMÉ' as summary,
  (SELECT COUNT(*) FROM tenants WHERE subdomain IN ('test1', 'test2')) as tenants_created,
  (SELECT COUNT(*) FROM documents WHERE name LIKE 'Document Confidentiel%') as documents_created,
  (SELECT COUNT(*) FROM bank_accounts WHERE account_number LIKE '123456789%') as bank_accounts_created,
  (SELECT COUNT(*) FROM bank_transactions WHERE description = 'Transaction sensible') as transactions_created,
  (SELECT COUNT(*) FROM email_logs WHERE subject = 'Email confidentiel') as emails_created;

-- ====================================================================
-- NETTOYAGE (décommenter pour supprimer les données de test)
-- ====================================================================
-- DELETE FROM tenants WHERE subdomain IN ('test1', 'test2');
-- (Les données liées seront supprimées en cascade)

-- ====================================================================
-- RÉSULTAT ATTENDU:
-- ====================================================================
-- Tous les tests doivent retourner violations = 0 et result = '✅ PASS'
-- Si violations > 0 → CRITIQUE: Le middleware Prisma ne protège pas ce modèle
-- ====================================================================
