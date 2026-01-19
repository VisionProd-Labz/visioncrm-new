/**
 * Contact Form Component
 * Form with react-hook-form + Zod validation
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, Building2, MapPin, Star, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { contactSchema, ContactFormData } from './contact-schema';
import { useState, useEffect, useRef } from 'react';

interface ContactFormProps {
  defaultValues: ContactFormData;
  mode: 'create' | 'edit';
  onSubmit: (data: ContactFormData) => Promise<void>;
  submitTrigger: number;
}

export function ContactForm({ defaultValues, mode, onSubmit, submitTrigger }: ContactFormProps) {
  const [contactType, setContactType] = useState<'individual' | 'company'>(
    defaultValues.company ? 'company' : 'individual'
  );
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues,
  });

  const is_vip = watch('is_vip');

  // Submit form when trigger changes
  useEffect(() => {
    if (submitTrigger > 0 && formRef.current) {
      formRef.current.requestSubmit();
    }
  }, [submitTrigger]);

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      {/* Contact Type Selector (Create mode only) */}
      {mode === 'create' && (
        <div>
          <Label className="text-sm font-semibold text-foreground mb-3 block">
            Type de contact
          </Label>
          <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
            <button
              type="button"
              onClick={() => setContactType('individual')}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all',
                contactType === 'individual'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <User className="h-4 w-4 inline-block mr-2" />
              Particulier
            </button>
            <button
              type="button"
              onClick={() => setContactType('company')}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all',
                contactType === 'company'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Building2 className="h-4 w-4 inline-block mr-2" />
              Entreprise
            </button>
          </div>
        </div>
      )}

      {/* Company Name */}
      {contactType === 'company' && (
        <div>
          <Label htmlFor="company" className="text-sm font-semibold text-foreground mb-2 block">
            Nom de l'entreprise *
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="company"
              {...register('company')}
              placeholder="ACME Corporation"
              className="pl-10 h-11"
            />
          </div>
          {errors.company && (
            <p className="text-sm text-red-500 mt-1">{errors.company.message}</p>
          )}
        </div>
      )}

      {/* Personal Information */}
      <div>
        <Label className="text-sm font-semibold text-foreground mb-3 block">
          Informations personnelles
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name" className="text-xs text-muted-foreground mb-1.5 block">
              Prénom *
            </Label>
            <Input
              id="first_name"
              {...register('first_name')}
              placeholder="Jean"
              className="h-11"
            />
            {errors.first_name && (
              <p className="text-sm text-red-500 mt-1">{errors.first_name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="last_name" className="text-xs text-muted-foreground mb-1.5 block">
              Nom *
            </Label>
            <Input
              id="last_name"
              {...register('last_name')}
              placeholder="Dupont"
              className="h-11"
            />
            {errors.last_name && (
              <p className="text-sm text-red-500 mt-1">{errors.last_name.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <Label className="text-sm font-semibold text-foreground mb-3 block">
          Coordonnées
        </Label>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-xs text-muted-foreground mb-1.5 block">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="jean.dupont@example.com"
                className="pl-10 h-11"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone" className="text-xs text-muted-foreground mb-1.5 block">
              Téléphone
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+33 6 12 34 56 78"
                className="pl-10 h-11"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <Label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Adresse
        </Label>
        <div className="space-y-4">
          <div>
            <Label htmlFor="street" className="text-xs text-muted-foreground mb-1.5 block">
              Rue
            </Label>
            <Input
              id="street"
              {...register('address.street')}
              placeholder="123 Rue de la Paix"
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="postalCode" className="text-xs text-muted-foreground mb-1.5 block">
                Code postal
              </Label>
              <Input
                id="postalCode"
                {...register('address.postalCode')}
                placeholder="75001"
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-xs text-muted-foreground mb-1.5 block">
                Ville
              </Label>
              <Input
                id="city"
                {...register('address.city')}
                placeholder="Paris"
                className="h-11"
              />
            </div>
            <div>
              <Label htmlFor="country" className="text-xs text-muted-foreground mb-1.5 block">
                Pays
              </Label>
              <Input
                id="country"
                {...register('address.country')}
                placeholder="France"
                className="h-11"
              />
            </div>
          </div>
        </div>
      </div>

      {/* VIP Toggle */}
      <div className="p-4 border border-border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <Label htmlFor="is_vip" className="text-base font-semibold text-foreground cursor-pointer">
                Contact VIP
              </Label>
              <p className="text-xs text-muted-foreground">
                Marquer ce contact comme prioritaire
              </p>
            </div>
          </div>
          <Switch
            id="is_vip"
            checked={is_vip}
            onCheckedChange={(checked) => setValue('is_vip', checked)}
          />
        </div>
      </div>
    </form>
  );
}
