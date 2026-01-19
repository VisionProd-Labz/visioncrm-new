# Donner votre feedback - Programme Beta VisionCRM

Votre feedback est essentiel pour améliorer VisionCRM. Ce guide vous explique comment nous faire part de vos retours, suggestions et bugs.

## 🎯 Pourquoi votre feedback compte

En tant que beta testeur, vous êtes en première ligne. Votre expérience directe nous aide à:

- 🐛 **Identifier les bugs** avant le lancement public
- 💡 **Prioriser les fonctionnalités** les plus demandées
- ✨ **Améliorer l'UX/UI** selon vos usages réels
- 🚀 **Accélérer le développement** avec des insights terrain
- 🎁 **Créer un produit** qui répond vraiment à vos besoins

**Nous lisons et répondons à TOUS les feedbacks dans les 48h!**

---

## 📋 Table des matières

- [Signaler un bug](#signaler-un-bug)
- [Suggérer une fonctionnalité](#suggérer-une-fonctionnalité)
- [Partager votre expérience](#partager-votre-expérience)
- [Feedback sur l'UX/UI](#feedback-sur-luxui)
- [Demander de l'aide](#demander-de-laide)
- [Canaux de communication](#canaux-de-communication)

---

## 🐛 Signaler un bug

### Qu'est-ce qu'un bug?

Un bug est un comportement inattendu ou incorrect de l'application:

**Exemples de bugs:**
- ❌ Le bouton "Enregistrer" ne fonctionne pas
- ❌ Le total de la facture est incorrect
- ❌ La page affiche une erreur 500
- ❌ L'import CSV refuse des données valides
- ❌ L'email de confirmation n'est pas envoyé

**Pas des bugs:**
- ✅ Fonctionnalité manquante (= suggestion de feature)
- ✅ Vous ne savez pas comment faire quelque chose (= question support)
- ✅ L'interface pourrait être plus jolie (= feedback UX/UI)

### Comment signaler efficacement

#### Template de rapport de bug

```
**Titre court et descriptif**
Ex: "Erreur 500 lors de la création d'un devis"

**Description**
Décrivez le problème en quelques phrases.
Ex: "Quand je clique sur 'Créer le devis' à l'étape 3 du wizard,
j'obtiens une erreur 500 et le devis n'est pas créé."

**Étapes pour reproduire**
1. Menu → Dashboard → Nouveau Devis
2. Remplir étape 1 avec client existant (Jean Dupont)
3. Remplir étape 2 avec description de 50 caractères
4. Cliquer "Suivant"
5. À l'étape 3, cliquer "Créer le devis"
6. → Erreur 500 apparaît

**Résultat attendu**
Le devis devrait être créé et je devrais être redirigé vers la page du devis.

**Résultat actuel**
Erreur 500: "Une erreur est survenue"

**Informations système**
- Navigateur: Chrome 120.0.6099.130
- OS: Windows 11
- Date/Heure: 2026-01-15 14:32 CET

**Captures d'écran**
[Joindre capture de l'erreur]
[Joindre console développeur si possible (F12)]

**Fréquence**
- Toujours (100% du temps)
- Souvent (>50%)
- Parfois (<50%)
- Une seule fois

**Gravité**
- Bloquant: Je ne peux plus travailler
- Majeur: Fonctionnalité importante cassée
- Mineur: Gênant mais contournable
- Cosmétique: Problème visuel uniquement

**Workaround trouvé?**
Ex: "En actualisant la page et recommençant, ça fonctionne 1 fois sur 2"
```

### Où envoyer?

**Email:** beta@visioncrm.com
**Objet:** `[BUG] Titre court du bug`

**Exemple:**
```
À: beta@visioncrm.com
Objet: [BUG] Erreur 500 lors création devis
```

### Priorités de traitement

Nous priorisons selon gravité:

1. **🔴 Bloquant** (< 24h)
   - Impossible de se connecter
   - Perte de données
   - Erreur affectant tous les utilisateurs

2. **🟠 Majeur** (< 72h)
   - Fonctionnalité principale cassée
   - Affecte beaucoup d'utilisateurs
   - Pas de workaround

3. **🟡 Mineur** (< 1 semaine)
   - Fonctionnalité secondaire cassée
   - Workaround existe
   - Affecte peu d'utilisateurs

4. **⚪ Cosmétique** (backlog)
   - Problème visuel
   - N'empêche pas l'utilisation
   - Correction planifiée

### Suivi de votre bug

Après signalement:

1. **Accusé de réception** (< 24h)
   - Email de confirmation
   - Numéro de ticket (ex: BUG-#123)

2. **Analyse** (24-72h)
   - Nous reproduisons le bug
   - Diagnostic et investigation

3. **Résolution** (selon priorité)
   - Correction déployée
   - Email de notification

4. **Vérification** (vous!)
   - Vérifiez que c'est corrigé
   - Confirmez ou indiquez si persiste

---

## 💡 Suggérer une fonctionnalité

### Types de suggestions

**Nouvelles fonctionnalités:**
- Ex: "Module de gestion de stock pour pièces détachées"
- Ex: "Intégration avec WhatsApp Business"

**Améliorations:**
- Ex: "Ajouter un filtre par date sur la liste des factures"
- Ex: "Pouvoir dupliquer un devis existant"

**Optimisations:**
- Ex: "Réduire le nombre de clics pour créer un devis"
- Ex: "Raccourci clavier pour accéder aux contacts"

### Template de suggestion

```
**Titre**
Ex: "Module de gestion de stock"

**Contexte**
Décrivez pourquoi vous avez besoin de cette fonctionnalité.

Ex: "En tant que garage, je dois gérer mes pièces en stock.
Actuellement, j'utilise un fichier Excel à côté, ce qui est peu
pratique et source d'erreurs."

**Fonctionnalité souhaitée**
Décrivez précisément ce que vous imaginez.

Ex: "Un module permettant de:
- Ajouter des pièces au catalogue avec référence et prix
- Suivre les quantités en stock
- Alertes quand stock < seuil minimum
- Décrémentation automatique lors création facture
- Historique des mouvements"

**Bénéfices**
Expliquez les avantages.

Ex: "Cela me permettrait de:
- Éviter les ruptures de stock
- Gagner du temps (plus de double saisie)
- Mieux contrôler mes coûts
- Centraliser tout dans VisionCRM"

**Priorité pour vous**
- Indispensable (sans ça, j'utiliserai un autre outil)
- Important (j'en ai vraiment besoin)
- Nice to have (ce serait bien mais pas urgent)

**Exemples de référence**
Si d'autres outils le font bien, citez-les.

Ex: "Comme dans Garage Management Pro ou AutoCRM"

**Wireframe / Mockup** (optionnel)
Si vous avez une idée visuelle, partagez un dessin/schéma.
```

### Où envoyer?

**Email:** beta@visioncrm.com
**Objet:** `[FEATURE] Titre de la suggestion`

**Exemple:**
```
À: beta@visioncrm.com
Objet: [FEATURE] Module de gestion de stock
```

### Processus de traitement

1. **Réception** (< 48h)
   - Accusé de réception
   - Numéro de suggestion (FEAT-#456)

2. **Évaluation** (1-2 semaines)
   - Analyse de faisabilité
   - Estimation de l'effort
   - Priorisation vs autres demandes

3. **Décision**
   - ✅ Planifiée (ajoutée à la roadmap)
   - 🔄 En étude (besoin de plus d'infos)
   - ❌ Refusée (avec explication)

4. **Communication**
   - Email avec décision et justification
   - Si planifiée: timing estimé
   - Si refusée: alternatives proposées

### Vote pour features

**À venir**: Board public où voter pour features suggérées par la communauté beta.

En attendant:
- Si vous voulez aussi une feature suggérée par quelqu'un
- Envoyez un email: "Je +1 la suggestion FEAT-#456"
- Nous comptons les votes pour prioriser

---

## 🗣️ Partager votre expérience

### Témoignage général

Nous aimons savoir:

**Ce qui fonctionne bien:**
- Quelles fonctionnalités vous adorez?
- Qu'est-ce qui vous fait gagner du temps?
- Qu'est-ce qui vous impressionne?

**Ce qui pourrait être mieux:**
- Qu'est-ce qui vous frustre?
- Où perdez-vous du temps?
- Qu'est-ce qui manque?

**Votre usage au quotidien:**
- Comment utilisez-vous VisionCRM?
- Combien de devis/factures par semaine?
- Avec combien de membres d'équipe?
- Depuis quel type d'appareil?

### Template de témoignage

```
**Profil**
- Type d'entreprise: Garage automobile indépendant
- Taille: 5 employés
- Utilisation: Depuis 2 semaines
- Fréquence: Quotidienne

**Points positifs** ⭐
1. Le wizard de devis est super intuitif
2. J'adore le thème sombre
3. L'export PDF est professionnel

**Points à améliorer** 🔧
1. La recherche de contacts pourrait être plus rapide
2. J'aimerais pouvoir dupliquer des devis
3. Notifications par SMS seraient utiles

**Fonctionnalité favorite** 💖
La conversion devis → facture en 1 clic. Énorme gain de temps!

**Note globale** ⭐⭐⭐⭐⭐ (X/5)

**Recommanderiez-vous VisionCRM?**
Oui / Non / Peut-être

**Commentaire libre**
Votre ressenti général, anecdotes, etc.
```

### Où envoyer?

**Email:** beta@visioncrm.com
**Objet:** `[TESTIMONIAL] Retour d'expérience`

---

## 🎨 Feedback sur l'UX/UI

### Types de feedback UX/UI

**Ergonomie:**
- "Ce bouton est mal placé"
- "Je cherche toujours où est X"
- "Trop de clics pour faire Y"

**Visuel:**
- "Cette couleur est illisible"
- "L'icône ne représente pas bien la fonction"
- "Espace entre éléments trop serré"

**Accessibilité:**
- "Texte trop petit pour moi"
- "Contraste insuffisant"
- "Pas de label sur ce champ"

**Responsive:**
- "Sur mobile, ce bouton est coupé"
- "Sur tablette, la mise en page est bizarre"

### Template de feedback UX/UI

```
**Page concernée**
Ex: Dashboard > Section statistiques

**Problème identifié**
Ex: "Les cartes de stats sont trop serrées, difficile de voir les chiffres"

**Impact**
Ex: "Je dois zoomer à 125% pour lire confortablement"

**Suggestion d'amélioration**
Ex: "Plus d'espace entre les cartes, police un peu plus grande"

**Capture d'écran**
[Annoter la capture pour montrer exactement quoi]

**Appareil/Résolution**
Ex: Desktop 1920x1080, Laptop 1366x768, iPad Pro, iPhone 12...
```

### Où envoyer?

**Email:** beta@visioncrm.com
**Objet:** `[UX] Problème UX sur [Page]`

---

## ❓ Demander de l'aide

### Quand demander de l'aide?

Si vous:
- Ne savez pas comment faire quelque chose
- Avez besoin d'explications sur une fonctionnalité
- Êtes bloqué et ne trouvez pas de solution

### Avant de demander

**Consultez la documentation:**
1. [Guide de démarrage rapide](./QUICK_START.md)
2. [Guide des fonctionnalités](./FEATURES.md)
3. [FAQ](./FAQ.md)
4. [Dépannage](./TROUBLESHOOTING.md)

**Votre question est peut-être déjà répondue!**

### Template de demande d'aide

```
**Question**
Ex: "Comment puis-je modifier un devis déjà envoyé?"

**Ce que j'ai essayé**
Ex: "J'ai ouvert le devis, mais le bouton Modifier est grisé"

**Contexte**
Ex: "Le devis a été envoyé hier au client, statut 'En attente'"

**Documentation consultée**
Ex: "J'ai lu le Quick Start mais pas trouvé l'info"
```

### Où envoyer?

**Email:** beta@visioncrm.com
**Objet:** `[HELP] Question sur [Sujet]`

**Délai de réponse:** < 24h ouvrées

---

## 📢 Canaux de communication

### Email (Principal)

**beta@visioncrm.com**

**Avantages:**
- ✅ Suivi avec numéro de ticket
- ✅ Pièces jointes (captures)
- ✅ Historique conservé
- ✅ Réponse garantie < 48h

**Pour:**
- Bugs
- Suggestions
- Questions
- Témoignages

### Formulaire in-app (À venir)

**Menu → Aide → Envoyer un feedback**

**Avantages:**
- ✅ Contexte automatique (page actuelle, navigateur, etc.)
- ✅ Plus rapide
- ✅ Catégories pré-définies

**Disponibilité:** Q1 2026

### Communauté beta (À venir)

**Forum privé pour beta testeurs**

**Avantages:**
- 🤝 Échanger avec autres beta testeurs
- 💬 Discussions de groupe
- 📊 Voir les suggestions populaires
- 🗳️ Voter pour features

**Disponibilité:** Février 2026

### Newsletter beta

**Automatique pour tous les beta testeurs**

**Contenu:**
- 📰 Nouveautés et mises à jour
- 🐛 Bugs corrigés
- 💡 Features en développement
- 📊 Statistiques du programme beta
- 🎉 Célébrations des contributions

**Fréquence:** Bi-mensuelle (2x par mois)

---

## 🎁 Récompenses et reconnaissance

### Programme de contribution

**Points de contribution:**

| Action | Points |
|--------|--------|
| Signaler un bug critique | 50 pts |
| Signaler un bug majeur | 25 pts |
| Signaler un bug mineur | 10 pts |
| Suggérer une feature implémentée | 100 pts |
| Témoignage détaillé | 30 pts |
| Aider autre beta testeur (forum) | 15 pts |

**Paliers:**

- 🥉 **Bronze** (100 pts): Badge + Mention dans credits
- 🥈 **Silver** (250 pts): -20% sur abonnement à vie
- 🥇 **Gold** (500 pts): -30% + Support VIP
- 💎 **Platinum** (1000 pts): -40% + Nom au Wall of Fame + Early access features

### Classement beta testeurs

**Board mensuel** (dans l'app):
- 🏆 Top 3 contributeurs
- 📊 Vos stats personnelles
- 🎯 Objectifs du mois

### Mentions spéciales

**Dans les release notes:**
- "Merci à @Jean pour avoir signalé le bug #123"
- "Feature X suggérée par @Marie"

**Wall of Fame:**
- Page dédiée sur visioncrm.com
- Votre nom (si accord) + contribution majeure

---

## 💬 Exemples de feedbacks exemplaires

### Exemple 1: Bug bien rapporté

```
À: beta@visioncrm.com
Objet: [BUG] Calcul TVA incorrect sur factures multi-taux

Bonjour,

**Description:**
Quand je crée une facture avec des lignes à différents taux de TVA
(20% et 10%), le total TTC est incorrect.

**Étapes pour reproduire:**
1. Créer nouvelle facture
2. Ajouter ligne 1: 100€ HT, TVA 20%
3. Ajouter ligne 2: 50€ HT, TVA 10%
4. Observer le total

**Résultat attendu:**
- Ligne 1: 100€ HT + 20€ TVA = 120€ TTC
- Ligne 2: 50€ HT + 5€ TVA = 55€ TTC
- Total: 150€ HT + 25€ TVA = 175€ TTC

**Résultat actuel:**
Total affiché: 180€ TTC (semble appliquer 20% sur tout)

**Système:**
- Chrome 120.0.6099.130
- Windows 11
- 15/01/2026 16:45

**Gravité:** Majeur (erreurs de facturation)

**Captures:**
[capture_facture.png - joint]
[capture_console_F12.png - joint]

Merci!
Jean Dupont
```

**👍 Pourquoi c'est bon:**
- Titre descriptif
- Étapes claires
- Résultat attendu vs actuel
- Calculs détaillés
- Gravité justifiée
- Captures jointes

### Exemple 2: Suggestion bien formulée

```
À: beta@visioncrm.com
Objet: [FEATURE] Modèles de devis réutilisables

Bonjour,

**Contexte:**
Je suis gérant d'un garage, et je propose souvent les mêmes prestations
(vidange, révision complète, changement pneus). Actuellement, je dois
ressaisir la description à chaque fois.

**Fonctionnalité souhaitée:**
Pouvoir créer des "modèles de devis" pré-remplis que je peux réutiliser.

Exemple de workflow:
1. Je crée un modèle "Révision 15 000 km" avec toutes les prestations
2. Lors de la création d'un devis, option "Partir d'un modèle"
3. Je sélectionne le modèle
4. Les lignes sont pré-remplies
5. Je n'ai plus qu'à remplir les infos client

**Bénéfices:**
- Gain de temps énorme (je fais 20 devis/semaine)
- Cohérence des prix
- Moins d'erreurs de frappe
- Professionnel (descriptions standardisées)

**Priorité:** Important
Sans ça, je continue avec mon fichier Word de templates

**Référence:**
Garage Manager Pro a une fonction similaire qui fonctionne très bien.

Merci de considérer cette suggestion!

Cordialement,
Marie Martin
Garage Martin & Fils
```

**👍 Pourquoi c'est bon:**
- Contexte réel et détaillé
- Workflow précis
- Bénéfices quantifiés
- Priorité justifiée
- Exemple de référence

### Exemple 3: Feedback UX constructif

```
À: beta@visioncrm.com
Objet: [UX] Amélioration recherche contacts

Bonjour,

**Page:** Menu Contacts > Barre de recherche

**Observation:**
La recherche de contacts pourrait être plus puissante.

**Problèmes actuels:**
1. Recherche uniquement par nom/prénom
2. Pas de recherche par téléphone ou email
3. Pas de suggestion pendant la frappe
4. Résultats pas mis en évidence

**Suggestions d'amélioration:**
1. Recherche multi-champs (nom, email, tel, entreprise)
2. Auto-complétion avec suggestions
3. Highlight des termes recherchés dans résultats
4. Raccourci clavier (Ctrl+F ou Ctrl+K global)

**Impact:**
J'ai 500 contacts. Quand un client appelle, je cherche souvent
par numéro. Actuellement, je dois faire Ctrl+F dans navigateur.

**Mockup:**
[schema_recherche_amelioree.png - joint]

Merci!
Luc Bertrand
```

**👍 Pourquoi c'est bon:**
- Identifie problèmes précis
- Propose solutions concrètes
- Explique l'impact utilisateur
- Mockup visuel en bonus

---

## ✅ Checklist avant d'envoyer

Avant de soumettre votre feedback, vérifiez:

**Pour un bug:**
- [ ] J'ai vérifié que ce n'est pas dans [Dépannage](./TROUBLESHOOTING.md)
- [ ] J'ai les étapes exactes pour reproduire
- [ ] J'ai fait une capture d'écran
- [ ] J'ai noté la date/heure
- [ ] J'ai indiqué mon navigateur et OS

**Pour une suggestion:**
- [ ] J'ai vérifié la [roadmap](./README.md#-roadmap)
- [ ] J'ai expliqué le contexte
- [ ] J'ai décrit les bénéfices
- [ ] J'ai indiqué la priorité pour moi

**Pour tout feedback:**
- [ ] Objet email clair avec [TYPE]
- [ ] Ton respectueux et constructif
- [ ] Informations complètes

---

## 🙏 Merci!

Votre participation au programme beta est inestimable.

Chaque bug signalé rend VisionCRM plus stable.
Chaque suggestion façonne notre roadmap.
Chaque témoignage nous motive à continuer.

**Ensemble, nous construisons le meilleur CRM pour garages!**

---

**Contact:** beta@visioncrm.com
**Dernière mise à jour:** Janvier 2026
**Version:** Beta 1.0.0

[← Retour au guide principal](./README.md)
