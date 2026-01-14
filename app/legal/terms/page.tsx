'use client';

import { FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <FileText className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Conditions Générales d'Utilisation</h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Acceptation des conditions</h2>
            <p className="text-muted-foreground leading-relaxed">
              En accédant et en utilisant Vision CRM, vous acceptez d'être lié par ces conditions générales d'utilisation.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Description du service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vision CRM est une plateforme de gestion de la relation client (CRM) conçue pour les professionnels de l'automobile.
              Le service permet de gérer vos contacts, véhicules, devis, factures, et communications client.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Compte utilisateur</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Vous êtes responsable de la confidentialité de vos identifiants de connexion</li>
              <li>Vous devez fournir des informations exactes lors de l'inscription</li>
              <li>Vous devez notifier immédiatement toute utilisation non autorisée de votre compte</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Propriété intellectuelle</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tous les droits de propriété intellectuelle relatifs à Vision CRM appartiennent à Vision CRM.
              Vous conservez tous les droits sur les données que vous téléchargez sur la plateforme.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Utilisation acceptable</h2>
            <p className="text-muted-foreground leading-relaxed">Vous vous engagez à :</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Respecter toutes les lois et réglementations applicables</li>
              <li>Ne pas utiliser le service à des fins illégales ou frauduleuses</li>
              <li>Ne pas tenter d'accéder aux comptes d'autres utilisateurs</li>
              <li>Ne pas perturber ou endommager le service</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Limitation de responsabilité</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vision CRM est fourni "tel quel" sans garantie d'aucune sorte. Nous ne serons pas responsables des dommages
              indirects, accessoires ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser le service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Résiliation</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous nous réservons le droit de suspendre ou de résilier votre accès au service à tout moment,
              avec ou sans préavis, en cas de violation de ces conditions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question : <a href="mailto:support@visioncrm.com" className="underline text-primary">support@visioncrm.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
