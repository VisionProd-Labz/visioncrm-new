'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { bankAccountSchema } from '@/lib/accounting/validations';

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface BankAccountFormProps {
  initialData?: Partial<BankAccountFormData & { id: string }>;
  isEditing?: boolean;
}

const accountTypes = [
  { value: 'CHECKING', label: 'Compte courant' },
  { value: 'SAVINGS', label: 'Compte épargne' },
  { value: 'BUSINESS', label: 'Compte professionnel' },
  { value: 'TERM_DEPOSIT', label: 'Compte à terme' },
  { value: 'SECURITIES', label: 'Compte titre' },
  { value: 'OTHER', label: 'Autre' },
];

const currencies = [
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'USD', label: 'Dollar américain ($)' },
  { value: 'GBP', label: 'Livre sterling (£)' },
  { value: 'CHF', label: 'Franc suisse (CHF)' },
];

export function BankAccountForm({ initialData, isEditing = false }: BankAccountFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      account_name: initialData?.account_name || '',
      account_number: initialData?.account_number || '',
      iban: initialData?.iban || '',
      bic: initialData?.bic || '',
      bank_name: initialData?.bank_name || '',
      account_type: initialData?.account_type || 'CHECKING',
      balance: initialData?.balance || 0,
      currency: initialData?.currency || 'EUR',
      is_active: initialData?.is_active ?? true,
    },
  });

  const isActive = watch('is_active');
  const accountType = watch('account_type');
  const currency = watch('currency');

  const onSubmit = async (data: BankAccountFormData) => {
    setIsLoading(true);
    try {
      const url = isEditing && initialData?.id
        ? `/api/accounting/bank-accounts/${initialData.id}`
        : '/api/accounting/bank-accounts';

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

      router.push('/accounting/bank-reconciliation');
      router.refresh();
    } catch (error) {
      console.error('Error saving bank account:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>
            Renseignez les détails de votre compte bancaire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="account_name">
              Nom du compte <span className="text-red-500">*</span>
            </Label>
            <Input
              id="account_name"
              placeholder="Ex: Compte courant professionnel"
              {...register('account_name')}
              className={errors.account_name ? 'border-red-500' : ''}
            />
            {errors.account_name && (
              <p className="text-sm text-red-500">{errors.account_name.message}</p>
            )}
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bank_name">
              Nom de la banque <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bank_name"
              placeholder="Ex: Banque Populaire"
              {...register('bank_name')}
              className={errors.bank_name ? 'border-red-500' : ''}
            />
            {errors.bank_name && (
              <p className="text-sm text-red-500">{errors.bank_name.message}</p>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="account_number">
              Numéro de compte <span className="text-red-500">*</span>
            </Label>
            <Input
              id="account_number"
              placeholder="Ex: 12345678901"
              {...register('account_number')}
              className={errors.account_number ? 'border-red-500' : ''}
            />
            {errors.account_number && (
              <p className="text-sm text-red-500">{errors.account_number.message}</p>
            )}
          </div>

          {/* IBAN & BIC */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                {...register('iban')}
                className={errors.iban ? 'border-red-500' : ''}
              />
              {errors.iban && (
                <p className="text-sm text-red-500">{errors.iban.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bic">BIC/SWIFT</Label>
              <Input
                id="bic"
                placeholder="Ex: BNPAFRPPXXX"
                {...register('bic')}
                className={errors.bic ? 'border-red-500' : ''}
              />
              {errors.bic && (
                <p className="text-sm text-red-500">{errors.bic.message}</p>
              )}
            </div>
          </div>

          {/* Account Type & Currency */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account_type">Type de compte</Label>
              <Select
                value={accountType}
                onValueChange={(value) => setValue('account_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Select
                value={currency}
                onValueChange={(value) => setValue('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une devise" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <Label htmlFor="balance">
              Solde initial
            </Label>
            <div className="relative">
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('balance', { valueAsNumber: true })}
                className={errors.balance ? 'border-red-500' : ''}
              />
              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                {currency}
              </span>
            </div>
            {errors.balance && (
              <p className="text-sm text-red-500">{errors.balance.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Le solde actuel du compte au moment de sa création
            </p>
          </div>

          {/* Is Active */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-base">
                Compte actif
              </Label>
              <p className="text-sm text-muted-foreground">
                Désactivez si le compte n'est plus utilisé
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
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
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Mettre à jour' : 'Créer le compte'}
        </Button>
      </div>
    </form>
  );
}
