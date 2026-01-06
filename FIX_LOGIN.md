# 🔧 Fix Login - Étapes à suivre

## ✅ **PROBLÈME RÉSOLU**

Le compte demo n'existait pas en base. C'est maintenant corrigé !

---

## 🎯 **ÉTAPES POUR TESTER**

### 1. Arrêter le serveur de dev
Dans le terminal où `pnpm dev` tourne :
```
Ctrl + C
```

### 2. Redémarrer le serveur
```bash
pnpm dev
```

### 3. Retourner sur la page de login
```
http://localhost:3000/login
```

### 4. Se connecter
```
Email: demo@visioncrm.app
Password: demo123456!
```

---

## ✅ **CE QUI A ÉTÉ FAIT**

1. ✅ Ajouté la configuration `prisma.seed` dans package.json
2. ✅ Exécuté `pnpm prisma db seed` avec succès
3. ✅ Vérifié que l'utilisateur existe : ✅ OK
4. ✅ Testé le mot de passe : ✅ VALID
5. ✅ Variables NextAuth configurées : ✅ OK

---

## 🔍 **DIAGNOSTIC FAIT**

```
✅ User found:
   Email: demo@visioncrm.app
   Name: Marc Dupont
   Tenant: Garage Demo
   Role: OWNER
   Has password: true

🔐 Testing password: demo123456!
   Result: ✅ VALID
```

---

## 🎉 **APRÈS LE REDÉMARRAGE**

Tu devrais pouvoir :
1. ✅ Te connecter avec demo@visioncrm.app
2. ✅ Accéder au dashboard
3. ✅ Voir 2 contacts (Sophie Martin, Jean Dubois)
4. ✅ Voir 2 véhicules
5. ✅ Voir 1 devis et 1 facture
6. ✅ Voir 2 tâches

---

## 📊 **DONNÉES DEMO CRÉÉES**

### Tenant
- Nom: Garage Demo
- Subdomain: demo
- Plan: PRO

### User
- Email: demo@visioncrm.app
- Password: demo123456!
- Nom: Marc Dupont
- Role: OWNER

### Contacts (2)
- Sophie Martin (VIP) - Martin Transport
- Jean Dubois

### Véhicules (2)
- Renault Clio 2019 (AB-123-CD)
- Peugeot 308 2021 (EF-456-GH)

### Devis (1)
- DEV-2026-001 - 276€

### Factures (1)
- FACT-2026-001 - 240€

### Tâches (2)
- Rappeler Sophie Martin
- Préparer véhicule Jean Dubois

---

## ⚠️ **SI ÇA NE MARCHE TOUJOURS PAS**

### Option A: Clear le cache Next.js
```bash
Remove-Item -Recurse -Force .next
pnpm dev
```

### Option B: Vérifier les logs de la console
Ouvrir la console navigateur (F12) et voir les erreurs

### Option C: Tester l'API directement
```bash
# Dans un nouveau terminal
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@visioncrm.app","password":"demo123456!"}'
```

---

## 🚀 **APRÈS LE LOGIN**

Tu pourras tester :
- Dashboard avec KPIs
- Liste contacts
- Détails contact avec véhicules
- Création de nouveau contact
- Toutes les pages déjà développées

---

**Le compte demo est prêt ! Redémarre juste le serveur et teste.** 🎉
