/**
 * Client Step - Step 1 of Quote Creation Wizard
 * Collect client information with react-hook-form + Zod validation
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Building2, MapPin } from 'lucide-react';
import { clientSchema, ClientFormData } from './quote-wizard-schema';

interface ClientStepProps {
  defaultValues: ClientFormData;
  onSubmit: (data: ClientFormData) => void;
  submitTrigger: number;
}

export function ClientStep({ defaultValues, onSubmit, submitTrigger }: ClientStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Submit form when trigger changes (called from parent)
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (submitTrigger > 0 && formRef.current) {
      formRef.current.requestSubmit();
    }
  }, [submitTrigger]);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Renseignez les informations du client pour commencer.
      </p>

      {/* First Name & Last Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="flex items-center gap-1">
            <User className="w-4 h-4" />
            Prénom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            {...register('firstName')}
            placeholder="Jean"
            className={errors.firstName ? 'border-destructive' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="flex items-center gap-1">
            <User className="w-4 h-4" />
            Nom <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            {...register('lastName')}
            placeholder="Dupont"
            className={errors.lastName ? 'border-destructive' : ''}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-1">
          <Mail className="w-4 h-4" />
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="jean.dupont@example.com"
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Un email d'activation sera envoyé à cette adresse
        </p>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-1">
          <Phone className="w-4 h-4" />
          Téléphone
        </Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label htmlFor="company" className="flex items-center gap-1">
          <Building2 className="w-4 h-4" />
          Entreprise
        </Label>
        <Input
          id="company"
          {...register('company')}
          placeholder="Nom de l'entreprise"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          Adresse
        </Label>
        <Input
          id="address"
          {...register('address')}
          placeholder="123 Rue de la Paix, 75000 Paris"
        />
      </div>
    </form>
  );
}
