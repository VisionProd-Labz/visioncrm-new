/**
 * New Quote Modal - Main Orchestrator
 * Multi-step wizard for creating quotes with client information
 * Refactored with react-hook-form + Zod validation
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { KryptonButton } from '@/components/ui/krypton';
import { FileText, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { ClientStep } from './ClientStep';
import { QuoteRequestStep } from './QuoteRequestStep';
import { ConfirmationStep } from './ConfirmationStep';
import {
  ClientFormData,
  QuoteRequestFormData,
  defaultClientValues,
  defaultQuoteRequestValues,
} from './quote-wizard-schema';

interface NewQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewQuoteModal({ open, onOpenChange }: NewQuoteModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(0);

  // Step data storage
  const [clientData, setClientData] = useState<ClientFormData>(defaultClientValues);
  const [quoteRequestData, setQuoteRequestData] = useState<QuoteRequestFormData>(
    defaultQuoteRequestValues
  );

  const resetForm = () => {
    setStep(1);
    setClientData(defaultClientValues);
    setQuoteRequestData(defaultQuoteRequestValues);
    setSubmitTrigger(0);
  };

  /**
   * Handle step 1 (Client) submission
   */
  const handleClientSubmit = (data: ClientFormData) => {
    setClientData(data);
    setStep(2);
  };

  /**
   * Handle step 2 (Quote Request) submission
   */
  const handleQuoteRequestSubmit = (data: QuoteRequestFormData) => {
    setQuoteRequestData(data);
    setStep(3);
  };

  /**
   * Handle final submission (Step 3)
   * Creates client, quote, project, and sends email
   */
  const handleFinalSubmit = async () => {
    setIsLoading(true);

    try {
      // 1. Create/Get Client
      const clientResponse = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: clientData.firstName,
          last_name: clientData.lastName,
          email: clientData.email,
          phone: clientData.phone || null,
          company: clientData.company || null,
          address: clientData.address
            ? {
                street: clientData.address,
              }
            : null,
        }),
      });

      if (!clientResponse.ok) {
        const error = await clientResponse.json();
        throw new Error(error.error || 'Erreur lors de la création du client');
      }

      const client = await clientResponse.json();

      // 2. Create Quote
      const quoteResponse = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: client.contact.id,
          items: [
            {
              description: quoteRequestData.prompt,
              quantity: 1,
              unit_price: quoteRequestData.estimatedBudget
                ? parseFloat(quoteRequestData.estimatedBudget)
                : 0,
              vat_rate: 20,
            },
          ],
          notes: `Urgence: ${
            quoteRequestData.urgency === 'very_urgent'
              ? 'Très urgente'
              : quoteRequestData.urgency === 'urgent'
              ? 'Urgente'
              : 'Normale'
          }`,
        }),
      });

      if (!quoteResponse.ok) {
        const error = await quoteResponse.json();
        throw new Error(error.error || 'Erreur lors de la création du devis');
      }

      const quote = await quoteResponse.json();

      // 3. Create Project (if API exists)
      try {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Projet - ${clientData.firstName} ${clientData.lastName}`,
            description: quoteRequestData.prompt,
            contactId: client.contact.id,
            quoteId: quote.quote.id,
            status: 'PLANNING',
          }),
        });
      } catch (projectError) {
        console.warn('Project creation failed (non-blocking):', projectError);
      }

      // 4. Send activation email (non-blocking)
      try {
        await fetch('/api/communications/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: clientData.email,
            template: 'CLIENT_ACTIVATION',
            data: {
              firstName: clientData.firstName,
              lastName: clientData.lastName,
              quoteId: quote.quote.id,
            },
          }),
        });
      } catch (emailError) {
        console.warn('Email sending failed (non-blocking):', emailError);
      }

      // Success! Show toast and redirect
      toast.success('Devis créé avec succès !');
      onOpenChange(false);
      router.push(`/quotes/${quote.quote.id}`);
      resetForm();
    } catch (error) {
      console.error('[NEW_QUOTE_MODAL] Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle "Next" button click
   * Triggers form validation by incrementing submitTrigger
   */
  const handleNext = () => {
    setSubmitTrigger((prev) => prev + 1);
  };

  /**
   * Handle "Back" button click
   */
  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Nouveau Devis Express
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-4">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span
              className={`text-sm font-medium ${
                step >= 1 ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Client
            </span>
          </div>

          <div className="flex-1 h-0.5 bg-border mx-2" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span
              className={`text-sm font-medium ${
                step >= 2 ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Demande
            </span>
          </div>

          <div className="flex-1 h-0.5 bg-border mx-2" />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}
            >
              3
            </div>
            <span
              className={`text-sm font-medium ${
                step >= 3 ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Confirmation
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {step === 1 && (
            <ClientStep
              defaultValues={clientData}
              onSubmit={handleClientSubmit}
              submitTrigger={submitTrigger}
            />
          )}

          {step === 2 && (
            <QuoteRequestStep
              defaultValues={quoteRequestData}
              onSubmit={handleQuoteRequestSubmit}
              submitTrigger={submitTrigger}
            />
          )}

          {step === 3 && (
            <ConfirmationStep clientData={clientData} quoteRequestData={quoteRequestData} />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {step > 1 && (
              <Button variant="ghost" onClick={handleBack} disabled={isLoading} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>

            {step < 3 ? (
              <KryptonButton
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={isLoading}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Suivant
              </KryptonButton>
            ) : (
              <KryptonButton
                variant="success"
                size="md"
                onClick={handleFinalSubmit}
                disabled={isLoading}
                icon={<Check className="w-4 h-4" />}
                iconPosition="left"
              >
                {isLoading ? 'Création en cours...' : 'Créer le devis'}
              </KryptonButton>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
