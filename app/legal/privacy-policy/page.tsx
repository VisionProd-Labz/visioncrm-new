'use client';

import { Shield, Mail, Lock, Eye, Trash2, Download, Clock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Politique de Confidentialité</h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-lg p-8 space-y-8">
          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vision CRM (ci-après "nous", "notre", "nos") s'engage à protéger et à respecter votre vie privée.
              Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons
              vos informations personnelles lorsque vous utilisez notre plateforme de gestion de la relation client (CRM).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nous sommes conformes au Règlement Général sur la Protection des Données (RGPD) et nous nous engageons
              à traiter vos données personnelles de manière transparente, sécurisée et dans le respect de vos droits.
            </p>
          </section>

          {/* Data We Collect */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              2. Données que nous collectons
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">2.1. Données d'identification</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Nom et prénom</li>
                  <li>Adresse e-mail</li>
                  <li>Numéro de téléphone</li>
                  <li>Informations de connexion (login, mot de passe hashé)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">2.2. Données d'utilisation</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Adresse IP</li>
                  <li>Type de navigateur et version</li>
                  <li>Pages visitées et temps passé</li>
                  <li>Actions effectuées dans l'application</li>
                  <li>Logs d'accès aux données sensibles</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">2.3. Données métier</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Informations sur vos clients (contacts, entreprises)</li>
                  <li>Données de véhicules</li>
                  <li>Factures et devis</li>
                  <li>Documents téléchargés</li>
                  <li>Communications (emails, messages)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              3. Comment nous utilisons vos données
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              Nous utilisons vos données personnelles pour les finalités suivantes :
            </p>

            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Fourniture du service :</strong> Gérer votre compte, vos contacts, vos factures et toutes les fonctionnalités du CRM</li>
              <li><strong>Sécurité :</strong> Authentification, prévention de la fraude, détection des abus</li>
              <li><strong>Communication :</strong> Envoi d'emails transactionnels, notifications importantes, support client</li>
              <li><strong>Amélioration du service :</strong> Analyses d'utilisation, statistiques anonymisées, développement de nouvelles fonctionnalités</li>
              <li><strong>Conformité légale :</strong> Respect des obligations comptables, fiscales et légales</li>
            </ul>

            <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
              <p className="text-sm text-foreground">
                <strong>Base légale :</strong> Le traitement de vos données repose sur l'exécution du contrat (fourniture du service),
                votre consentement (marketing), et nos obligations légales (comptabilité, fiscalité).
              </p>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Partage de vos données</h2>

            <p className="text-muted-foreground leading-relaxed">
              Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :
            </p>

            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Prestataires de services :</strong> Hébergement (Vercel, Supabase), paiements (Stripe), emails (Resend), OCR (Google Cloud Vision)</li>
              <li><strong>Obligations légales :</strong> En cas de demande judiciaire ou administrative légitime</li>
              <li><strong>Votre consentement :</strong> Avec votre autorisation explicite pour d'autres finalités</li>
            </ul>

            <p className="text-sm text-muted-foreground mt-4">
              Tous nos prestataires sont conformes au RGPD et situés dans l'Union Européenne ou disposent de garanties appropriées
              (clauses contractuelles types de la Commission Européenne).
            </p>
          </section>

          {/* Data Security */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              5. Sécurité de vos données
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Chiffrement</h4>
                <p className="text-sm text-muted-foreground">
                  Chiffrement AES-256 des données sensibles (emails, téléphones, adresses) au repos et en transit (HTTPS/TLS)
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Accès restreint</h4>
                <p className="text-sm text-muted-foreground">
                  Authentification multi-facteurs, gestion fine des rôles et permissions, journalisation des accès
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Infrastructure sécurisée</h4>
                <p className="text-sm text-muted-foreground">
                  Hébergement sur des serveurs certifiés ISO 27001, sauvegardes quotidiennes, tests de sécurité réguliers
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Surveillance 24/7, détection d'anomalies, alertes de sécurité, mises à jour régulières
                </p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              6. Durée de conservation
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              Nous conservons vos données personnelles uniquement pendant la durée nécessaire aux finalités pour lesquelles
              elles ont été collectées :
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-foreground">Type de données</th>
                    <th className="text-left p-3 text-foreground">Durée de conservation</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="p-3">Données de compte</td>
                    <td className="p-3">Durée du contrat + 3 ans</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Factures</td>
                    <td className="p-3">10 ans (obligation comptable)</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Logs d'accès</td>
                    <td className="p-3">1 an</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Données de contact inactifs</td>
                    <td className="p-3">3 ans sans activité</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-3">Documents temporaires</td>
                    <td className="p-3">90 jours</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Au-delà de ces durées, vos données sont automatiquement supprimées ou anonymisées via notre système de purge automatique.
            </p>
          </section>

          {/* Your Rights */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Download className="h-6 w-6 text-primary" />
              7. Vos droits RGPD
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">✓ Droit d'accès</h4>
                <p className="text-sm text-muted-foreground">
                  Obtenir la confirmation que vos données sont traitées et en obtenir une copie
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">✓ Droit de rectification</h4>
                <p className="text-sm text-muted-foreground">
                  Faire corriger des données inexactes ou incomplètes
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">✓ Droit à l'effacement</h4>
                <p className="text-sm text-muted-foreground">
                  Demander la suppression de vos données (droit à l'oubli)
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">✓ Droit à la portabilité</h4>
                <p className="text-sm text-muted-foreground">
                  Recevoir vos données dans un format structuré et couramment utilisé
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">✓ Droit d'opposition</h4>
                <p className="text-sm text-muted-foreground">
                  S'opposer au traitement de vos données pour des raisons légitimes
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">✓ Droit à la limitation</h4>
                <p className="text-sm text-muted-foreground">
                  Demander la limitation du traitement de vos données
                </p>
              </div>
            </div>

            <div className="p-4 bg-primary/10 border border-primary/50 rounded-lg mt-4">
              <p className="text-sm text-foreground">
                <strong>Comment exercer vos droits :</strong> Rendez-vous dans votre espace{' '}
                <a href="/settings/data-rights" className="underline">Paramètres → Droits RGPD</a> ou contactez notre DPO à{' '}
                <a href="mailto:dpo@visioncrm.com" className="underline">dpo@visioncrm.com</a>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Cookies et technologies similaires</h2>

            <p className="text-muted-foreground leading-relaxed">
              Nous utilisons des cookies et technologies similaires pour améliorer votre expérience. Pour plus d'informations,
              consultez notre <a href="/legal/cookies" className="underline text-primary">Politique de Cookies</a>.
            </p>
          </section>

          {/* Changes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Modifications de cette politique</h2>

            <p className="text-muted-foreground leading-relaxed">
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Toute modification
              sera publiée sur cette page avec une nouvelle date de "Dernière mise à jour". Nous vous encourageons à consulter
              régulièrement cette page.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              10. Contact
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              Pour toute question concernant cette politique de confidentialité ou l'utilisation de vos données personnelles :
            </p>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-foreground"><strong>Délégué à la Protection des Données (DPO)</strong></p>
              <p className="text-muted-foreground">Email : <a href="mailto:dpo@visioncrm.com" className="underline text-primary">dpo@visioncrm.com</a></p>
              <p className="text-muted-foreground">
                Vous avez également le droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline text-primary ml-1">www.cnil.fr</a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Vision CRM. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
