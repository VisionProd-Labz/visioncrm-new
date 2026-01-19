/**
 * Quote Request Step - Step 2 of Quote Creation Wizard
 * Collect quote details with react-hook-form + Zod validation
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { quoteRequestSchema, QuoteRequestFormData } from './quote-wizard-schema';

interface QuoteRequestStepProps {
  defaultValues: QuoteRequestFormData;
  onSubmit: (data: QuoteRequestFormData) => void;
  submitTrigger: number;
}

export function QuoteRequestStep({
  defaultValues,
  onSubmit,
  submitTrigger,
}: QuoteRequestStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuoteRequestFormData>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues,
    mode: 'onChange',
  });

  const promptValue = watch('prompt');
  const formRef = React.useRef<HTMLFormElement>(null);

  // Submit form when trigger changes (called from parent)
  React.useEffect(() => {
    if (submitTrigger > 0 && formRef.current) {
      formRef.current.requestSubmit();
    }
  }, [submitTrigger]);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Décrivez la demande du client. Notre IA analysera la demande pour préparer le devis.
      </p>

      {/* Prompt / Description */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-primary" />
          Description de la demande <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="prompt"
          {...register('prompt')}
          placeholder="Ex: Le client souhaite une révision complète de sa Peugeot 308, changement des plaquettes de frein, vidange, et vérification des pneus..."
          rows={6}
          className={`resize-none ${errors.prompt ? 'border-destructive' : ''}`}
        />
        {errors.prompt && (
          <p className="text-sm text-destructive mt-1">{errors.prompt.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {promptValue?.length || 0} / 20 caractères minimum
        </p>
      </div>

      {/* Urgency */}
      <div className="space-y-2">
        <Label htmlFor="urgency">Urgence</Label>
        <select
          id="urgency"
          {...register('urgency')}
          className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm ${
            errors.urgency ? 'border-destructive' : 'border-input'
          }`}
        >
          <option value="normal">Normale</option>
          <option value="urgent">Urgente (24-48h)</option>
          <option value="very_urgent">Très urgente (Immédiat)</option>
        </select>
        {errors.urgency && (
          <p className="text-sm text-destructive mt-1">{errors.urgency.message}</p>
        )}
      </div>

      {/* Estimated Budget */}
      <div className="space-y-2">
        <Label htmlFor="estimatedBudget">Budget estimé (optionnel)</Label>
        <Input
          id="estimatedBudget"
          type="number"
          {...register('estimatedBudget')}
          placeholder="1500"
          step="0.01"
        />
        {errors.estimatedBudget && (
          <p className="text-sm text-destructive mt-1">{errors.estimatedBudget.message}</p>
        )}
      </div>
    </form>
  );
}
