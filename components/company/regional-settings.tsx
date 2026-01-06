'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SettingsSection } from '@/components/settings/settings-section';
import { useLanguage } from '@/contexts/language-context';

interface RegionalSettings {
  date_format: string;
  number_format: {
    decimal_separator: string;
    thousand_separator: string;
    decimals: number;
  };
  currency_display: string;
  phone_clickable: boolean;
}

export function RegionalSettings() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<RegionalSettings>({
    date_format: 'DD-MM-YYYY',
    number_format: {
      decimal_separator: ',',
      thousand_separator: ' ',
      decimals: 2,
    },
    currency_display: 'after',
    phone_clickable: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/regional');
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          // Merge with defaults to handle null values
          setSettings({
            date_format: data.settings.date_format || 'DD-MM-YYYY',
            number_format: data.settings.number_format || {
              decimal_separator: ',',
              thousand_separator: ' ',
              decimals: 2,
            },
            currency_display: data.settings.currency_display || 'after',
            phone_clickable: data.settings.phone_clickable ?? true,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching regional settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/settings/regional', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Success feedback could be added here
        alert('Paramètres régionaux enregistrés avec succès');
      }
    } catch (error) {
      console.error('Error saving regional settings:', error);
      alert('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <SettingsSection
      title={t('company.config.regional')}
      description="Configurez les formats d'affichage pour votre région"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Format */}
        <div className="space-y-2">
          <Label htmlFor="date_format">Format de date</Label>
          <select
            id="date_format"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={settings.date_format}
            onChange={(e) =>
              setSettings({ ...settings, date_format: e.target.value })
            }
          >
            <option value="DD-MM-YYYY">DD-MM-YYYY (31-12-2024)</option>
            <option value="MM-DD-YYYY">MM-DD-YYYY (12-31-2024)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
          </select>
        </div>

        {/* Number Format */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Format des nombres</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="decimal_separator">Séparateur décimal</Label>
              <Input
                id="decimal_separator"
                value={settings.number_format.decimal_separator}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    number_format: {
                      ...settings.number_format,
                      decimal_separator: e.target.value,
                    },
                  })
                }
                maxLength={1}
                placeholder=","
              />
              <p className="text-xs text-muted-foreground">Ex: 1 234,56</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="thousand_separator">Séparateur de milliers</Label>
              <Input
                id="thousand_separator"
                value={settings.number_format.thousand_separator}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    number_format: {
                      ...settings.number_format,
                      thousand_separator: e.target.value,
                    },
                  })
                }
                maxLength={1}
                placeholder=" "
              />
              <p className="text-xs text-muted-foreground">Ex: 1 234,56</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="decimals">Nombre de décimales</Label>
              <Input
                id="decimals"
                type="number"
                min="0"
                max="4"
                value={settings.number_format.decimals}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    number_format: {
                      ...settings.number_format,
                      decimals: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Currency Display */}
        <div className="space-y-2">
          <Label htmlFor="currency_display">Position du symbole monétaire</Label>
          <select
            id="currency_display"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={settings.currency_display}
            onChange={(e) =>
              setSettings({ ...settings, currency_display: e.target.value })
            }
          >
            <option value="before">Avant le montant (€ 1 234,56)</option>
            <option value="after">Après le montant (1 234,56 €)</option>
          </select>
        </div>

        {/* Phone Clickable */}
        <div className="flex items-center gap-2">
          <Switch
            checked={settings.phone_clickable}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, phone_clickable: checked })
            }
          />
          <Label>Rendre les numéros de téléphone cliquables</Label>
        </div>

        {/* Save Button */}
        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Enregistrement...' : t('company.config.save')}
        </Button>
      </form>
    </SettingsSection>
  );
}
