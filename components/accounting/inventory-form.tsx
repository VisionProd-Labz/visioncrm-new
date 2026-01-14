'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { inventoryItemSchema, type InventoryItemFormData } from '@/lib/accounting/validations';

interface InventoryFormProps {
  initialData?: Partial<InventoryItemFormData> & { id?: string };
  isEditing?: boolean;
}

export function InventoryForm({ initialData, isEditing = false }: InventoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    total_value: 0,
    depreciated_value: null as number | null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(inventoryItemSchema) as any,
    defaultValues: {
      sku: initialData?.sku || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      quantity: initialData?.quantity || 0,
      unit_cost: initialData?.unit_cost || 0,
      reorder_point: initialData?.reorder_point || 0,
      location: initialData?.location || '',
      depreciation_rate: initialData?.depreciation_rate || null,
      notes: initialData?.notes || '',
    },
  });

  // Watch fields for automatic calculation
  const quantity = watch('quantity');
  const unitCost = watch('unit_cost');
  const depreciationRate = watch('depreciation_rate');

  // Calculate total value and depreciated value
  useEffect(() => {
    const qty = Number(quantity) || 0;
    const cost = Number(unitCost) || 0;
    const totalValue = qty * cost;

    let depreciatedValue: number | null = null;
    if (depreciationRate && Number(depreciationRate) > 0) {
      const rate = Number(depreciationRate);
      depreciatedValue = totalValue * (1 - rate / 100);
    }

    setCalculatedValues({
      total_value: totalValue,
      depreciated_value: depreciatedValue,
    });
  }, [quantity, unitCost, depreciationRate]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const url = isEditing && initialData?.id
        ? `/api/accounting/inventory/${initialData.id}`
        : '/api/accounting/inventory';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Une erreur est survenue');
      }

      router.push('/accounting/inventory');
      router.refresh();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                {...register('sku')}
                placeholder="Ex: PROD-2025-001"
              />
              {errors.sku && (
                <p className="text-sm text-red-500">{errors.sku.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: Peinture blanche 10L"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Description de l'article"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Ex: MARCHANDISES, VEHICULES"
              />
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Exemples: MARCHANDISES, VEHICULES, EQUIPEMENT, FOURNITURES
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Emplacement</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Ex: Entrepôt A - Rayon 3"
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité *</Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                {...register('quantity', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_point">Seuil de réapprovisionnement</Label>
              <Input
                id="reorder_point"
                type="number"
                step="1"
                {...register('reorder_point', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.reorder_point && (
                <p className="text-sm text-red-500">{errors.reorder_point.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Alerte quand la quantité descend à ce niveau
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations financières</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit_cost">Coût unitaire (€) *</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                {...register('unit_cost', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.unit_cost && (
                <p className="text-sm text-red-500">{errors.unit_cost.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="depreciation_rate">Taux d'amortissement (%)</Label>
              <Input
                id="depreciation_rate"
                type="number"
                step="0.1"
                {...register('depreciation_rate', {
                  setValueAs: (v) => v === '' || v === null ? null : Number(v)
                })}
                placeholder="0.0"
              />
              {errors.depreciation_rate && (
                <p className="text-sm text-red-500">{errors.depreciation_rate.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Pour les véhicules et équipements (optionnel)
              </p>
            </div>
          </div>

          {/* Calculated Values Display */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm mb-3">Valeurs calculées</h4>
            <div className="flex justify-between">
              <span className="text-sm">Quantité:</span>
              <span className="font-medium">{quantity || 0} unités</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Coût unitaire:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(Number(unitCost) || 0)}
              </span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between text-base font-bold">
              <span>Valeur totale:</span>
              <span>
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(calculatedValues.total_value)}
              </span>
            </div>
            {calculatedValues.depreciated_value !== null && (
              <>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between text-sm">
                  <span>Valeur après amortissement ({depreciationRate}%):</span>
                  <span className="font-semibold text-orange-600">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(calculatedValues.depreciated_value)}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes additionnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Notes internes, informations complémentaires..."
            rows={4}
          />
          {errors.notes && (
            <p className="text-sm text-red-500 mt-2">{errors.notes.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Mettre à jour' : 'Créer l\'article'}
        </Button>
      </div>
    </form>
  );
}
