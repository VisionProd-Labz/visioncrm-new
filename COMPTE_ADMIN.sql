-- ====================================================================
-- CRÉATION DU COMPTE ADMINISTRATEUR - VERSION FINALE
-- ====================================================================
-- À exécuter dans Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/ieptwyxmjqfrtuiwauof/sql/new
-- ====================================================================

-- ÉTAPE 1: Nettoyer le tenant existant (supprime aussi les users associés)
DELETE FROM tenants WHERE subdomain = 'demo';

-- ÉTAPE 2: Créer le tenant principal
INSERT INTO tenants (
    id,
    name,
    subdomain,
    plan,
    created_at,
    updated_at,
    currency_display,
    date_format,
    phone_clickable
)
VALUES (
    gen_random_uuid(),
    'Vision CRM',
    'demo',
    'PRO',
    NOW(),
    NOW(),
    'after',
    'DD-MM-YYYY',
    true
);

-- ÉTAPE 3: Créer l'utilisateur administrateur
INSERT INTO users (
    id,
    tenant_id,
    email,
    name,
    role,
    email_verified,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    (SELECT id FROM tenants WHERE subdomain = 'demo'),
    'admin@visioncrm.app',  -- ← CHANGE TON EMAIL ICI
    'Administrateur Principal',
    'OWNER',
    NOW(),
    NOW(),
    NOW()
);

-- ÉTAPE 4: Vérifier que tout est créé
SELECT
    u.id as user_id,
    u.email,
    u.name,
    u.role,
    t.name as tenant_name,
    t.plan,
    t.subdomain
FROM users u
JOIN tenants t ON u.tenant_id = t.id
WHERE t.subdomain = 'demo';

-- ====================================================================
-- RÉSULTAT ATTENDU:
-- ====================================================================
-- Tu devrais voir:
-- user_id | email              | name                     | role  | tenant_name | plan | subdomain
-- --------|-------------------|--------------------------|-------|-------------|------|----------
-- [uuid]  | ton-email@mail.com | Administrateur Principal | OWNER | Vision CRM  | PRO  | demo
-- ====================================================================

-- ====================================================================
-- APRÈS AVOIR EXÉCUTÉ CE SCRIPT:
-- ====================================================================
-- 1. Aller sur ton URL Vercel (ex: visioncrm-new.vercel.app)
-- 2. Cliquer "Se connecter"
-- 3. Entrer ton email (celui du script ci-dessus)
-- 4. Cliquer "Mot de passe oublié"
-- 5. Vérifier les logs Vercel pour récupérer le lien de reset
-- 6. Définir ton mot de passe
-- 7. Te connecter avec tes credentials
-- ====================================================================
