'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { SettingsSection } from '@/components/settings/settings-section';
import { useLanguage } from '@/contexts/language-context';

interface VatRate {
  id: string;
  name: string;
  rate: number;
  country: string;
  is_default: boolean;
  is_active: boolean;
}

export function VatRatesSettings() {
  const { t } = useLanguage();
  const [rates, setRates] = useState<VatRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    country: 'FR',
    is_default: false,
    is_active: true,
  });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/settings/vat-rates');
      if (response.ok) {
        const data = await response.json();
        setRates(data.vatRates || []);
      }
    } catch (error) {
      console.error('Error fetching VAT rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/settings/vat-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rate: parseFloat(formData.rate),
        }),
      });

      if (response.ok) {
        await fetchRates();
        setShowAddForm(false);
        setFormData({
          name: '',
          rate: '',
          country: 'FR',
          is_default: false,
          is_active: true,
        });
      }
    } catch (error) {
      console.error('Error creating VAT rate:', error);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<VatRate>) => {
    try {
      const response = await fetch(`/api/settings/vat-rates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchRates();
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating VAT rate:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('company.config.confirm_delete'))) return;

    try {
      const response = await fetch(`/api/settings/vat-rates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchRates();
      }
    } catch (error) {
      console.error('Error deleting VAT rate:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <SettingsSection
      title={t('company.config.vat_rates')}
      description="Gérez les taux de TVA utilisés dans vos factures et devis"
    >
      {/* List */}
      <div className="space-y-2">
        {rates.map((rate) => (
          <div
            key={rate.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{rate.name}</span>
                  {rate.is_default && (
                    <Badge variant="default" className="text-xs">
                      {t('company.config.default')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span>{rate.rate}%</span>
                  <span>•</span>
                  <span>{rate.country}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Switch
                      checked={rate.is_active}
                      onCheckedChange={(checked) =>
                        handleUpdate(rate.id, { is_active: checked })
                      }
                    />
                    <span className="text-xs">
                      {rate.is_active ? t('company.config.active') : 'Inactif'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUpdate(rate.id, { is_default: !rate.is_default })}
                title={t('company.config.set_default')}
              >
                <Check className={`h-4 w-4 ${rate.is_default ? 'text-primary' : 'text-muted-foreground'}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(rate.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 bg-muted/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="TVA Standard 20%"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Taux (%)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="20.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="FR"
                maxLength={2}
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_default}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_default: checked })
                }
              />
              <Label>Par défaut</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label>Actif</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">{t('company.config.save')}</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setFormData({
                  name: '',
                  rate: '',
                  country: 'FR',
                  is_default: false,
                  is_active: true,
                });
              }}
            >
              {t('company.config.cancel')}
            </Button>
          </div>
        </form>
      )}

      {/* Add Button */}
      {!showAddForm && (
        <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {t('company.config.add')}
        </Button>
      )}

      {/* Empty State */}
      {rates.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun taux de TVA configuré
        </div>
      )}
    </SettingsSection>
  );
}
