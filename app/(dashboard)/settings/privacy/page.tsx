'use client';

import { useState, useEffect } from 'react';
import { Shield, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type ConsentType = 'MARKETING_EMAIL' | 'MARKETING_SMS' | 'DATA_PROCESSING' | 'ANALYTICS' | 'THIRD_PARTY_SHARING';

interface Consent {
  consent_type: ConsentType;
  is_granted: boolean;
  granted_at?: string;
  updated_at?: string;
  revoked_at?: string;
}

const consentDescriptions: Record<ConsentType, { title: string; description: string; required?: boolean }> = {
  DATA_PROCESSING: {
    title: 'Traitement des données',
    description: 'Autoriser le traitement de vos données personnelles pour l\'utilisation du service. Ce consentement est obligatoire pour utiliser la plateforme.',
    required: true,
  },
  ANALYTICS: {
    title: 'Analyses et statistiques',
    description: 'Nous permettre de collecter des données anonymisées pour améliorer l\'expérience utilisateur et le service.',
  },
  MARKETING_EMAIL: {
    title: 'Communications marketing par email',
    description: 'Recevoir des emails promotionnels, newsletters et offres spéciales.',
  },
  MARKETING_SMS: {
    title: 'Communications marketing par SMS',
    description: 'Recevoir des SMS promotionnels et notifications marketing.',
  },
  THIRD_PARTY_SHARING: {
    title: 'Partage avec des tiers',
    description: 'Autoriser le partage de vos données avec nos partenaires de confiance (jamais pour de la publicité).',
  },
};

export default function PrivacyPage() {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<ConsentType | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConsents();
  }, []);

  const fetchConsents = async () => {
    try {
      const response = await fetch('/api/rgpd/consents');
      if (!response.ok) throw new Error('Failed to fetch consents');
      const data = await response.json();
      setConsents(data.consents);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger vos préférences de confidentialité',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConsent = async (consentType: ConsentType, currentValue: boolean) => {
    const newValue = !currentValue;

    // Prevent unchecking required consents
    if (!newValue && consentDescriptions[consentType].required) {
      toast({
        variant: 'destructive',
        title: 'Consentement obligatoire',
        description: 'Ce consentement est nécessaire pour utiliser la plateforme.',
      });
      return;
    }

    setSaving(consentType);

    try {
      const response = await fetch('/api/rgpd/consents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_type: consentType,
          is_granted: newValue,
        }),
      });

      if (!response.ok) throw new Error('Failed to update consent');

      // Update local state
      setConsents(prev =>
        prev.map(c =>
          c.consent_type === consentType
            ? { ...c, is_granted: newValue, updated_at: new Date().toISOString() }
            : c
        )
      );

      toast({
        title: 'Préférences mises à jour',
        description: newValue
          ? 'Consentement accordé avec succès'
          : 'Consentement retiré avec succès',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour vos préférences',
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Confidentialité et consentements</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Gérez vos préférences de confidentialité et consentements RGPD
        </p>
      </div>

      {/* Consents List */}
      <div className="bg-card border border-border rounded-lg">
        <div className="divide-y divide-border">
          {Object.entries(consentDescriptions).map(([type, info]) => {
            const consent = consents.find(c => c.consent_type === type);
            const isGranted = consent?.is_granted || false;
            const isSaving = saving === type;

            return (
              <div key={type} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-semibold text-foreground">
                        {info.title}
                      </Label>
                      {info.required && (
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                          Obligatoire
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {info.description}
                    </p>
                    {consent?.updated_at && (
                      <p className="text-xs text-muted-foreground">
                        Dernière mise à jour : {new Date(consent.updated_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <button
                        onClick={() => handleToggleConsent(type as ConsentType, isGranted)}
                        disabled={info.required && isGranted}
                        className="relative inline-flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <input
                          type="checkbox"
                          checked={isGranted}
                          readOnly
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full peer transition-colors ${
                          isGranted ? 'bg-primary' : 'bg-muted'
                        } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring`}>
                          <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                            isGranted ? 'translate-x-full' : ''
                          } flex items-center justify-center`}>
                            {isGranted ? (
                              <Check className="h-3 w-3 text-primary" />
                            ) : (
                              <X className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-lg border border-blue-500/50 bg-blue-500/10">
        <p className="text-sm text-foreground">
          <strong>Information importante :</strong> Vous pouvez modifier vos consentements à tout moment.
          Ces paramètres respectent le Règlement Général sur la Protection des Données (RGPD).
        </p>
      </div>

      {/* Related Links */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Ressources utiles</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/legal/privacy-policy" target="_blank">
              Politique de confidentialité
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/settings/data-rights">
              Exercer mes droits RGPD
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
