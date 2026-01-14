'use client';

import { Shield, CheckCircle } from 'lucide-react';

export default function RGPDPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Conformité RGPD</h1>
          <p className="text-muted-foreground">
            Notre engagement pour la protection de vos données
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Vue d'ensemble</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vision CRM est entièrement conforme au Règlement Général sur la Protection des Données (RGPD).
              Nous avons mis en place des mesures techniques et organisationnelles pour garantir la sécurité
              et la confidentialité de vos données personnelles.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Mesures de conformité</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-foreground">Consentement</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Gestion granulaire des consentements avec traçabilité complète
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-foreground">Droits des utilisateurs</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Exercice facile de tous vos droits (accès, rectification, effacement, portabilité)
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-foreground">Chiffrement</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Chiffrement AES-256 des données sensibles au repos et en transit
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-foreground">Journalisation</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Logs d'accès complets pour traçabilité et audit
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-foreground">Rétention des données</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Purge automatique selon politiques définies
                </p>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-foreground">DPO</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Délégué à la Protection des Données dédié et joignable
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Vos outils RGPD</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous mettons à votre disposition des outils pour exercer facilement vos droits :
            </p>

            <div className="space-y-3">
              <a
                href="/settings/privacy"
                className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <h4 className="font-medium text-foreground">Gestion des consentements</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Gérez vos préférences de confidentialité et vos consentements
                </p>
              </a>

              <a
                href="/settings/data-rights"
                className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <h4 className="font-medium text-foreground">Exercice de vos droits</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Exportez vos données ou supprimez votre compte
                </p>
              </a>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Sous-traitants conformes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tous nos prestataires de services sont conformes au RGPD et disposent de garanties appropriées :
            </p>

            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Vercel (hébergement, infrastructure)</li>
              <li>Supabase (base de données PostgreSQL)</li>
              <li>Stripe (paiements sécurisés)</li>
              <li>Google Cloud (OCR, IA)</li>
              <li>Resend (emails transactionnels)</li>
            </ul>

            <p className="text-sm text-muted-foreground mt-4">
              Tous disposent de clauses contractuelles types de la Commission Européenne ou sont certifiés EU-US Data Privacy Framework.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Documentation</h2>
            <div className="space-y-2">
              <a href="/legal/privacy-policy" className="block text-primary underline">
                Politique de confidentialité complète
              </a>
              <a href="/legal/cookies" className="block text-primary underline">
                Politique de cookies
              </a>
              <a href="/legal/terms" className="block text-primary underline">
                Conditions générales d'utilisation
              </a>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Contact DPO</h2>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-foreground font-medium">Délégué à la Protection des Données</p>
              <p className="text-muted-foreground mt-2">
                Email : <a href="mailto:dpo@visioncrm.com" className="underline text-primary">dpo@visioncrm.com</a>
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Vous pouvez également introduire une réclamation auprès de la CNIL :{' '}
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline text-primary">
                  www.cnil.fr
                </a>
              </p>
            </div>
          </section>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Vision CRM. Conforme RGPD.</p>
        </div>
      </div>
    </div>
  );
}
