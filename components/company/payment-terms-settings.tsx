'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { SettingsSection } from '@/components/settings/settings-section';
import { useLanguage } from '@/contexts/language-context';

interface PaymentTerm {
  id: string;
  name: string;
  days: number;
  type: 'NET' | 'EOM';
  is_default: boolean;
  is_active: boolean;
}

export function PaymentTermsSettings() {
  const { t } = useLanguage();
  const [terms, setTerms] = useState<PaymentTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    days: '',
    type: 'NET' as 'NET' | 'EOM',
    is_default: false,
    is_active: true,
  });

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await fetch('/api/settings/payment-terms');
      if (response.ok) {
        const data = await response.json();
        setTerms(data.terms || []);
      }
    } catch (error) {
      console.error('Error fetching payment terms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/settings/payment-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          days: parseInt(formData.days),
        }),
      });

      if (response.ok) {
        await fetchTerms();
        setShowAddForm(false);
        setFormData({
          name: '',
          days: '',
          type: 'NET',
          is_default: false,
          is_active: true,
        });
      }
    } catch (error) {
      console.error('Error creating payment term:', error);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<PaymentTerm>) => {
    try {
      const response = await fetch(`/api/settings/payment-terms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchTerms();
      }
    } catch (error) {
      console.error('Error updating payment term:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('company.config.confirm_delete'))) return;

    try {
      const response = await fetch(`/api/settings/payment-terms/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTerms();
      }
    } catch (error) {
      console.error('Error deleting payment term:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <SettingsSection
      title={t('company.config.payment_terms')}
      description="Définissez les conditions de paiement proposées à vos clients"
    >
      {/* List */}
      <div className="space-y-2">
        {terms.map((term) => (
          <div
            key={term.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{term.name}</span>
                  {term.is_default && (
                    <Badge variant="default" className="text-xs">
                      {t('company.config.default')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span>{term.days} jours</span>
                  <span>•</span>
                  <span>{term.type === 'NET' ? 'Net' : 'Fin de mois'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Switch
                      checked={term.is_active}
                      onCheckedChange={(checked) =>
                        handleUpdate(term.id, { is_active: checked })
                      }
                    />
                    <span className="text-xs">
                      {term.is_active ? t('company.config.active') : 'Inactif'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUpdate(term.id, { is_default: !term.is_default })}
                title={t('company.config.set_default')}
              >
                <Check className={`h-4 w-4 ${term.is_default ? 'text-primary' : 'text-muted-foreground'}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(term.id)}
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
                placeholder="30 jours"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Nombre de jours</Label>
              <Input
                id="days"
                type="number"
                min="0"
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                placeholder="30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'NET' | 'EOM' })}
              >
                <option value="NET">Net</option>
                <option value="EOM">Fin de mois</option>
              </select>
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
                  days: '',
                  type: 'NET',
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
      {terms.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          Aucune condition de paiement configurée
        </div>
      )}
    </SettingsSection>
  );
}
