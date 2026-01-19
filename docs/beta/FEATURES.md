# Guide des fonctionnalités - VisionCRM

Guide complet de toutes les fonctionnalités disponibles dans VisionCRM Beta 1.0.

## 📋 Table des matières

1. [Gestion des contacts](#1-gestion-des-contacts)
2. [Devis](#2-devis)
3. [Factures](#3-factures)
4. [Tâches et projets](#4-tâches-et-projets)
5. [Tableau de bord](#5-tableau-de-bord)
6. [Catalogue de services](#6-catalogue-de-services)
7. [Gestion d'équipe](#7-gestion-déquipe)
8. [Communications](#8-communications)
9. [Rapports et statistiques](#9-rapports-et-statistiques)
10. [Paramètres](#10-paramètres)

---

## 1. Gestion des contacts

### Vue d'ensemble

Le module Contacts vous permet de gérer votre base clients de manière centralisée.

### Fonctionnalités principales

#### Créer un contact

**Chemin**: Menu → Contacts → Nouveau Contact

**Informations disponibles:**

**Obligatoires:**
- Prénom
- Nom
- Email

**Optionnelles:**
- Téléphone
- Entreprise
- Adresse complète
- Notes internes

**Validation automatique:**
- ✅ Format email valide
- ✅ Détection de doublons (email unique)
- ✅ Numéro de téléphone au format international

#### Fiche contact détaillée

**Sections de la fiche:**

1. **Informations générales**
   - Données personnelles
   - Coordonnées
   - Date de création

2. **Historique des interactions**
   - Devis envoyés
   - Factures émises
   - Tâches associées
   - Communications (emails, appels)

3. **Documents**
   - Devis PDF
   - Factures PDF
   - Documents joints

4. **Notes**
   - Notes privées de l'équipe
   - Horodatage et auteur

5. **Statistiques**
   - Chiffre d'affaires total
   - Nombre de devis
   - Taux de conversion
   - Dernière interaction

#### Recherche et filtres

**Barre de recherche:**
- Recherche par nom, prénom, email
- Recherche instantanée (live search)
- Mise en surbrillance des résultats

**Filtres disponibles:**
- Clients actifs / inactifs
- Date de création
- Chiffre d'affaires
- Nombre de factures

**Tri:**
- Alphabétique (A-Z, Z-A)
- Date de création (récent → ancien)
- Dernière modification

#### Import / Export

**Import CSV:**
1. Menu → Contacts → Importer
2. Téléchargez le template CSV
3. Remplissez vos données
4. Importez le fichier
5. Vérifiez et validez

**Colonnes supportées:**
- firstName, lastName, email, phone, company, address

**Export CSV:**
- Exportez tous vos contacts
- Ou sélection multiple
- Format compatible Excel

#### Actions groupées

Sélectionnez plusieurs contacts pour:
- Envoyer un email groupé
- Exporter la sélection
- Supprimer (avec confirmation)
- Assigner à un commercial

---

## 2. Devis

### Wizard de création en 3 étapes

Le processus de création de devis est guidé et intuitif.

#### Étape 1: Informations client

**Options:**
1. **Sélectionner un client existant**
   - Recherche rapide
   - Auto-complétion des champs

2. **Créer un nouveau client**
   - Création à la volée
   - Enregistré automatiquement

**Champs:**
- Prénom, Nom (obligatoires)
- Email (obligatoire, validé)
- Téléphone, Entreprise, Adresse (optionnels)

#### Étape 2: Détails de la demande

**Description de la prestation:**
- Champ texte enrichi
- Minimum 20 caractères
- Maximum 2000 caractères
- Suggestions automatiques basées sur catalogue

**Urgence:**
- **Normal**: Délai standard (7-10 jours)
- **Urgent**: Traitement prioritaire (2-3 jours)
- **Très urgent**: Intervention rapide (24-48h)

**Budget estimé:**
- Optionnel
- Aide à la tarification
- Visible uniquement en interne

#### Étape 3: Confirmation

**Récapitulatif:**
- Vérification client
- Vérification description
- Prévisualisation du devis

**Actions finales:**
- Retour en arrière (modifier)
- Annuler (tout supprimer)
- Créer le devis

### Gestion des devis

#### Vue liste

**Informations affichées:**
- Numéro de devis (auto-incrémenté)
- Client
- Montant
- Date de création
- Statut (En attente, Accepté, Refusé, Expiré)
- Actions rapides

**Statuts:**
- 🟡 **En attente**: Devis envoyé, en attente de réponse
- 🟢 **Accepté**: Client a validé
- 🔴 **Refusé**: Client a décliné
- ⚫ **Expiré**: Dépassé la date de validité

**Actions disponibles:**
- 👁️ Voir le détail
- ✏️ Modifier (si statut = En attente)
- 📄 Télécharger PDF
- 📧 Renvoyer par email
- ✅ Convertir en facture
- 🗑️ Supprimer

#### Vue détaillée

**Sections:**

1. **En-tête**
   - Numéro et date
   - Statut et badge
   - Actions principales

2. **Informations client**
   - Nom, entreprise
   - Coordonnées
   - Adresse de facturation

3. **Lignes de prestation**
   - Description
   - Quantité
   - Prix unitaire
   - Montant total

4. **Totaux**
   - Sous-total HT
   - TVA (détaillée par taux)
   - **Total TTC**

5. **Conditions**
   - Conditions de paiement
   - Date de validité
   - Notes et mentions légales

#### PDF généré

**Template professionnel:**
- Logo entreprise
- Informations légales (SIRET, TVA intracommunautaire)
- Coordonnées complètes
- Tableau des prestations
- Total avec TVA
- Conditions générales de vente

**Personnalisation:**
- Couleurs de votre charte
- Ajout de logo
- Mentions personnalisées

### Conversion en facture

**Processus automatique:**
1. Cliquez sur "Convertir en facture"
2. La facture est créée avec:
   - Mêmes informations client
   - Mêmes lignes de service
   - Numéro de facture unique
   - Date du jour
   - Date d'échéance (selon conditions)
   - Statut: Non payée

---

## 3. Factures

### Création de facture

#### Création manuelle

**Chemin**: Menu → Factures → Nouvelle Facture

**Sections du formulaire:**

1. **Client**
   - Sélection ou création
   - Adresse de facturation

2. **Lignes de facturation**
   - Description
   - Quantité
   - Prix unitaire HT
   - Taux TVA
   - Total ligne

**Actions sur lignes:**
- ➕ Ajouter une ligne
- 🗑️ Supprimer une ligne
- 📋 Dupliquer une ligne
- ↕️ Réorganiser (drag & drop)

3. **Totaux calculés automatiquement**
   - Sous-total HT
   - TVA (par taux)
   - Total TTC

4. **Conditions de paiement**
   - Date d'émission
   - Date d'échéance
   - Mode de paiement accepté

#### Depuis un devis

**Conversion 1-clic:**
- Conserve toutes les informations
- Génère un numéro de facture
- Statut automatique: Non payée

### Gestion des factures

#### Statuts de paiement

- 🔴 **Impayée**: En attente de règlement
- 🟠 **Payée partiellement**: Acompte reçu
- 🟢 **Payée**: Intégralement réglée
- 🔵 **En retard**: Échéance dépassée

#### Actions disponibles

**Sur facture impayée:**
- ✏️ Modifier
- 📄 Télécharger PDF
- 📧 Envoyer rappel
- 💰 Enregistrer un paiement
- 🗑️ Supprimer

**Sur facture payée:**
- 📄 Télécharger PDF (lecture seule)
- 📧 Renvoyer par email
- 📊 Voir dans rapports

#### Suivi des paiements

**Enregistrer un paiement:**
1. Cliquez sur "Enregistrer paiement"
2. Renseignez:
   - Montant
   - Mode de paiement
   - Date de paiement
   - Référence (optionnel)
3. Validez

**Paiements partiels:**
- Enregistrez plusieurs paiements
- Suivi du solde restant
- Historique complet

**Rappels automatiques:**
- J-7 avant échéance
- J+3 après échéance (1er rappel)
- J+15 après échéance (2e rappel)
- J+30 après échéance (mise en demeure)

### Export et rapports

**Export PDF:**
- Template professionnel
- Personnalisable
- Conforme aux obligations légales

**Export comptable:**
- Format CSV
- Compatible logiciels comptables
- Export périodique (mois, trimestre, année)

---

## 4. Tâches et projets

### Gestion des tâches

#### Créer une tâche

**Informations:**

**Obligatoires:**
- Titre
- Description

**Optionnelles:**
- Priorité (Basse, Normale, Haute, Urgente)
- Date d'échéance
- Assigné à (membre d'équipe)
- Projet lié
- Catégorie
- Tags

#### Statuts de tâche

- ⚪ **À faire**: Nouvelle tâche
- 🔵 **En cours**: Travail en cours
- 🟢 **Terminée**: Tâche complétée
- 🔴 **Bloquée**: En attente ou problème

#### Vue Kanban

**Colonnes:**
1. À faire
2. En cours
3. Terminée

**Fonctionnalités:**
- Drag & drop entre colonnes
- Compteurs par colonne
- Filtres rapides
- Recherche

#### Vue Liste

**Colonnes affichées:**
- Titre
- Priorité (code couleur)
- Assigné à
- Date d'échéance
- Statut
- Actions

**Tri et filtres:**
- Par priorité
- Par assigné
- Par échéance
- Par statut
- Par projet

#### Notifications

**Alertes automatiques:**
- Tâche assignée → Email immédiat
- J-3 avant échéance → Rappel
- Échéance dépassée → Alerte
- Tâche complétée → Notification

### Gestion de projets

#### Création de projet

**Déclencheurs:**
- Automatique lors création devis
- Manuel depuis menu Projets

**Informations projet:**
- Nom
- Client associé
- Description
- Date de début
- Date de fin prévue
- Budget

#### Suivi de projet

**Vue d'ensemble:**
- Progression (%)
- Tâches (à faire / total)
- Budget (consommé / total)
- Membres de l'équipe

**Timeline:**
- Diagramme de Gantt
- Jalons importants
- Dépendances entre tâches

---

## 5. Tableau de bord

### Statistiques en temps réel

#### Cartes métriques

**Chiffre d'affaires:**
- Mensuel, trimestriel, annuel
- Évolution vs période précédente
- Graphique sparkline

**Devis:**
- Nombre en attente
- Taux de conversion (%)
- Montant moyen

**Factures:**
- Total impayé
- Nombre de retards
- Délai moyen de paiement

**Clients:**
- Total actifs
- Nouveaux ce mois
- Taux de rétention

### Graphiques

**Évolution du CA:**
- Histogramme mensuel
- Courbe de tendance
- Prévisionnel

**Répartition:**
- CA par service (camembert)
- CA par client (top 10)
- CA par commercial

**Performance:**
- Taux de conversion devis/factures
- Délai moyen de paiement
- Panier moyen

### Activité récente

**Flux chronologique:**
- 10 dernières actions
- Type d'événement (icône)
- Acteur et date
- Lien rapide vers détail

**Types d'événements:**
- Nouveau devis créé
- Devis converti en facture
- Paiement reçu
- Nouveau contact
- Tâche complétée

### Actions rapides

**Boutons d'accès direct:**
- Nouveau devis
- Nouvelle facture
- Nouveau contact
- Nouvelle tâche
- Nouveau projet

---

## 6. Catalogue de services

### Gestion du catalogue

#### Créer un service

**Informations:**
- Nom du service
- Description détaillée
- Prix HT
- Taux TVA
- Unité (heure, forfait, pièce)
- Catégorie
- Temps estimé

**Exemple:**
```
Nom: Vidange complète
Description: Vidange moteur + remplacement filtre à huile
Prix HT: 80.00 €
TVA: 20%
Unité: Forfait
Catégorie: Entretien
Temps: 1h
```

#### Catégories

**Préconfigurées:**
- Entretien
- Réparation
- Diagnostic
- Carrosserie
- Pneumatiques
- Climatisation

**Personnalisables:**
- Créez vos propres catégories
- Code couleur
- Icône

### Utilisation dans devis

**Ajout rapide:**
1. Créez un nouveau devis
2. Cliquez sur "Ajouter depuis catalogue"
3. Sélectionnez le service
4. Ajustez quantité si besoin
5. Prix et TVA pré-remplis

**Avantages:**
- ⚡ Gain de temps
- ✅ Cohérence des tarifs
- 📊 Statistiques par service

---

## 7. Gestion d'équipe

### Inviter des membres

**Processus:**
1. Menu → Équipe → Inviter
2. Renseignez email
3. Choisissez le rôle
4. Envoyez l'invitation

**Email d'invitation:**
- Lien d'activation
- Expire sous 7 jours
- Peut être renvoyé

### Rôles et permissions

#### Admin (Propriétaire)

**Toutes permissions:**
- ✅ Gestion complète
- ✅ Paramètres entreprise
- ✅ Facturation et abonnement
- ✅ Inviter/supprimer membres
- ✅ Tous les modules

#### Manager

**Permissions:**
- ✅ Créer/modifier devis et factures
- ✅ Gérer contacts
- ✅ Assigner tâches
- ✅ Voir rapports
- ❌ Paramètres entreprise
- ❌ Gestion d'équipe

#### Commercial

**Permissions:**
- ✅ Créer devis
- ✅ Voir/modifier ses contacts
- ✅ Ses tâches uniquement
- ❌ Voir toutes les factures
- ❌ Rapports financiers
- ❌ Paramètres

#### Technicien

**Permissions:**
- ✅ Voir devis assignés
- ✅ Gérer ses tâches
- ✅ Ajouter notes techniques
- ❌ Créer devis/factures
- ❌ Voir montants
- ❌ Contacts clients

### Collaboration

**Assignation:**
- Tâches assignées
- Devis assignés
- Projets en équipe

**Notifications:**
- Tâche assignée
- Mention dans commentaire
- Projet modifié

---

## 8. Communications

### Emails

#### Envoi automatique

**Événements déclencheurs:**
- Devis créé → Email client
- Facture émise → Email client
- Rappel de paiement → Email auto J+3
- Tâche assignée → Email membre

**Templates personnalisables:**
- Email de devis
- Email de facture
- Rappel de paiement
- Confirmation de paiement

#### Historique

**Suivi complet:**
- Tous emails envoyés
- Statut (envoyé, ouvert, cliqué)
- Date et heure
- Destinataire

### Messagerie interne

**Communication d'équipe:**
- Messages directs
- Discussions de projet
- Notifications

---

## 9. Rapports et statistiques

### Rapports disponibles

#### Rapport de chiffre d'affaires

**Données:**
- CA par période (jour, semaine, mois, année)
- Évolution
- Comparaison N vs N-1

**Filtres:**
- Par commercial
- Par service
- Par client
- Par mode de paiement

#### Rapport de trésorerie

**Indicateurs:**
- Encaissements prévus
- Retards de paiement
- Solde client
- Prévisionnel 30/60/90 jours

#### Rapport de performance

**Métriques:**
- Taux de conversion devis/factures
- Panier moyen
- Délai moyen devis→facture
- Nombre de devis par commercial

### Export de données

**Formats supportés:**
- CSV (Excel compatible)
- PDF (rapport imprimable)
- JSON (intégrations)

---

## 10. Paramètres

### Profil utilisateur

**Informations personnelles:**
- Nom, prénom
- Email
- Téléphone
- Photo de profil

**Préférences:**
- Langue interface
- Fuseau horaire
- Notifications (email, push)

### Profil entreprise

**Informations légales:**
- Raison sociale
- SIRET / SIREN
- TVA intracommunautaire
- Capital social
- Forme juridique (SARL, SAS, etc.)

**Coordonnées:**
- Adresse siège social
- Téléphone
- Email de contact
- Site web

**Branding:**
- Logo (400x400px recommandé)
- Couleurs principales
- Signature email

### Paramètres régionaux

**Localisation:**
- Pays
- Langue par défaut
- Fuseau horaire
- Devise (EUR, USD, GBP...)

**Formats:**
- Date (JJ/MM/AAAA, MM/DD/YYYY...)
- Heure (24h, 12h AM/PM)
- Nombres (1 234,56 ou 1,234.56)

### TVA et fiscalité

**Taux de TVA:**
- Taux standard (20% en France)
- Taux réduit (10%, 5.5%)
- Taux zéro (export)
- Personnalisés

**Numérotation:**
- Préfixe devis (DEV-)
- Préfixe facture (FAC-)
- Compteur auto-incrémenté
- Réinitialisation annuelle

### Modes de paiement

**Configurez vos modes acceptés:**
- Espèces
- Carte bancaire (CB, Visa, Mastercard)
- Virement bancaire (IBAN)
- Chèque
- Prélèvement SEPA
- PayPal, Stripe...

**Informations bancaires:**
- IBAN
- BIC
- Banque
- RIB (upload PDF)

### Conditions de paiement

**Délais configurables:**
- Paiement comptant
- 30 jours fin de mois
- 45 jours fin de mois
- 60 jours
- Personnalisé

**Pénalités:**
- Taux de pénalités de retard
- Indemnité forfaitaire
- Escompte (si paiement anticipé)

### Templates de documents

**Personnalisation:**
- Template devis
- Template facture
- Template email
- Template rappel

**Éditeur WYSIWYG:**
- Variables dynamiques
- Mise en page
- Conditions générales

### Sécurité

**Authentification:**
- Mot de passe fort requis
- Double authentification (2FA) recommandée
- Sessions sécurisées

**Sauvegardes:**
- Quotidiennes automatiques
- Rétention 30 jours
- Export manuel à tout moment

**Confidentialité:**
- Conformité RGPD
- Gestion des consentements
- Droit à l'effacement
- Portabilité des données

---

## 🔍 Navigation rapide

### Raccourcis clavier

- `⌘K` / `Ctrl+K` - Recherche globale
- `⌘N` / `Ctrl+N` - Nouvelle entrée (selon page)
- `Échap` - Fermer modal
- `⌘S` / `Ctrl+S` - Sauvegarder
- `⌘P` / `Ctrl+P` - Imprimer/PDF

### Recherche globale (⌘K)

**Recherchez dans:**
- Contacts
- Devis
- Factures
- Tâches
- Projets
- Documents

**Résultats:**
- Classés par pertinence
- Type d'élément (icône)
- Navigation directe

---

**Version**: Beta 1.0.0
**Dernière mise à jour**: Janvier 2026

[← Retour au guide principal](./README.md)
