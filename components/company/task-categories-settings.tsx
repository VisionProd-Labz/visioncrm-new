'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Phone, Mail, Bell, Eye, Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { SettingsSection } from '@/components/settings/settings-section';
import { useLanguage } from '@/contexts/language-context';

interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
}

const iconOptions = [
  { name: 'Phone', component: Phone },
  { name: 'Mail', component: Mail },
  { name: 'Bell', component: Bell },
  { name: 'Eye', component: Eye },
  { name: 'Calendar', component: Calendar },
  { name: 'CheckSquare', component: CheckSquare },
  { name: 'MessageSquare', component: MessageSquare },
];

const colorPresets = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

export function TaskCategoriesSettings() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: 'Phone',
    is_default: false,
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/settings/task-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching task categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/settings/task-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCategories();
        setShowAddForm(false);
        setFormData({
          name: '',
          color: '#3B82F6',
          icon: 'Phone',
          is_default: false,
          is_active: true,
          sort_order: 0,
        });
      }
    } catch (error) {
      console.error('Error creating task category:', error);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<TaskCategory>) => {
    try {
      const response = await fetch(`/api/settings/task-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error updating task category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('company.config.confirm_delete'))) return;

    try {
      const response = await fetch(`/api/settings/task-categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting task category:', error);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find((i) => i.name === iconName);
    return icon ? icon.component : Phone;
  };

  if (isLoading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <SettingsSection
      title={t('company.config.task_categories')}
      description="Personnalisez les catégories de tâches disponibles"
    >
      {/* List */}
      <div className="space-y-2">
        {categories.map((category) => {
          const IconComponent = getIconComponent(category.icon);
          return (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <IconComponent className="h-5 w-5" style={{ color: category.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{category.name}</span>
                    {category.is_default && (
                      <Badge variant="default" className="text-xs">
                        {t('company.config.default')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-xs">{category.color}</span>
                    </div>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Switch
                        checked={category.is_active}
                        onCheckedChange={(checked) =>
                          handleUpdate(category.id, { is_active: checked })
                        }
                      />
                      <span className="text-xs">
                        {category.is_active ? t('company.config.active') : 'Inactif'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUpdate(category.id, { is_default: !category.is_default })}
                  title={t('company.config.set_default')}
                >
                  <Check className={`h-4 w-4 ${category.is_default ? 'text-primary' : 'text-muted-foreground'}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 bg-muted/50 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Appel téléphonique"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex gap-2">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-md transition-all ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <Input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-8 p-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icône</Label>
            <div className="grid grid-cols-7 gap-2">
              {iconOptions.map(({ name, component: IconComponent }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: name })}
                  className={`w-10 h-10 rounded-md flex items-center justify-center transition-all ${
                    formData.icon === name
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/70'
                  }`}
                  title={name}
                >
                  <IconComponent className="h-5 w-5" />
                </button>
              ))}
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
                  color: '#3B82F6',
                  icon: 'Phone',
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
      {categories.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          Aucune catégorie de tâche configurée
        </div>
      )}
    </SettingsSection>
  );
}
