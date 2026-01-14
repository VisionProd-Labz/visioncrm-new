'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload } from 'lucide-react';
import { z } from 'zod';

// Form schema for document upload
const documentUploadSchema = z.object({
  category: z.enum(['TAX', 'PAYROLL', 'LEGAL']),
  type: z.string().min(1, 'Le type est requis'),
  year: z.number().int().min(2000).max(2100),
  period: z.string().optional(),
  file_url: z.string().url('URL invalide').max(500),
  file_name: z.string().min(1, 'Le nom du fichier est requis').max(255),
  file_size: z.number().int().positive().optional(),
  notes: z.string().optional(),
  // For legal documents
  document_date: z.string().optional(),
});

type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

const taxTypes = [
  { value: 'TVA_RETURN', label: 'Déclaration TVA' },
  { value: 'CORPORATE_TAX', label: 'Impôt sur les sociétés' },
  { value: 'INCOME_TAX', label: 'Impôt sur le revenu' },
  { value: 'PAYROLL_TAX', label: 'Taxe sur les salaires' },
  { value: 'PROPERTY_TAX', label: 'Taxe foncière' },
  { value: 'FEC', label: 'Fichier des écritures comptables (FEC)' },
  { value: 'LIASSE_FISCALE', label: 'Liasse fiscale' },
  { value: 'OTHER', label: 'Autre' },
];

const payrollTypes = [
  { value: 'URSSAF', label: 'URSSAF' },
  { value: 'PENSION_FUND', label: 'Caisse de retraite' },
  { value: 'HEALTH_INSURANCE', label: 'Mutuelle' },
  { value: 'PAYSLIPS', label: 'Bulletins de paie' },
  { value: 'DSN', label: 'DSN (Déclaration Sociale Nominative)' },
  { value: 'SOCIAL_BALANCE', label: 'Bilan social' },
  { value: 'OTHER', label: 'Autre' },
];

const legalTypes = [
  { value: 'AGO_PV', label: 'PV d\'Assemblée Générale Ordinaire' },
  { value: 'AGE_PV', label: 'PV d\'Assemblée Générale Extraordinaire' },
  { value: 'STATUTES', label: 'Statuts' },
  { value: 'KBIS', label: 'Extrait Kbis' },
  { value: 'RCM_DECLARATION', label: 'Déclaration RCM' },
  { value: 'BOARD_DECISION', label: 'Décision du conseil d\'administration' },
  { value: 'OTHER', label: 'Autre' },
];

export function DocumentUploadForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'TAX' | 'PAYROLL' | 'LEGAL'>('TAX');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(documentUploadSchema) as any,
    defaultValues: {
      category: 'TAX',
      year: new Date().getFullYear(),
      period: '',
      file_url: '',
      file_name: '',
      notes: '',
    },
  });

  const category = watch('category');

  const getTypeOptions = () => {
    switch (category) {
      case 'TAX':
        return taxTypes;
      case 'PAYROLL':
        return payrollTypes;
      case 'LEGAL':
        return legalTypes;
      default:
        return [];
    }
  };

  const getApiEndpoint = () => {
    switch (category) {
      case 'TAX':
        return '/api/accounting/documents/tax';
      case 'PAYROLL':
        return '/api/accounting/documents/payroll';
      case 'LEGAL':
        return '/api/accounting/documents/legal';
      default:
        return '';
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const endpoint = getApiEndpoint();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Une erreur est survenue');
      }

      router.push('/accounting/documents');
      router.refresh();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Document Category */}
      <Card>
        <CardHeader>
          <CardTitle>Catégorie du document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select
              value={category}
              onValueChange={(value) => {
                setValue('category', value as 'TAX' | 'PAYROLL' | 'LEGAL');
                setSelectedCategory(value as 'TAX' | 'PAYROLL' | 'LEGAL');
                (setValue as any)('type', ''); // Reset type when category changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TAX">📊 Fiscal</SelectItem>
                <SelectItem value="PAYROLL">👥 Social (Paie)</SelectItem>
                <SelectItem value="LEGAL">⚖️ Juridique</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type de document *</Label>
            <Select
              onValueChange={(value) => (setValue as any)('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                {getTypeOptions().map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(errors as any).type && (
              <p className="text-sm text-red-500">{(errors as any).type.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Details */}
      <Card>
        <CardHeader>
          <CardTitle>Détails du document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="year">Année *</Label>
              <Input
                id="year"
                type="number"
                {...register('year', { valueAsNumber: true })}
                placeholder="2025"
              />
              {errors.year && (
                <p className="text-sm text-red-500">{errors.year.message}</p>
              )}
            </div>

            {category !== 'LEGAL' && (
              <div className="space-y-2">
                <Label htmlFor="period">Période</Label>
                <Input
                  id="period"
                  {...register('period')}
                  placeholder="Ex: Q1, JANVIER, ANNUEL"
                />
                {errors.period && (
                  <p className="text-sm text-red-500">{errors.period.message}</p>
                )}
              </div>
            )}

            {category === 'LEGAL' && (
              <div className="space-y-2">
                <Label htmlFor="document_date">Date du document</Label>
                <Input
                  id="document_date"
                  type="date"
                  {...(register as any)('document_date')}
                />
                {(errors as any).document_date && (
                  <p className="text-sm text-red-500">{(errors as any).document_date.message}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Fichier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file_name">Nom du fichier *</Label>
            <Input
              id="file_name"
              {...register('file_name')}
              placeholder="Ex: TVA_Q4_2025.pdf"
            />
            {errors.file_name && (
              <p className="text-sm text-red-500">{errors.file_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_url">URL du fichier *</Label>
            <Input
              id="file_url"
              type="url"
              {...register('file_url')}
              placeholder="https://..."
            />
            {errors.file_url && (
              <p className="text-sm text-red-500">{errors.file_url.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Pour l'instant, veuillez héberger le fichier ailleurs et fournir l'URL.
              L'upload direct sera disponible prochainement.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_size">Taille du fichier (octets)</Label>
            <Input
              id="file_size"
              type="number"
              {...(register as any)('file_size', { valueAsNumber: true })}
              placeholder="Ex: 1234567"
            />
            {(errors as any).file_size && (
              <p className="text-sm text-red-500">{(errors as any).file_size.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              {...register('notes')}
              placeholder="Notes optionnelles"
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>
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
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Ajouter le document
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
