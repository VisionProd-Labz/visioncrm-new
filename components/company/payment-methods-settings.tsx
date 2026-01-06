'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { SettingsSection } from '@/components/settings/settings-section';
import { useLanguage } from '@/contexts/language-context';

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
}

export function PaymentMethodsSettings() {
  const { t } = useLanguage();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    is_default: false,
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const response = await fetch('/api/settings/payment-methods');
      if (response.ok) {
        const data = await response.json();
        setMethods(data.methods || []);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/settings/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchMethods();
        setShowAddForm(false);
        setFormData({
          name: '',
          code: '',
          is_default: false,
          is_active: true,
          sort_order: 0,
        });
      }
    } catch (error) {
      console.error('Error creating payment method:', error);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<PaymentMethod>) => {
    try {
      const response = await fetch(`/api/settings/payment-methods/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchMethods();
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('company.config.confirm_delete'))) return;

    try {
      const response = await fetch(`/api/settings/payment-methods/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMethods();
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <SettingsSection
      title={t('company.config.payment_methods')}
      description="Configurez les moyens de paiement acceptés"
    >
      {/* List */}
      <div className="space-y-2">
        {methods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{method.name}</span>
                  {method.is_default && (
                    <Badge variant="default" className="text-xs">
                      {t('company.config.default')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="font-mono text-xs">{method.code}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Switch
                      checked={method.is_active}
                      onCheckedChange={(checked) =>
                        handleUpdate(method.id, { is_active: checked })
                      }
                    />
                    <span className="text-xs">
                      {method.is_active ? t('company.config.active') : 'Inactif'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUpdate(method.id, { is_default: !method.is_default })}
                title={t('company.config.set_default')}
              >
                <Check className={`h-4 w-4 ${method.is_default ? 'text-primary' : 'text-muted-foreground'}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(method.id)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Carte bancaire"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="CARD"
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
                  code: '',
                  is_default: false,
                  is_active: true,
                  sort_order: 0,
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
      {methods.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun moyen de paiement configuré
        </div>
      )}
    </SettingsSection>
  );
}
