'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload } from 'lucide-react';
import { expenseSchema } from '@/lib/accounting/validations';

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData & { id: string; expense_number: string }>;
  isEditing?: boolean;
}

const expenseCategories = [
  { value: 'RENT', label: 'Loyer' },
  { value: 'UTILITIES', label: 'Charges (eau, électricité, gaz)' },
  { value: 'INSURANCE', label: 'Assurance' },
  { value: 'OFFICE_SUPPLIES', label: 'Fournitures de bureau' },
  { value: 'MAINTENANCE', label: 'Entretien et réparations' },
  { value: 'FUEL', label: 'Carburant' },
  { value: 'VEHICLE', label: 'Véhicule' },
  { value: 'MARKETING', label: 'Marketing et publicité' },
  { value: 'SALARIES', label: 'Salaires' },
  { value: 'TAXES', label: 'Impôts et taxes' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'TRAVEL', label: 'Déplacements' },
  { value: 'EQUIPMENT', label: 'Équipement' },
  { value: 'SOFTWARE', label: 'Logiciels et abonnements' },
  { value: 'PROFESSIONAL_FEES', label: 'Honoraires professionnels' },
  { value: 'BANK_FEES', label: 'Frais bancaires' },
  { value: 'INVENTORY', label: 'Stock et marchandises' },
  { value: 'OTHER', label: 'Autre' },
];

const paymentMethods = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'CARD', label: 'Carte bancaire' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
  { value: 'CHECK', label: 'Chèque' },
];

const vatRates = [
  { value: 0, label: '0% (exonéré)' },
  { value: 5.5, label: '5,5% (taux réduit)' },
  { value: 10, label: '10% (taux intermédiaire)' },
  { value: 20, label: '20% (taux normal)' },
];

export function ExpenseForm({ initialData, isEditing = false }: ExpenseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedAmounts, setCalculatedAmounts] = useState({
    vat_amount: 0,
    amount_ttc: 0,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      vendor_id: initialData?.vendor_id || undefined,
      vendor_name: initialData?.vendor_name || '',
      category: initialData?.category || 'OTHER',
      description: initialData?.description || '',
      amount_ht: initialData?.amount_ht || 0,
      vat_rate: initialData?.vat_rate || 20.0,
      payment_method: initialData?.payment_method || undefined,
      notes: initialData?.notes || '',
      receipt_url: initialData?.receipt_url || '',
    },
  });

  const amountHt = watch('amount_ht');
  const vatRate = watch('vat_rate');
  const category = watch('category');
  const paymentMethod = watch('payment_method');

  // Calculate VAT and total automatically
  useEffect(() => {
    const ht = Number(amountHt) || 0;
    const rate = Number(vatRate) || 0;
    const vatAmount = (ht * rate) / 100;
    const ttc = ht + vatAmount;

    setCalculatedAmounts({
      vat_amount: vatAmount,
      amount_ttc: ttc,
    });
  }, [amountHt, vatRate]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const url = isEditing && initialData?.id
        ? `/api/accounting/expenses/${initialData.id}`
        : '/api/accounting/expenses';

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

      router.push('/accounting/expenses');
      router.refresh();
    } catch (error) {
      console.error('Error saving expense:', error);
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
          <CardDescription>
            {isEditing && initialData?.expense_number && (
              <span className="font-mono text-sm">
                Référence: {initialData.expense_number}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Vendor Name */}
          <div className="space-y-2">
            <Label htmlFor="vendor_name">
              Nom du fournisseur <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vendor_name"
              placeholder="Ex: EDF, Total, Fournisseur Auto..."
              {...register('vendor_name')}
              className={errors.vendor_name ? 'border-red-500' : ''}
            />
            {errors.vendor_name && (
              <p className="text-sm text-red-500">{errors.vendor_name.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Vous pouvez également lier un fournisseur existant dans vos contacts
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Catégorie <span className="text-red-500">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(value) => setValue('category', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Décrivez la nature de la dépense..."
              rows={3}
              {...register('description')}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle>Montants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Amount HT */}
            <div className="space-y-2">
              <Label htmlFor="amount_ht">
                Montant HT <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="amount_ht"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('amount_ht', { valueAsNumber: true })}
                  className={errors.amount_ht ? 'border-red-500' : ''}
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                  €
                </span>
              </div>
              {errors.amount_ht && (
                <p className="text-sm text-red-500">{errors.amount_ht.message}</p>
              )}
            </div>

            {/* VAT Rate */}
            <div className="space-y-2">
              <Label htmlFor="vat_rate">Taux de TVA</Label>
              <Select
                value={String(vatRate)}
                onValueChange={(value) => setValue('vat_rate', parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un taux" />
                </SelectTrigger>
                <SelectContent>
                  {vatRates.map((rate) => (
                    <SelectItem key={rate.value} value={String(rate.value)}>
                      {rate.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculated Amounts */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montant HT:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(Number(amountHt) || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                TVA ({vatRate}%):
              </span>
              <span className="font-medium">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(calculatedAmounts.vat_amount)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total TTC:</span>
              <span>
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(calculatedAmounts.amount_ttc)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment_method">Moyen de paiement</Label>
            <Select
              value={paymentMethod || ''}
              onValueChange={(value) => setValue('payment_method', value as any || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un moyen de paiement" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations complémentaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Informations complémentaires..."
              rows={2}
              {...register('notes')}
            />
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label htmlFor="receipt_url">Justificatif</Label>
            <div className="flex gap-2">
              <Input
                id="receipt_url"
                placeholder="URL du justificatif"
                {...register('receipt_url')}
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Téléchargez ou collez l'URL de votre facture ou reçu
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="secondary"
          disabled={isLoading}
          onClick={() => (setValue as any)('status', 'DRAFT')}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer comme brouillon
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Mettre à jour' : 'Soumettre la dépense'}
        </Button>
      </div>
    </form>
  );
}
