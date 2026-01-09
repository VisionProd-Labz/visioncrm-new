# 📊 Plan d'Intégration - Module Comptabilité VisionCRM

## Vue d'ensemble

Ce document détaille comment intégrer les besoins comptables dans VisionCRM de manière fluide et conforme aux demandes de votre expert-comptable.

---

## ✅ Forces actuelles du CRM

Votre CRM dispose déjà de fondations solides pour la comptabilité:

1. **Rôle COMPTABLE** déjà existant dans le système
2. **Multi-tenant** - Données isolées par entreprise
3. **Système de facturation** avec gestion TVA
4. **Système de documents** (à étendre)
5. **Gestion des contacts** (réutilisable pour les fournisseurs)
6. **API structurée** facile à étendre
7. **Permissions granulaires** par rôle

---

## 📋 Réponse aux Besoins de la Comptable

### 1. BANQUES

#### Besoins:
- ✅ Relevés bancaires (PDF) de décembre 2025
- ✅ État de rapprochement bancaire au 31/12/2025
- ✅ Justificatifs mouvements et soldes (comptes titre, comptes à terme)
- ✅ Tableau d'amortissement des emprunts
- ✅ Relevé LCR
- ✅ Compte excédent

#### Solution dans le CRM:

**Page: `/accounting/bank-reconciliation`**

**Fonctionnalités:**
1. **Gestion des comptes bancaires:**
   - Ajout de plusieurs comptes (courant, épargne, compte titre, etc.)
   - Nom, IBAN, BIC, banque
   - Solde actuel et historique

2. **Import des relevés:**
   - Upload de relevés PDF (stockage et référence)
   - Import automatique CSV/OFX des transactions
   - Saisie manuelle des mouvements

3. **Rapprochement bancaire:**
   - Interface de rapprochement mensuel
   - Comparaison solde relevé vs système
   - Identification des écarts
   - Export PDF de l'état de rapprochement
   - Signature et validation de la réconciliation

4. **Documents associés:**
   - Upload des tableaux d'amortissement (PDF)
   - Relevés LCR
   - Tout autre justificatif

**Données stockées:**
```
- Comptes bancaires (nom, IBAN, BIC, banque, solde)
- Transactions (date, montant, type, description, statut)
- Réconciliations (date, solde relevé, solde système, différence, statut)
- Documents (PDF des relevés, tableaux amortissement)
```

---

### 2. VENTES

#### Besoins:
- ✅ Montant total CA HT pour l'exercice 2025
- ✅ Livre de police
- ✅ Prestations/ventes non facturées (2025)
- ✅ Factures 2026 correspondant à ventes 2025
- ✅ Factures 2025 pour prestations 2026
- ✅ Créances clients douteuses avec montants et justificatifs
- ✅ Provisions créances douteuses

#### Solution dans le CRM:

**Page: `/accounting/sales`** (extension des factures existantes)

**Fonctionnalités:**
1. **Tableau de bord des ventes:**
   - CA total HT par période (année, mois, trimestre)
   - Graphiques d'évolution
   - Export Excel/CSV
   - Livre de police automatique généré depuis les factures

2. **Gestion des factures en attente:**
   - Liste des prestations terminées non facturées
   - Alerte si prestation > 30 jours sans facture
   - Marquage des factures "décalées" (2026 pour ventes 2025)

3. **Créances douteuses:**
   - Statut "Douteux" sur les factures
   - Montant de la provision à constituer
   - Upload de justificatifs (LRAR, courriers huissier)
   - Historique des relances
   - Passage en irrécouvrable avec justificatifs

**Rapport automatique pour la comptable:**
- CA HT total exercice
- Liste factures en attente
- Liste créances douteuses avec provisions
- Export PDF/Excel prêt à transmettre

---

### 3. ACHATS

#### Besoins:
- ✅ Avoirs ou factures à recevoir (charges 2025, factures 2026)
- ✅ Marchandises livrées avant 31/12/2025 mais facturées après 01/01/2026
- ✅ Autres charges: baux, loyers, crédit-bail, assurances, restaurants, etc.

#### Solution dans le CRM:

**Page: `/accounting/expenses`**

**Fonctionnalités:**
1. **Gestion des achats/dépenses:**
   - Fiche fournisseur (liaison avec Contacts)
   - Date d'achat
   - Catégorie (marchandises, loyer, assurance, restaurant, carburant, etc.)
   - Montant HT, TVA, TTC
   - Statut: Brouillon, Soumis, Approuvé, Payé, Rejeté
   - Upload du justificatif (PDF/photo)

2. **Factures à recevoir:**
   - Création d'une dépense "À recevoir" pour charges 2025 non facturées
   - Alerte si livraison confirmée mais pas de facture
   - Rapprochement automatique quand facture arrive

3. **Catégorisation intelligente:**
   - Catégories prédéfinies: Loyer, Assurance, Restaurant, Carburant, Fournitures, etc.
   - Sous-catégories personnalisables
   - Analyse des dépenses par catégorie

4. **Gestion des restaurants:**
   - Champ "Invités" pour les repas d'affaires
   - Rappel automatique de remplir les noms
   - Export conforme pour la comptable

**Rapports:**
- Liste des factures à recevoir
- Dépenses par catégorie
- Export Excel avec tous les justificatifs

---

### 4. CAISSE

#### Besoins:
- ✅ Inventaire de caisse au 31/12/2025 (montant total espèces)
- ✅ Document signé, daté et tamponné
- ✅ Attestation de conformité de la caisse

#### Solution dans le CRM:

**Page: `/accounting/cash-register`**

**Fonctionnalités:**
1. **Gestion de caisse:**
   - Solde initial
   - Mouvements journaliers (entrées/sorties espèces)
   - Solde théorique vs solde réel
   - Écarts de caisse

2. **Inventaire de caisse:**
   - Formulaire d'inventaire au 31/12
   - Décompte par coupure (billets, pièces)
   - Total calculé automatiquement
   - Génération PDF avec signature électronique
   - Possibilité d'ajouter tampon et signature manuscrite

3. **Attestation de conformité:**
   - Upload de l'attestation de conformité de la caisse
   - Alerte si attestation expirée ou manquante

**Document généré:**
- PDF "Inventaire de caisse au 31/12/2025"
- Prêt à signer, dater et tamponner
- Export direct vers la comptable

---

### 5. SOCIAL

#### Besoins:
- ✅ Livre de paie annuel
- ✅ Écritures mensuelles avec ventilation net par salarié
- ✅ États de charges sociales, DSN
- ✅ Récapitulatif annuel salaires bruts + fiches de paie
- ✅ Congés payés à provisionner au 31/12/2025
- ✅ Primes/commissions versées après 01/01/2026 pour exercice 2025
- ✅ Bordereaux URSSAF (régularisés 2024, provisionnels 2025)
- ✅ Attestations Madelin (prévoyances, mutuelles, retraites TNS)

#### Solution dans le CRM:

**Page: `/accounting/payroll`**

**Fonctionnalités:**
1. **Stockage documents de paie:**
   - Upload du livre de paie annuel (PDF)
   - Upload des fiches de paie par salarié et par mois
   - Stockage des DSN mensuelles
   - Bordereaux URSSAF

2. **Récapitulatif des salaires:**
   - Tableau avec salaires bruts par mois et par salarié
   - Total annuel par salarié
   - Total général de la masse salariale
   - Export Excel

3. **Provisions:**
   - Champ "Congés payés à provisionner" au 31/12
   - Champ "Primes/commissions exercice antérieur"
   - Calcul automatique des provisions

4. **Documents TNS:**
   - Section dédiée aux Travailleurs Non Salariés
   - Upload bordereaux URSSAF régularisés et provisionnels
   - Upload attestations Madelin (prévoyance, mutuelle, retraite)

**Rapport automatique:**
- Récapitulatif annuel des salaires
- Liste des congés à provisionner
- Documents Madelin disponibles

---

### 6. STOCKS

#### Besoins:
- ✅ Inventaire détaillé stocks véhicules et marchandises au 31/12/2025
- ✅ Prix d'achat HT, quantités, total du stock
- ✅ Document signé, daté et tamponné
- ✅ Éléments à déprécier avec taux de dépréciation
- ✅ Marchandises payées en 2025 mais livrées après 01/01/2026
- ✅ Suivi des travaux en cours

#### Solution dans le CRM:

**Page: `/accounting/inventory`**

**Fonctionnalités:**
1. **Inventaire des véhicules:**
   - Liste des véhicules en stock au 31/12
   - Prix d'achat HT par véhicule
   - Total du stock véhicules
   - Liaison avec module Véhicules existant

2. **Inventaire marchandises:**
   - SKU/Référence
   - Désignation
   - Quantité en stock
   - Prix d'achat HT unitaire
   - Total par article
   - Total général
   - Liaison avec Catalogue produits existant

3. **Dépréciation:**
   - Colonne "À déprécier" (Oui/Non)
   - Taux de dépréciation (%)
   - Valeur dépréciée calculée automatiquement

4. **Marchandises en transit:**
   - Liste des marchandises payées mais non livrées
   - Impact sur le stock et la marge

5. **Travaux en cours:**
   - Liste des travaux/réparations en cours au 31/12
   - Coût engagé (pièces + main d'œuvre)
   - État d'avancement

**Document généré:**
- PDF "Inventaire au 31/12/2025"
- Tableau Excel détaillé
- Prêt à signer, dater et tamponner

---

### 7. AUTRES ÉLÉMENTS

#### Besoins:
- ✅ Tableau indemnités kilométriques (départ, arrivée, km)
- ✅ Carte grise
- ✅ Tableau allocations de charges
- ✅ Crédit d'impôt recherche-innovation
- ✅ Dividendes reçus
- ✅ Bilans des sociétés détenues
- ✅ Convention de trésorerie (intérêts compte courant)
- ✅ Comptes courants d'associés rémunérés
- ✅ Subventions
- ✅ Remboursements assurance (sinistres)
- ✅ Dépenses création immobilisations

#### Solution dans le CRM:

**Page: `/accounting/documents/other`**

**Fonctionnalités:**
1. **Indemnités kilométriques:**
   - Formulaire de saisie des trajets
   - Départ, arrivée, nombre de km
   - Calcul automatique selon barème fiscal
   - Export Excel avec totaux mensuels/annuels
   - Upload de la carte grise

2. **Allocations de charges:**
   - Tableau de saisie des allocations
   - Par mois
   - Export Excel

3. **Crédits d'impôt:**
   - Section dédiée CIR/CII
   - Upload des justificatifs
   - Bases de calcul

4. **Dividendes:**
   - Liste des dividendes reçus
   - Upload du document juridique
   - Montant, date, société émettrice

5. **Sociétés détenues:**
   - Liste des participations
   - Upload des bilans des sociétés détenues

6. **Conventions de trésorerie:**
   - Upload de la convention
   - Facture d'intérêts de compte courant
   - Calcul automatique si besoin

7. **Comptes courants associés:**
   - Liste des comptes courants rémunérés
   - Provision à constituer

8. **Subventions:**
   - Liste des subventions perçues
   - Documents justificatifs
   - Suivi du traitement comptable

9. **Sinistres/Assurances:**
   - Déclaration de sinistre
   - Documents assurance
   - Montant remboursé

10. **Immobilisations:**
    - Liste des dépenses liées à création d'immobilisations
    - Date de mise en service
    - Détail des composantes

---

### 8. ÉLÉMENTS DE REPRISE

#### Besoins:
- ✅ FEC (Fichiers Écritures Comptables) de l'exercice 31/12/2024
- ✅ Balances, grands livres, rapprochement bancaire
- ✅ Liasse fiscale 2024
- ✅ Liste immobilisations et amortissements au 31/12/2024

#### Solution dans le CRM:

**Page: `/accounting/documents/fiscal`**

**Fonctionnalités:**
1. **Documents de reprise:**
   - Upload du FEC 2024 (XML)
   - Upload balances (PDF/Excel)
   - Upload grands livres (PDF/Excel)
   - Upload rapprochement bancaire 2024
   - Upload liasse fiscale 2024

2. **Immobilisations:**
   - Tableau des immobilisations
   - Désignation, date acquisition, valeur, amortissement
   - Mode et durée d'amortissement
   - Import Excel pour reprise en masse

**Alerte:**
- Si fichiers manquants, rappel de contacter l'ancien cabinet

---

### 9. JURIDIQUE

#### Besoins:
- ✅ PV AGO pour affectation résultat 2024
- ✅ Déclaration RCM
- ✅ Documents changements juridiques (capital, dirigeant, etc.)

#### Solution dans le CRM:

**Page: `/accounting/documents/legal`**

**Fonctionnalités:**
1. **Documents juridiques:**
   - Upload PV d'Assemblée Générale
   - Upload déclaration RCM
   - Upload statuts
   - Upload Kbis

2. **Événements juridiques:**
   - Timeline des changements (capital, dirigeants, etc.)
   - Documents associés à chaque événement
   - Dates et nature des modifications

---

### 10. LITIGES

#### Besoins:
- ✅ Liste des litiges en cours (fournisseurs, clients, salariés)
- ✅ Sujet du litige
- ✅ Provision à constater
- ✅ Honoraires d'avocats

#### Solution dans le CRM:

**Page: `/accounting/litigation`**

**Fonctionnalités:**
1. **Gestion des litiges:**
   - Fiche litige avec:
     - Type (client, fournisseur, salarié, autre)
     - Partie adverse
     - Sujet/description
     - Date de début
     - Statut (en cours, clos)
     - Montant du litige
     - Provision à constituer
     - Risque de condamnation (faible, moyen, élevé)

2. **Honoraires d'avocats:**
   - Suivi des honoraires par litige
   - Upload des factures d'avocats
   - Total des honoraires par litige

3. **Documents:**
   - Upload courriers, assignations, jugements
   - Timeline du litige

---

## 🏗️ Structure de Navigation Proposée

```
📊 COMPTABILITÉ
├─ 📈 Tableau de bord
│  ├─ Vue d'ensemble financière
│  ├─ CA vs Dépenses
│  ├─ Trésorerie
│  └─ Alertes comptables
│
├─ 🏦 Banques
│  ├─ Comptes bancaires
│  ├─ Transactions
│  ├─ Rapprochement bancaire
│  └─ Documents (relevés, emprunts)
│
├─ 💰 Ventes
│  ├─ Chiffre d'affaires
│  ├─ Factures (déjà existant)
│  ├─ Créances douteuses
│  └─ Livre de police
│
├─ 🛒 Achats
│  ├─ Dépenses
│  ├─ Fournisseurs
│  ├─ Factures à recevoir
│  └─ Catégories de charges
│
├─ 💵 Caisse
│  ├─ Mouvements de caisse
│  ├─ Inventaire de caisse
│  └─ Attestation de conformité
│
├─ 👥 Social
│  ├─ Documents de paie
│  ├─ Récapitulatif salaires
│  ├─ Provisions (congés payés)
│  └─ Documents TNS
│
├─ 📦 Stocks
│  ├─ Inventaire véhicules
│  ├─ Inventaire marchandises
│  ├─ Dépréciations
│  └─ Travaux en cours
│
├─ 📑 Documents
│  ├─ Fiscaux (FEC, liasse)
│  ├─ Juridiques (PV, RCM)
│  ├─ Autres (IK, CIR, subventions)
│  └─ Reprise exercice antérieur
│
├─ ⚖️ Litiges
│  ├─ Liste des litiges
│  ├─ Provisions
│  └─ Honoraires avocats
│
└─ 📊 Rapports
   ├─ Bilan
   ├─ Compte de résultat
   ├─ Tableau de flux
   └─ Export comptable
```

---

## 🎯 Fonctionnalités Clés à Développer

### 1. Système de documents avancé
- **Upload multiple** de fichiers
- **Catégorisation automatique**
- **OCR** pour extraction des données (montants, dates, fournisseurs)
- **Recherche** full-text
- **Archivage** par exercice

### 2. Rapports automatiques
- **Génération PDF** de tous les documents pour la comptable
- **Export Excel** avec données structurées
- **Envoi par email** automatique des rapports mensuels
- **Signature électronique** des inventaires

### 3. Rapprochement intelligent
- **Import bancaire** CSV/OFX
- **Matching automatique** factures ↔ transactions
- **Suggestions** de rapprochement
- **Détection d'écarts**

### 4. Alertes et rappels
- **Inventaire de caisse** (31/12)
- **Factures en attente**
- **Documents manquants**
- **Déclarations fiscales**
- **Échéances importantes**

### 5. Dashboard comptable
- **KPI financiers** en temps réel
- **Graphiques** d'évolution
- **Statut** de préparation de la clôture
- **Checklist** des documents à fournir

---

## 📅 Plan de Déploiement

### Phase 1 - Fondations (2 semaines)
- ✅ Création du schéma de base de données
- ✅ API endpoints de base
- ✅ Structure de navigation
- ✅ Système de permissions

### Phase 2 - Banques & Ventes (2 semaines)
- ✅ Gestion comptes bancaires
- ✅ Rapprochement bancaire
- ✅ Dashboard des ventes
- ✅ Créances douteuses

### Phase 3 - Achats & Caisse (2 semaines)
- ✅ Gestion des dépenses
- ✅ Catégorisation
- ✅ Gestion de caisse
- ✅ Inventaire de caisse

### Phase 4 - Social & Stocks (2 semaines)
- ✅ Documents de paie
- ✅ Provisions sociales
- ✅ Inventaire stocks
- ✅ Travaux en cours

### Phase 5 - Documents & Rapports (2 semaines)
- ✅ Gestion documentaire avancée
- ✅ Documents fiscaux/juridiques
- ✅ Litiges
- ✅ Rapports financiers

### Phase 6 - Polish & Optimisation (1 semaine)
- ✅ Tests
- ✅ Optimisation performances
- ✅ Documentation utilisateur
- ✅ Formation

---

## 💡 Bénéfices Immédiats

### Pour vous (le garage)
1. **Centralisation** - Tout au même endroit
2. **Gain de temps** - Plus de recherche de documents
3. **Visibilité** - Situation financière en temps réel
4. **Conformité** - Respect des obligations

### Pour votre comptable
1. **Documents structurés** - Tout organisé comme demandé
2. **Export prêt** - Pas de reformatage
3. **Traçabilité** - Historique complet
4. **Gain de temps** - Moins d'aller-retour

### Pour votre business
1. **Pilotage** - Décisions basées sur des chiffres
2. **Anticipation** - Détection précoce des problèmes
3. **Professionnalisme** - Image sérieuse vis-à-vis des tiers
4. **Scalabilité** - Prêt pour la croissance

---

## ⚠️ Points d'Attention

1. **Formation** - Les utilisateurs devront être formés
2. **Discipline** - Saisie régulière nécessaire
3. **Intégration** - Import des données existantes à prévoir
4. **Validation** - Tests avec la comptable avant mise en production

---

## 🔐 Sécurité & Conformité

- ✅ **Chiffrement** des données sensibles
- ✅ **Backups** quotidiens
- ✅ **Audit trail** de toutes les modifications
- ✅ **RGPD** compliant
- ✅ **Accès sécurisé** pour la comptable
- ✅ **Export FEC** conforme DGFiP

---

## 📞 Prochaines Étapes

1. **Valider ce plan** avec vous
2. **Planifier une réunion** avec votre comptable pour validation
3. **Prioriser** les fonctionnalités selon urgence
4. **Démarrer le développement** par phases
5. **Tests** avec vraies données
6. **Déploiement progressif**

---

**Date:** 2026-01-09
**Version:** 1.0
**Statut:** Proposition à valider
