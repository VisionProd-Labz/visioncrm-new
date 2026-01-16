-- ====================================================================
-- DÉFINIR LE MOT DE PASSE ADMIN
-- ====================================================================
-- À exécuter dans Supabase SQL Editor après avoir créé le compte
-- ====================================================================

-- Hash bcrypt pour le mot de passe: "Admin123!"
-- Tu pourras le changer après la première connexion

UPDATE users
SET password = '$2a$10$YQ98PjqRARJIDWKSKqZ1OeL8XlqB7vU5J.LCU5i2Zo9Y9ZzH5dWLC'
WHERE email = 'nicouebeglah@gmail.com';  -- ← TON EMAIL

-- Vérifier que le mot de passe est défini
SELECT
    email,
    name,
    role,
    CASE
        WHEN password IS NOT NULL THEN '✓ Mot de passe défini'
        ELSE '✗ Pas de mot de passe'
    END as password_status
FROM users
WHERE email = 'nicouebeglah@gmail.com';  -- ← TON EMAIL

-- ====================================================================
-- CREDENTIALS POUR SE CONNECTER:
-- ====================================================================
-- Email: nicouebeglah@gmail.com (ou ton email)
-- Mot de passe: Admin123!
--
-- IMPORTANT: Change le mot de passe après la première connexion!
-- ====================================================================
