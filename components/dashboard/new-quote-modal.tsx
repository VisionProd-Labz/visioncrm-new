'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  FileText,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
} from 'lucide-react';
import { KryptonButton } from '@/components/ui/krypton';

interface NewQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
}

interface QuoteRequest {
  prompt: string;
  urgency: 'normal' | 'urgent' | 'very_urgent';
  estimatedBudget?: string;
}

export function NewQuoteModal({ open, onOpenChange }: NewQuoteModalProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Client data
  const [clientData, setClientData] = useState<ClientData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
  });

  // Quote request data
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest>({
    prompt: '',
    urgency: 'normal',
    estimatedBudget: '',
  });

  const handleNext = () => {
    // Validation
    if (step === 1) {
      if (!clientData.firstName || !clientData.lastName || !clientData.email) {
        alert('Veuillez remplir les champs obligatoires');
        return;
      }
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientData.email)) {
        alert('Veuillez entrer un email valide');
        return;
      }
    }

    if (step === 2) {
      if (!quoteRequest.prompt || quoteRequest.prompt.length < 20) {
        alert('Veuillez décrire votre demande (minimum 20 caractères)');
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // 1. Create/Get Client
      const clientResponse = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: clientData.firstName,
          lastName: clientData.lastName,
          email: clientData.email,
          phone: clientData.phone,
          company: clientData.company,
          address: clientData.address,
          type: 'CLIENT',
        }),
      });

      if (!clientResponse.ok) {
        throw new Error('Erreur lors de la création du client');
      }

      const client = await clientResponse.json();

      // 2. Create Quote
      const quoteResponse = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: client.id,
          description: quoteRequest.prompt,
          urgency: quoteRequest.urgency,
          estimatedAmount: quoteRequest.estimatedBudget
            ? parseFloat(quoteRequest.estimatedBudget)
            : null,
          status: 'DRAFT',
          aiGenerated: true,
          aiPrompt: quoteRequest.prompt,
        }),
      });

      if (!quoteResponse.ok) {
        throw new Error('Erreur lors de la création du devis');
      }

      const quote = await quoteResponse.json();

      // 3. Create Project (Kanban board)
      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Projet - ${clientData.firstName} ${clientData.lastName}`,
          description: quoteRequest.prompt,
          contactId: client.id,
          quoteId: quote.id,
          status: 'PLANNING',
        }),
      });

      if (!projectResponse.ok) {
        throw new Error('Erreur lors de la création du projet');
      }

      const project = await projectResponse.json();

      // 4. Send activation email to client
      await fetch('/api/communications/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: clientData.email,
          template: 'CLIENT_ACTIVATION',
          data: {
            firstName: clientData.firstName,
            lastName: clientData.lastName,
            quoteId: quote.id,
            projectId: project.id,
          },
        }),
      });

      // Success! Close modal and redirect to quote
      onOpenChange(false);
      router.push(`/quotes/${quote.id}`);
    } catch (error) {
      console.error('Error creating quote workflow:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setClientData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      address: '',
    });
    setQuoteRequest({
      prompt: '',
      urgency: 'normal',
      estimatedBudget: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Nouveau Devis Express
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= 1
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Client
            </span>
          </div>

          <div className="flex-1 h-0.5 bg-border mx-2" />

          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= 2
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Demande
            </span>
          </div>

          <div className="flex-1 h-0.5 bg-border mx-2" />

          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= 3
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              3
            </div>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Confirmation
            </span>
          </div>
        </div>

        {/* Step 1: Client Info */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Renseignez les informations du client pour commencer.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={clientData.firstName}
                  onChange={(e) =>
                    setClientData({ ...clientData, firstName: e.target.value })
                  }
                  placeholder="Jean"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={clientData.lastName}
                  onChange={(e) =>
                    setClientData({ ...clientData, lastName: e.target.value })
                  }
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={clientData.email}
                onChange={(e) =>
                  setClientData({ ...clientData, email: e.target.value })
                }
                placeholder="jean.dupont@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Un email d'activation sera envoyé à cette adresse
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={clientData.phone}
                onChange={(e) =>
                  setClientData({ ...clientData, phone: e.target.value })
                }
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                Entreprise
              </Label>
              <Input
                id="company"
                value={clientData.company}
                onChange={(e) =>
                  setClientData({ ...clientData, company: e.target.value })
                }
                placeholder="Nom de l'entreprise"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Adresse
              </Label>
              <Input
                id="address"
                value={clientData.address}
                onChange={(e) =>
                  setClientData({ ...clientData, address: e.target.value })
                }
                placeholder="123 Rue de la Paix, 75000 Paris"
              />
            </div>
          </div>
        )}

        {/* Step 2: Quote Request */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Décrivez la demande du client. Notre IA analysera la demande pour préparer le devis.
            </p>

            <div className="space-y-2">
              <Label htmlFor="prompt" className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-primary" />
                Description de la demande <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="prompt"
                value={quoteRequest.prompt}
                onChange={(e) =>
                  setQuoteRequest({ ...quoteRequest, prompt: e.target.value })
                }
                placeholder="Ex: Le client souhaite une révision complète de sa Peugeot 308, changement des plaquettes de frein, vidange, et vérification des pneus..."
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {quoteRequest.prompt.length} / 20 caractères minimum
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgence</Label>
              <select
                id="urgency"
                value={quoteRequest.urgency}
                onChange={(e) =>
                  setQuoteRequest({
                    ...quoteRequest,
                    urgency: e.target.value as any,
                  })
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="normal">Normale</option>
                <option value="urgent">Urgente (24-48h)</option>
                <option value="very_urgent">Très urgente (Immédiat)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedBudget">Budget estimé (optionnel)</Label>
              <Input
                id="estimatedBudget"
                type="number"
                value={quoteRequest.estimatedBudget}
                onChange={(e) =>
                  setQuoteRequest({
                    ...quoteRequest,
                    estimatedBudget: e.target.value,
                  })
                }
                placeholder="1500"
                step="0.01"
              />
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground mb-4">
              Vérifiez les informations avant de créer le devis.
            </p>

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
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm">Demande de devis</h4>
              <p className="text-sm text-foreground">{quoteRequest.prompt}</p>
              <div className="flex items-center gap-4 text-xs">
                <span className={`px-2 py-1 rounded-md ${
                  quoteRequest.urgency === 'very_urgent'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    : quoteRequest.urgency === 'urgent'
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                  {quoteRequest.urgency === 'very_urgent'
                    ? 'Très urgente'
                    : quoteRequest.urgency === 'urgent'
                    ? 'Urgente'
                    : 'Normale'}
                </span>
                {quoteRequest.estimatedBudget && (
                  <span className="text-muted-foreground">
                    Budget estimé : {quoteRequest.estimatedBudget}€
                  </span>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                📧 Notification client
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Un email d'activation sera envoyé à <strong>{clientData.email}</strong> pour qu'il puisse accéder à son espace client et suivre l'avancement du projet.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {step > 1 && (
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isLoading}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
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
                onClick={handleSubmit}
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
