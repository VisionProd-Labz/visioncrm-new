# FAQ - Questions fréquentes

Réponses aux questions les plus courantes sur VisionCRM.

## 📋 Table des matières

- [Compte et authentification](#compte-et-authentification)
- [Devis et factures](#devis-et-factures)
- [Contacts et clients](#contacts-et-clients)
- [Paiements](#paiements)
- [Tâches et projets](#tâches-et-projets)
- [Équipe et collaboration](#équipe-et-collaboration)
- [Données et sécurité](#données-et-sécurité)
- [Facturation et abonnement](#facturation-et-abonnement)
- [Support et assistance](#support-et-assistance)

---

## Compte et authentification

### Comment créer un compte?

1. Rendez-vous sur [app.visioncrm.com/register](https://app.visioncrm.com/register)
2. Remplissez le formulaire d'inscription
3. Vérifiez votre email
4. Cliquez sur le lien de confirmation
5. Connectez-vous avec vos identifiants

**Voir aussi**: [Guide de démarrage rapide](./QUICK_START.md#1-création-de-compte)

### J'ai oublié mon mot de passe, que faire?

1. Sur la page de connexion, cliquez sur "Mot de passe oublié?"
2. Entrez votre adresse email
3. Vous recevrez un email avec un lien de réinitialisation
4. Cliquez sur le lien (valide 1 heure)
5. Créez un nouveau mot de passe

**Remarque**: Le lien expire après 1 heure pour raisons de sécurité.

### Mon mot de passe est refusé lors de l'inscription

Votre mot de passe doit respecter ces critères:

- ✅ Minimum 12 caractères
- ✅ Au moins 1 majuscule (A-Z)
- ✅ Au moins 1 minuscule (a-z)
- ✅ Au moins 1 chiffre (0-9)
- ✅ Au moins 1 caractère spécial (!@#$%^&*)

**Exemple valide**: `MonGarage2026!`

### Puis-je changer mon email de connexion?

Oui, depuis **Paramètres** → **Profil** → **Email**.

**Processus**:
1. Entrez votre nouvel email
2. Un email de confirmation est envoyé
3. Cliquez sur le lien de confirmation
4. Votre email est mis à jour

### Qu'est-ce que la double authentification (2FA)?

La 2FA ajoute une couche de sécurité en demandant un code en plus de votre mot de passe.

**Activation**:
1. **Paramètres** → **Sécurité** → **Double authentification**
2. Scannez le QR code avec une app (Google Authenticator, Authy)
3. Entrez le code de vérification
4. Sauvegardez vos codes de secours

**Recommandé** pour tous les comptes.

---

## Devis et factures

### Comment créer un devis?

**Méthode 1** (Dashboard):
1. Cliquez sur "Nouveau Devis"
2. Suivez le wizard en 3 étapes

**Méthode 2** (Menu):
1. Menu → Devis → Nouveau
2. Suivez le wizard

**Voir**: [Créer votre premier devis](./QUICK_START.md#4-créer-votre-premier-devis)

### Puis-je modifier un devis après l'avoir envoyé?

**Oui**, tant que le devis est en statut "En attente".

**Non** si le devis est:
- Accepté (convertissez-le)
- Refusé (créez un nouveau devis)
- Expiré (dupliquez-le)

**Pour modifier**:
1. Ouvrez le devis
2. Cliquez sur "Modifier"
3. Apportez vos changements
4. Sauvegardez

### Comment convertir un devis en facture?

**Méthode rapide**:
1. Ouvrez le devis
2. Cliquez sur "Convertir en facture"
3. La facture est créée automatiquement

**Résultat**:
- ✅ Facture créée avec même contenu
- ✅ Numéro de facture unique
- ✅ Statut: Non payée
- ✅ Devis marqué comme "Accepté"

### Puis-je personnaliser le template de devis/facture?

**Oui**, dans **Paramètres** → **Documents** → **Templates**.

**Personnalisations disponibles**:
- Logo entreprise
- Couleurs (header, accents)
- Police de caractères
- Mentions légales personnalisées
- Conditions générales de vente

### Comment numéroter mes devis et factures?

**Configuration**: **Paramètres** → **Numérotation**

**Options**:
- Préfixe personnalisé (ex: DEV-, FAC-)
- Numéro de départ
- Longueur minimale (avec zéros: 001, 002...)
- Réinitialisation annuelle (optionnel)

**Exemple**:
- Devis: `DEV-2026-001`, `DEV-2026-002`...
- Factures: `FAC-2026-001`, `FAC-2026-002`...

### Les devis ont-ils une date d'expiration?

**Oui**, par défaut **30 jours** après création.

**Personnalisation**:
- **Paramètres** → **Devis** → **Validité par défaut**
- Choisissez: 15, 30, 45, 60, 90 jours

**Après expiration**:
- Statut passe à "Expiré"
- Possibilité de dupliquer avec nouvelle date

---

## Contacts et clients

### Comment importer mes contacts existants?

**Via CSV**:
1. Menu → Contacts → Importer
2. Téléchargez le template CSV
3. Remplissez avec vos données (Excel, Google Sheets)
4. Importez le fichier
5. Vérifiez la prévisualisation
6. Confirmez l'import

**Colonnes requises**:
- `firstName`, `lastName`, `email`

**Colonnes optionnelles**:
- `phone`, `company`, `address`

### Puis-je fusionner des doublons?

**Actuellement**: Non automatique dans la version beta.

**Solution temporaire**:
1. Identifiez les doublons manuellement
2. Gardez le contact le plus complet
3. Transférez les données importantes (historique, notes)
4. Supprimez le doublon

**À venir**: Détection et fusion automatique dans prochaine version.

### Comment exporter ma base de contacts?

**Export CSV**:
1. Menu → Contacts
2. Cliquez sur "Exporter"
3. Choisissez "Tous les contacts" ou sélection
4. Téléchargez le fichier CSV

**Format compatible**: Excel, Google Sheets, LibreOffice

### Puis-je ajouter des champs personnalisés aux contacts?

**Pas encore** dans la version beta.

**Workaround**:
- Utilisez le champ "Notes" pour informations supplémentaires
- Structurez vos notes avec tags: `[VIP]`, `[FlotteEntreprise]`

**À venir**: Champs personnalisés dans Q2 2026.

---

## Paiements

### Quels modes de paiement puis-je accepter?

**Configurables** dans **Paramètres** → **Paiements**:

- Espèces
- Carte bancaire
- Virement bancaire
- Chèque
- Prélèvement SEPA
- PayPal
- Stripe (prochainement)

### Comment enregistrer un paiement?

1. Ouvrez la facture impayée
2. Cliquez sur "Enregistrer un paiement"
3. Renseignez:
   - Montant
   - Mode de paiement
   - Date
   - Référence (optionnel)
4. Validez

**Résultat**:
- Statut mis à jour automatiquement
- Email de confirmation envoyé au client
- Comptabilité mise à jour

### Puis-je accepter des paiements partiels?

**Oui**, totalement supporté.

**Exemple**:
- Facture: 1000€
- Paiement 1: 400€ (acompte) → Statut "Payée partiellement"
- Paiement 2: 600€ (solde) → Statut "Payée"

**Suivi**:
- Solde restant affiché
- Historique de tous les paiements
- Relances uniquement pour solde restant

### Comment gérer les retards de paiement?

**Rappels automatiques** (si activés):
- J-7: Rappel courtois
- J+3: 1er rappel
- J+15: 2e rappel
- J+30: Mise en demeure

**Actions manuelles**:
1. Ouvrez la facture en retard
2. Cliquez sur "Envoyer un rappel"
3. Choisissez le template d'email
4. Personnalisez si besoin
5. Envoyez

**Pénalités**:
- Configurables dans **Paramètres** → **Paiements**
- Taux de pénalités légales (3x taux BCE + 10 points en France)
- Indemnité forfaitaire (40€ en France)

---

## Tâches et projets

### Comment créer une tâche récurrente?

**Pas encore** dans version beta.

**Workaround**:
- Créez une tâche template
- Dupliquez-la chaque semaine/mois
- Ajustez les dates

**À venir**: Tâches récurrentes automatiques en Q2 2026.

### Puis-je assigner une tâche à plusieurs personnes?

**Non** dans version beta (1 assigné par tâche).

**Workaround**:
- Créez une tâche par personne
- Ou assignez à un manager qui délègue

**À venir**: Multi-assignation en Q3 2026.

### Comment voir toutes mes tâches à faire aujourd'hui?

**Méthode 1** (Filtre):
1. Menu → Tâches
2. Filtre: Date d'échéance = "Aujourd'hui"

**Méthode 2** (Dashboard):
- Widget "Mes tâches du jour"

**Méthode 3** (Notifications):
- Activez les rappels quotidiens (8h00)

### Les projets sont-ils créés automatiquement?

**Oui**, lors de la création d'un devis.

**Contenu auto-généré**:
- Nom du projet = Nom du client + Date
- Description = Texte du devis
- Tâches suggérées (optionnel)

**Vous pouvez aussi** créer des projets manuels indépendants.

---

## Équipe et collaboration

### Combien de membres puis-je inviter?

**Version beta**: **Illimité**

**Version commerciale** (après beta):
- Plan Starter: 3 utilisateurs
- Plan Business: 10 utilisateurs
- Plan Enterprise: Illimité

### Puis-je personnaliser les rôles et permissions?

**Pas encore** dans version beta.

**Rôles disponibles**:
- Admin (toutes permissions)
- Manager
- Commercial
- Technicien

**À venir**: Rôles personnalisés avec permissions granulaires en Q3 2026.

### Comment savoir qui a fait quelle action?

**Historique d'activité**:
- Chaque modification est tracée
- Auteur + date affichés
- Filtrable par utilisateur

**Exemple** (fiche contact):
- "Modifié par Jean Dupont le 15/01/2026 à 14:32"

**Journal d'audit complet**: **Paramètres** → **Admin** → **Journal d'audit**

### Un membre peut-il voir les salaires/tarifs?

**Dépend du rôle**:

- ✅ **Admin**: Voit tout
- ✅ **Manager**: Voit tout sauf config
- ⚠️ **Commercial**: Voit ses devis et montants
- ❌ **Technicien**: Ne voit pas les montants

**Configuration**: Ajustable dans **Paramètres** → **Permissions**

---

## Données et sécurité

### Mes données sont-elles sécurisées?

**Oui**, VisionCRM utilise les meilleures pratiques:

**Chiffrement**:
- ✅ SSL/TLS pour toutes les connexions
- ✅ Données en transit chiffrées
- ✅ Mots de passe hachés (bcrypt)

**Infrastructure**:
- ✅ Hébergement sécurisé (AWS/OVH)
- ✅ Sauvegardes quotidiennes
- ✅ Redondance des données

**Conformité**:
- ✅ RGPD compliant
- ✅ Certifications ISO 27001
- ✅ Audits de sécurité réguliers

### Où sont stockées mes données?

**Hébergement**: Union Européenne (France/Allemagne)

**Avantages**:
- Conformité RGPD
- Faible latence
- Souveraineté des données

**Providers**:
- OVH (France)
- AWS Europe (Francfort)

### Puis-je exporter toutes mes données?

**Oui**, à tout moment.

**Formats disponibles**:
- CSV (contacts, factures, devis)
- JSON (données complètes)
- PDF (documents)

**Procédure**:
1. **Paramètres** → **Données** → **Exporter**
2. Choisissez le format
3. Téléchargez l'archive ZIP

**Délai**: Immédiat pour petites bases, jusqu'à 24h pour grandes bases.

### Que se passe-t-il si je supprime mon compte?

**Données supprimées définitivement** après 30 jours.

**Pendant les 30 jours**:
- ⚠️ Compte désactivé
- 🔒 Données conservées
- ♻️ Récupération possible (contact support)

**Après 30 jours**:
- 🗑️ Suppression définitive et irréversible
- ✉️ Email de confirmation envoyé

**Avant suppression**: Exportez vos données!

### VisionCRM est-il conforme RGPD?

**Oui**, totalement conforme.

**Fonctionnalités RGPD**:
- ✅ Consentement clients (opt-in)
- ✅ Droit à l'oubli (suppression)
- ✅ Droit à la portabilité (export)
- ✅ Droit d'accès (consultation)
- ✅ Registre des traitements
- ✅ DPO désigné

**Documents**:
- [Politique de confidentialité](/legal/privacy-policy)
- [Conditions d'utilisation](/legal/terms)
- [Mentions légales RGPD](/legal/rgpd)

---

## Facturation et abonnement

### Combien coûte VisionCRM?

**Phase beta actuelle**: **GRATUIT**

**Après lancement public (Q2 2026)**:

| Plan | Prix | Utilisateurs | Fonctionnalités |
|------|------|-------------|----------------|
| **Starter** | 29€/mois | 3 | Essentielles |
| **Business** | 79€/mois | 10 | Avancées + Rapports |
| **Enterprise** | Sur devis | Illimité | Complètes + Support premium |

**Tarif préférentiel beta testeurs**: -30% à vie!

### Y a-t-il un engagement de durée?

**Non**, tous les plans sont **sans engagement**.

- Paiement mensuel
- Résiliation à tout moment
- Pas de frais cachés

### Puis-je changer de plan?

**Oui**, à tout moment.

**Upgrade** (plan supérieur):
- Effet immédiat
- Prorata du mois en cours

**Downgrade** (plan inférieur):
- Effet au prochain renouvellement
- Conservation des données

### Que se passe-t-il si je ne paie plus?

**J+7 après échéance**:
- ⚠️ Email de relance
- Accès en lecture seule

**J+30 après échéance**:
- 🔒 Compte suspendu
- Données conservées 90 jours
- Paiement requis pour réactivation

**J+90 après suspension**:
- 🗑️ Suppression définitive des données
- Email de notification final

---

## Support et assistance

### Comment contacter le support?

**Email**: beta@visioncrm.com (réponse sous 24h)

**Formulaire**: [Contactez-nous](./FEEDBACK.md)

**Documentation**: Consultez cette FAQ et les guides

**Communauté**: Forum des beta testeurs (lien dans votre dashboard)

### Quels sont les horaires du support?

**Phase beta**:
- Lundi - Vendredi: 9h - 18h (CET)
- Réponse sous 24h ouvrées

**Après lancement**:
- Support étendu selon plan souscrit
- Chat en direct (plans Business et Enterprise)

### Comment signaler un bug?

**Voir**: [Guide de feedback](./FEEDBACK.md#signaler-un-bug)

**Résumé**:
1. Décrivez le problème
2. Donnez les étapes pour reproduire
3. Ajoutez captures d'écran si possible
4. Envoyez à beta@visioncrm.com

**Priorité**: Les bugs bloquants sont traités sous 24h.

### Y a-t-il des tutoriels vidéo?

**Bientôt disponibles** sur:
- YouTube: [VisionCRM Official](https://youtube.com/visioncrm)
- Documentation: Section "Tutoriels"

**Actuellement**:
- Guides écrits complets
- Captures d'écran annotées

**Suggestion de tutoriel?** Envoyez-nous vos idées!

### Puis-je demander une nouvelle fonctionnalité?

**Absolument!** Votre feedback façonne VisionCRM.

**Processus**:
1. Consultez la [roadmap](./README.md#-roadmap)
2. Vérifiez si déjà planifiée
3. Sinon, envoyez votre suggestion via [formulaire feedback](./FEEDBACK.md)

**Nous répondons** à toutes les suggestions et priorisons selon demande.

---

## Questions techniques

### Quels navigateurs sont supportés?

**Supportés officiellement**:
- ✅ Google Chrome (version 90+)
- ✅ Firefox (version 88+)
- ✅ Safari (version 14+)
- ✅ Microsoft Edge (version 90+)

**Non supportés**:
- ❌ Internet Explorer (toutes versions)
- ❌ Navigateurs obsolètes

**Recommandé**: Chrome ou Firefox pour meilleure expérience.

### L'application fonctionne-t-elle sur mobile?

**Oui**, l'interface est responsive.

**Fonctionnalités mobiles**:
- ✅ Consultation (devis, factures, contacts)
- ✅ Création rapide (devis, tâches)
- ✅ Notifications push
- ⚠️ Édition limitée (meilleure sur tablette/desktop)

**Application native** prévue en Q3 2026 (iOS et Android).

### Puis-je utiliser VisionCRM hors ligne?

**Non** actuellement, connexion Internet requise.

**À venir** (Q4 2026):
- Mode hors ligne partiel
- Synchronisation auto au retour en ligne
- Consultation des données en cache

### Y a-t-il une API pour intégrer des outils tiers?

**Pas encore** dans version beta.

**Roadmap API publique** (Q2-Q3 2026):
- REST API complète
- Webhooks
- Documentation développeurs
- SDKs (JavaScript, Python, PHP)

**Intégrations prioritaires**:
- Stripe (paiements)
- QuickBooks (comptabilité)
- Zapier (automatisations)
- Google Workspace

---

## Autres questions

### Comment suivre les nouveautés et mises à jour?

**Notifications in-app**:
- Bandeau lors de connexion
- Popup pour features majeures

**Email newsletter**:
- Résumé mensuel
- Nouveautés et tips
- Abonnement dans **Paramètres** → **Notifications**

**Changelog**:
- Consultable dans l'app (**Menu** → **Nouveautés**)
- Historique complet des versions

### Puis-je suggérer une amélioration de cette FAQ?

**Oui!** Cette FAQ évolue grâce à vos retours.

**Envoyez vos suggestions**:
- Email: beta@visioncrm.com
- Objet: "FAQ - Suggestion"
- Décrivez la question manquante

**Mise à jour**: Cette FAQ est revue chaque mois.

---

## ❓ Question non résolue?

Si votre question n'apparaît pas dans cette FAQ:

1. Consultez les autres guides:
   - [Guide de démarrage rapide](./QUICK_START.md)
   - [Guide des fonctionnalités](./FEATURES.md)
   - [Dépannage](./TROUBLESHOOTING.md)

2. Contactez le support:
   - Email: beta@visioncrm.com
   - [Formulaire de contact](./FEEDBACK.md)

**Nous répondons à toutes les questions sous 24h!**

---

**Dernière mise à jour**: Janvier 2026
**Version**: Beta 1.0.0

[← Retour au guide principal](./README.md)
