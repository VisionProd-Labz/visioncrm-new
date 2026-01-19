# Guide de dépannage - VisionCRM

Solutions aux problèmes courants que vous pourriez rencontrer.

## 🔍 Diagnostic rapide

Avant de commencer, vérifiez ces points de base:

- ✅ Connexion Internet stable
- ✅ Navigateur à jour (Chrome, Firefox, Safari, Edge)
- ✅ JavaScript activé
- ✅ Cookies autorisés
- ✅ Pas de bloqueur de publicités trop agressif

---

## 📋 Table des matières

- [Problèmes de connexion](#problèmes-de-connexion)
- [Problèmes d'affichage](#problèmes-daffichage)
- [Problèmes de création de devis/factures](#problèmes-de-création-de-devisfactures)
- [Problèmes d'emails](#problèmes-demails)
- [Problèmes de performance](#problèmes-de-performance)
- [Problèmes d'import/export](#problèmes-dimportexport)
- [Erreurs courantes](#erreurs-courantes)
- [Réinitialisation et dépannage avancé](#réinitialisation-et-dépannage-avancé)

---

## Problèmes de connexion

### Je ne peux pas me connecter

#### Symptôme
Message "Email ou mot de passe incorrect" alors que vous êtes sûr de vos identifiants.

#### Solutions

**1. Vérifiez votre email**
- Pas d'espaces avant/après
- Vérifiez les majuscules/minuscules
- Essayez de copier-coller depuis votre email de confirmation

**2. Réinitialisez votre mot de passe**
1. Cliquez sur "Mot de passe oublié?"
2. Entrez votre email
3. Vérifiez votre boîte mail (et spams)
4. Cliquez sur le lien dans les 60 minutes
5. Créez un nouveau mot de passe

**3. Vérifiez votre compte**
- Email vérifié? Vérifiez votre boîte de réception
- Compte actif? (pas suspendu ou supprimé)

**4. Effacez votre cache**
- Chrome: `Ctrl+Shift+Del` → Effacer les données
- Firefox: `Ctrl+Shift+Del` → Effacer l'historique
- Safari: Préférences → Confidentialité → Gérer les données

**5. Essayez en navigation privée**
- Chrome: `Ctrl+Shift+N`
- Firefox: `Ctrl+Shift+P`
- Safari: `Cmd+Shift+N`

#### Toujours bloqué?
Contactez beta@visioncrm.com avec:
- Votre email de compte
- Navigateur et version
- Capture d'écran de l'erreur

---

### Je suis déconnecté automatiquement

#### Symptôme
Votre session expire après quelques minutes d'inactivité.

#### Causes possibles
1. **Session timeout normal** (24h d'inactivité)
2. **Cookies bloqués** par le navigateur
3. **Extensions de navigateur** (bloqueurs de tracking)

#### Solutions

**1. Vérifiez les cookies**
- Autorisez les cookies pour `visioncrm.com`
- Chrome: Paramètres → Confidentialité → Cookies
- Ajoutez `[*.]visioncrm.com` aux sites autorisés

**2. Désactivez les extensions**
- Testez en navigation privée
- Si ça fonctionne, une extension bloque les cookies
- Désactivez-les une par une pour identifier le coupable

**3. Restez connecté**
- Cochez "Se souvenir de moi" à la connexion
- Session prolongée à 30 jours

**4. Double authentification (2FA)**
- Si activée, vérifiez que l'heure de votre appareil est correcte
- Les codes TOTP dépendent de l'heure exacte

---

### Email de vérification non reçu

#### Symptôme
Vous ne recevez pas l'email de confirmation après inscription.

#### Solutions

**1. Vérifiez vos dossiers**
- 📧 Boîte de réception
- 📁 Spam / Courrier indésirable
- 📁 Promotions (Gmail)
- 📁 Notifications (Outlook)

**2. Vérifiez l'adresse**
- Email correctement orthographié?
- Pas de typo (gmail.com vs gmial.com)?

**3. Renvoyez l'email**
1. Page de connexion
2. "Renvoyer l'email de vérification"
3. Entrez votre email
4. Patientez 2-3 minutes

**4. Ajoutez à vos contacts**
- Ajoutez `noreply@visioncrm.com` à vos contacts
- Renvoyez l'email de vérification

**5. Serveur mail saturé**
- Certains fournisseurs (Yahoo, Hotmail) peuvent retarder
- Patientez jusqu'à 30 minutes

#### Toujours rien?
- Email: beta@visioncrm.com
- Objet: "Email de vérification non reçu"
- Indiquez votre email d'inscription

---

## Problèmes d'affichage

### L'interface ne s'affiche pas correctement

#### Symptômes
- Mise en page cassée
- Éléments qui se chevauchent
- Boutons non cliquables
- Texte illisible

#### Solutions

**1. Actualisez la page**
- `Ctrl+R` (Windows/Linux)
- `Cmd+R` (Mac)
- Ou `F5`

**2. Videz le cache**
- `Ctrl+Shift+R` (hard refresh)
- Ou videz manuellement le cache navigateur

**3. Vérifiez le zoom**
- Zoom à 100% recommandé
- `Ctrl+0` pour réinitialiser
- Ajustez entre 90-110% si nécessaire

**4. Testez un autre navigateur**
- Chrome recommandé
- Firefox supporté
- Safari supporté (version récente)
- Edge supporté

**5. Désactivez les extensions**
- Adblockers peuvent casser l'interface
- Testez en navigation privée

**6. Vérifiez la résolution**
- Minimum: 1024x768
- Recommandé: 1920x1080
- Mobile: responsive adaptatif

---

### Les graphiques ne s'affichent pas

#### Symptôme
Espaces vides à la place des graphiques sur le dashboard.

#### Solutions

**1. JavaScript activé?**
- Vérifiez que JavaScript n'est pas bloqué
- Chrome: chrome://settings/content/javascript
- Doit être sur "Autorisé"

**2. Bloqueur de contenu**
- Désactivez AdBlock/uBlock pour VisionCRM
- Ajoutez `*.visioncrm.com` aux exceptions

**3. Donnéesdisponibles?**
- Les graphiques nécessitent des données
- Si compte nouveau, ajoutez devis/factures

**4. Console développeur**
- `F12` pour ouvrir
- Onglet "Console"
- Cherchez les erreurs (texte rouge)
- Envoyez capture à support si erreurs

---

### Thème sombre/clair ne bascule pas

#### Symptôme
Le bouton de thème ne change pas l'apparence.

#### Solutions

**1. Actualisez après changement**
- Cliquez sur le toggle
- Attendez 1-2 secondes
- Actualisez si nécessaire

**2. Préférence système**
- Vérifiez Paramètres → Apparence
- "Suivre le système" peut override votre choix
- Désactivez pour forcer un thème

**3. Cache du navigateur**
- Videz le cache
- Hard refresh (`Ctrl+Shift+R`)

---

## Problèmes de création de devis/factures

### Le wizard de devis ne valide pas l'étape 1

#### Symptôme
Bouton "Suivant" grisé ou erreurs de validation.

#### Causes et solutions

**Champs obligatoires manquants:**
- ✅ Prénom
- ✅ Nom
- ✅ Email (format valide)

**Validation email:**
- Format: `nom@domaine.com`
- Pas d'espaces
- Pas de caractères spéciaux interdits

**Email déjà utilisé:**
- Si le contact existe, sélectionnez-le plutôt
- Ou modifiez légèrement l'email

**Solutions:**
1. Vérifiez les messages d'erreur en rouge
2. Corrigez les champs invalides
3. Tous les champs obligatoires remplis
4. Email au bon format

---

### Le prompt du devis est refusé (Étape 2)

#### Symptôme
Message "Description trop courte" ou "Description invalide".

#### Causes

**Trop court:**
- Minimum **20 caractères** requis
- Actuel: compté en temps réel

**Trop long:**
- Maximum **2000 caractères**
- Utilisez le compteur affiché

**Solutions:**

**Pour description courte:**
```
❌ "Vidange"
✅ "Vidange complète du moteur avec remplacement du filtre à huile et vérification des niveaux."
```

**Pour description longue:**
- Soyez concis mais précis
- Utilisez des puces/listes
- Évitez les répétitions

**Tips:**
- Utilisez le catalogue pour pré-remplir
- Sauvegardez des templates personnels

---

### Le PDF du devis/facture ne se génère pas

#### Symptôme
Erreur lors du téléchargement ou PDF vide.

#### Solutions

**1. Vérifiez les données**
- Au moins 1 ligne de prestation
- Montants valides (nombres)
- Informations client complètes

**2. Bloqueur de popups**
- PDF s'ouvre dans nouvel onglet
- Autorisez les popups pour VisionCRM
- Chrome: Icône à droite de la barre d'adresse

**3. Réessayez**
- Fermez et rouvrez le devis
- Cliquez à nouveau sur "Télécharger PDF"
- Essayez "Aperçu" avant téléchargement

**4. Navigateur différent**
- Certains navigateurs bloquent les PDFs
- Testez avec Chrome ou Firefox

**5. Extensions PDF**
- Désactivez extensions de lecture PDF
- Téléchargez plutôt qu'ouvrir dans navigateur

#### Toujours un problème?
- Envoyez ID du devis à beta@visioncrm.com
- Nous générerons manuellement

---

### Les montants ne se calculent pas correctement

#### Symptôme
Total incorrect, TVA erronée, arrondis bizarres.

#### Vérifications

**1. Vérifiez les taux TVA**
- Paramètres → TVA
- Taux corrects? (20%, 10%, 5.5%)
- Appliqués aux bonnes lignes?

**2. Format des montants**
- Utilisez point ou virgule selon locale
- France: `1234,56` ou `1234.56`
- Pas d'espaces, pas de symboles €

**3. Arrondis**
- Arrondis à 2 décimales automatiques
- Cumul peut créer +/- 1 centime
- Normal et conforme à la loi

**Exemple calcul:**
```
Ligne 1: 100,00 € HT × 1,20 (TVA 20%) = 120,00 € TTC
Ligne 2: 50,00 € HT × 1,20 = 60,00 € TTC
Total: 150,00 € HT + 30,00 € TVA = 180,00 € TTC ✅
```

---

## Problèmes d'emails

### Les emails ne sont pas reçus par les clients

#### Symptôme
Vous envoyez un devis/facture mais client ne reçoit pas.

#### Diagnostic

**1. Vérifiez l'adresse email**
- Email du client correct?
- Pas de typo?
- Testez en vous envoyant à vous-même

**2. Vérifiez les spams**
- Demandez au client de vérifier spams
- Ajouter `noreply@visioncrm.com` aux contacts
- Marquer comme "Non spam"

**3. Serveur mail du client**
- Certains serveurs bloquent emails automatiques
- Serveurs d'entreprise parfois stricts
- Domaines jetables bloqués (tempmail, etc.)

**4. Historique d'envoi**
- Menu → Communications → Emails envoyés
- Statut de l'email?
  - ✅ Envoyé: Parti de nos serveurs
  - ✉️ Ouvert: Client a lu
  - ❌ Bounce: Rejeté par serveur destinataire

**Solutions:**

**Si Bounce (rejeté):**
- Email invalide ou inexistant
- Vérifiez et corrigez l'adresse
- Renvoyez

**Si Envoyé mais pas ouvert:**
- Patientez (délais variables)
- Vérifiez spams avec client
- Renvoyez après 24h

**Alternative:**
- Téléchargez PDF
- Envoyez manuellement depuis votre email pro
- Client recevra de votre adresse connue

---

### Les emails envoyés sont en spam

#### Symptôme
Vos clients reçoivent vos emails dans spam.

#### Causes
- Premier email d'un nouveau domaine
- Contenu détecté comme "spammy"
- Réputation du serveur d'envoi

#### Solutions

**Court terme:**
1. Demandez aux clients d'ajouter `noreply@visioncrm.com` aux contacts
2. Marquer comme "Non spam" améliore la réputation
3. Utilisez votre email personnel en CC

**Long terme:**
1. Configurez votre domaine email (à venir)
2. SPF/DKIM/DMARC (fonctionnalité future)
3. Emails depuis `votre-nom@votre-garage.fr`

**Actuellement:**
- Utilisez templates professionnels
- Évitez mots "spam" (gratuit, urgent, etc.)
- Incluez informations de contact

---

## Problèmes de performance

### L'application est lente

#### Symptôme
Chargements longs, interface qui lag, timeouts.

#### Solutions

**1. Vérifiez votre connexion**
- Test de vitesse: [fast.com](https://fast.com)
- Minimum recommandé: 2 Mbps
- Redémarrez votre box si lent

**2. Fermez les onglets inutiles**
- Navigateur surchargé ralentit tout
- Gardez seulement VisionCRM ouvert

**3. Redémarrez le navigateur**
- Ferme tous les onglets
- Relancez le navigateur
- Reconnectez-vous

**4. Videz le cache**
- Cache plein ralentit navigation
- `Ctrl+Shift+Del` → Videz cache
- Relancez

**5. Vérifiez les extensions**
- Extensions gourmandes en ressources
- Désactivez temporairement
- Testez performance

**6. Mettez à jour le navigateur**
- Version obsolète = lent
- Vérifiez mises à jour disponibles

**7. RAM insuffisante?**
- Fermez autres logiciels
- 4 GB RAM minimum recommandé
- Redémarrez votre ordinateur

---

### Les pages mettent du temps à charger

#### Symptôme
Écran blanc ou spinner qui tourne longtemps.

#### Diagnostic

**Normal:**
- Premier chargement: 2-5 secondes
- Changements de page: < 1 seconde
- Grosses listes (1000+ contacts): 3-5 secondes

**Anormal:**
- > 10 secondes systématiquement
- Timeouts fréquents
- Erreurs 504 Gateway Timeout

#### Solutions

**1. Actualisez**
- `F5` ou `Ctrl+R`
- Si bloqué > 30s, forcez: `Ctrl+Shift+R`

**2. Pagination**
- Grandes listes peuvent ralentir
- Utilisez filtres pour réduire
- "Charger plus" au lieu de "Tout afficher"

**3. Vérifiez le status**
- [status.visioncrm.com](https://status.visioncrm.com)
- Problème général ou juste vous?

**4. Heure de pointe**
- Si lent à certaines heures
- Serveurs surchargés temporairement
- Ressayez plus tard

#### Persiste?
Contactez support avec:
- Heure exacte du problème
- Page concernée
- Vitesse de connexion
- Navigateur et OS

---

## Problèmes d'import/export

### L'import CSV échoue

#### Symptômes possibles
- "Format de fichier invalide"
- "Colonnes manquantes"
- "Erreur ligne X"

#### Solutions

**1. Vérifiez le format**
- Extension: `.csv` (pas .xlsx ou .xls)
- Encodage: UTF-8 (recommandé)
- Séparateur: virgule `,`

**Conversion Excel → CSV:**
1. Excel: Fichier → Enregistrer sous
2. Format: "CSV UTF-8 (délimité par des virgules)"
3. Enregistrez

**2. Vérifiez les colonnes**

**Obligatoires:**
- `firstName`
- `lastName`
- `email`

**Optionnelles:**
- `phone`, `company`, `address`

**Exemple CSV valide:**
```csv
firstName,lastName,email,phone,company
Jean,Dupont,jean.dupont@example.com,0612345678,Garage Dupont
Marie,Martin,marie.martin@example.com,0687654321,Auto Services
```

**3. Vérifiez les données**
- Emails valides (format nom@domaine.com)
- Pas de lignes vides
- Pas de caractères spéciaux bizarres
- Guillemets pour champs avec virgules

**4. Taille du fichier**
- Maximum: 5 MB
- Maximum: 10 000 lignes par import
- Si plus, divisez en plusieurs fichiers

**5. Encodage**
- Problèmes d'accents?
- Enregistrez en UTF-8
- Notepad++, Sublime Text gèrent bien

---

### L'export CSV ne contient pas toutes les données

#### Symptôme
Export incomplet ou colonnes manquantes.

#### Vérifications

**1. Filtres actifs?**
- Si filtres appliqués avant export
- Export exporte seulement données visibles
- Enlevez filtres pour tout exporter

**2. Sélection partielle?**
- Avez-vous sélectionné des lignes?
- Export exporte seulement sélection
- Désélectionnez pour tout exporter

**3. Permissions**
- Votre rôle limite les données visibles?
- Admin voit tout, autres rôles limités

**4. Pagination**
- Export exporte toutes les pages
- Mais vérifiez que "Tout" est sélectionné
- Pas juste "Page actuelle"

---

## Erreurs courantes

### Erreur 500 - Erreur serveur

#### Que faire?

**1. Ce n'est pas votre faute**
- Erreur côté serveur VisionCRM
- Bug ou problème temporaire

**2. Réessayez**
- Actualisez la page
- Retentez l'action après 1 minute

**3. Toujours présent?**
- Contactez support immédiatement
- Indiquez l'action qui causait l'erreur
- Heure exacte
- Capture d'écran si possible

**Nous corrigerons rapidement!**

---

### Erreur 404 - Page non trouvée

#### Causes

**1. Lien obsolète**
- Signet vers ancienne URL
- Mettez à jour vos favoris

**2. Ressource supprimée**
- Devis/facture/contact supprimé
- Vérifiez qu'il existe encore

**3. Erreur de frappe URL**
- Vérifiez l'orthographe
- Retournez au menu principal

#### Solution
- Menu → Dashboard
- Naviguez normalement depuis menus

---

### Erreur 403 - Accès refusé

#### Cause
Vous n'avez pas la permission pour cette action.

#### Exemples
- Technicien tente de créer facture
- Commercial tente d'accéder paramètres admin

#### Solution
- Vérifiez votre rôle
- Demandez à un admin si besoin d'accès
- Admin peut ajuster permissions

---

### Erreur "Session expirée"

#### Cause
- Inactivité > 24h
- Cookie supprimé
- Connexion depuis autre appareil

#### Solution
**Reconnectez-vous simplement**
- Vos données sont sauvegardées
- Aucune perte d'information

---

## Réinitialisation et dépannage avancé

### Réinitialiser les paramètres

Si l'application ne fonctionne vraiment plus:

**1. Videz complètement le cache**
```
Chrome:
1. chrome://settings/clearBrowserData
2. Période: "Toutes les périodes"
3. Cochez tout
4. Effacez

Firefox:
1. about:preferences#privacy
2. Cookies et données de sites
3. Effacer les données
4. Tout cocher
```

**2. Désactivez toutes les extensions**
```
Chrome: chrome://extensions/
Firefox: about:addons
→ Désactivez tout temporairement
```

**3. Testez en navigation privée**
- Aucun cache, aucune extension
- Si ça fonctionne, un élément de votre config bloque

**4. Testez autre navigateur**
- Installez Chrome si vous utilisez autre chose
- Testez si problème persiste

---

### Console développeur

Pour diagnostics avancés:

**Ouvrir la console:**
- `F12` (Windows/Linux)
- `Cmd+Option+I` (Mac)
- Clic droit → "Inspecter"

**Onglets utiles:**

**Console:**
- Messages d'erreur (rouge)
- Avertissements (jaune)
- Copiez erreurs pour support

**Network:**
- Requêtes qui échouent (rouge)
- Temps de chargement
- Cliquez sur requête pour détails

**Application:**
- Cookies présents?
- LocalStorage correct?

**Pour nous envoyer:**
- Capture d'écran de la console
- Copie des erreurs en texte
- URL de la page concernée

---

## ❓ Problème non résolu?

Si aucune solution ci-dessus ne fonctionne:

### Contactez le support

**Email:** beta@visioncrm.com

**Informations à fournir:**

1. **Description du problème**
   - Symptômes précis
   - Quand ça a commencé
   - À quelle fréquence

2. **Étapes pour reproduire**
   - Étape 1: Je fais X
   - Étape 2: Ensuite Y
   - Résultat: Z ne fonctionne pas

3. **Environnement**
   - Navigateur et version
   - Système d'exploitation
   - Taille d'écran

4. **Captures d'écran**
   - Erreur affichée
   - Console développeur (`F12`)
   - Page complète

5. **Logs**
   - Copie des erreurs console
   - Heure exacte du problème

**Nous répondons sous 24h!**

---

**Dernière mise à jour**: Janvier 2026
**Version**: Beta 1.0.0

[← Retour au guide principal](./README.md)
