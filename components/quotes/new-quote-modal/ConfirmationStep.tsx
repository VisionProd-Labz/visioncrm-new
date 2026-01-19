/**
 * Confirmation Step - Step 3 of Quote Creation Wizard
 * Read-only summary of client and quote request data
 */

import { ClientFormData, QuoteRequestFormData } from './quote-wizard-schema';

interface ConfirmationStepProps {
  clientData: ClientFormData;
  quoteRequestData: QuoteRequestFormData;
}

export function ConfirmationStep({ clientData, quoteRequestData }: ConfirmationStepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Vérifiez les informations avant de créer le devis.
      </p>

      {/* Client Information Summary */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-sm">Informations client</h4>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Nom :</span>{' '}
            {clientData.firstName} {clientData.lastName}
          </p>
          <p>
            <span className="text-muted-foreground">Email :</span>{' '}
            {clientData.email}
          </p>
          {clientData.phone && (
            <p>
              <span className="text-muted-foreground">Téléphone :</span>{' '}
              {clientData.phone}
            </p>
          )}
          {clientData.company && (
            <p>
              <span className="text-muted-foreground">Entreprise :</span>{' '}
              {clientData.company}
            </p>
          )}
          {clientData.address && (
            <p>
              <span className="text-muted-foreground">Adresse :</span>{' '}
              {clientData.address}
            </p>
          )}
        </div>
      </div>

      {/* Quote Request Summary */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-sm">Demande de devis</h4>
        <p className="text-sm text-foreground">{quoteRequestData.prompt}</p>
        <div className="flex items-center gap-4 text-xs">
          <span
            className={`px-2 py-1 rounded-md ${
              quoteRequestData.urgency === 'very_urgent'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                : quoteRequestData.urgency === 'urgent'
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
            }`}
          >
            {quoteRequestData.urgency === 'very_urgent'
              ? 'Très urgente'
              : quoteRequestData.urgency === 'urgent'
              ? 'Urgente'
              : 'Normale'}
          </span>
          {quoteRequestData.estimatedBudget && (
            <span className="text-muted-foreground">
              Budget estimé : {quoteRequestData.estimatedBudget}€
            </span>
          )}
        </div>
      </div>

      {/* Email Notification Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
          📧 Notification client
        </h4>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Un email d'activation sera envoyé à <strong>{clientData.email}</strong> pour
          qu'il puisse accéder à son espace client et suivre l'avancement du projet.
        </p>
      </div>
    </div>
  );
}
