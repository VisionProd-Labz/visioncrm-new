'use client';

import { Cookie } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Cookie className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Politique de Cookies</h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Qu'est-ce qu'un cookie ?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web.
              Les cookies permettent au site de mémoriser vos actions et préférences.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Les cookies que nous utilisons</h2>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium text-foreground mb-2">Cookies essentiels</h3>
                <p className="text-sm text-muted-foreground">
                  Nécessaires au fonctionnement du site (authentification, sécurité). Ces cookies ne peuvent pas être désactivés.
                </p>
                <p className="text-xs text-muted-foreground mt-2">Exemples : session, authentification, CSRF protection</p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium text-foreground mb-2">Cookies de préférences</h3>
                <p className="text-sm text-muted-foreground">
                  Permettent de mémoriser vos choix (langue, thème, paramètres d'affichage).
                </p>
                <p className="text-xs text-muted-foreground mt-2">Exemples : theme, language, sidebar_collapsed</p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium text-foreground mb-2">Cookies analytiques</h3>
                <p className="text-sm text-muted-foreground">
                  Nous permettent de comprendre comment vous utilisez le site pour l'améliorer.
                  Ces cookies sont anonymes et nécessitent votre consentement.
                </p>
                <p className="text-xs text-muted-foreground mt-2">Exemples : Google Analytics (anonymisé)</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Gérer vos cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vous pouvez gérer vos préférences de cookies dans votre espace{' '}
              <a href="/settings/privacy" className="underline text-primary">Paramètres → Confidentialité</a>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Vous pouvez également configurer votre navigateur pour refuser les cookies, mais cela peut affecter
              le fonctionnement de certaines fonctionnalités.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Cookies tiers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nous utilisons des services tiers qui peuvent placer leurs propres cookies :
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Stripe (paiements sécurisés)</li>
              <li>Google Cloud (OCR et services)</li>
              <li>Vercel Analytics (statistiques anonymisées)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Ces services ont leurs propres politiques de confidentialité et de cookies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question : <a href="mailto:dpo@visioncrm.com" className="underline text-primary">dpo@visioncrm.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
