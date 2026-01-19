/**
 * Registration Page - Refactored with react-hook-form + Zod
 * Simplified UX: firstName, lastName, email, password, companyName
 * Subdomain auto-generated from companyName (hidden from user)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import { SocialLogin } from '@/components/auth/social-login';
import { registerSchema, RegisterFormData } from '@/lib/schemas/auth';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange', // Validate on change for instant feedback
  });

  /**
   * Generate subdomain from company name
   * Example: "Garage Dupont & Fils" → "garage-dupont-fils"
   */
  const generateSubdomain = (companyName: string): string => {
    return companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Keep only alphanumeric, spaces, hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 63); // Max 63 chars for subdomain
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // Transform client-side data to match backend API schema
      const payload = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
        tenantName: data.companyName,
        subdomain: generateSubdomain(data.companyName),
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (result.details && Array.isArray(result.details)) {
          result.details.forEach((detail: { field: string; message: string }) => {
            toast.error(`${detail.field}: ${detail.message}`);
          });
        } else {
          toast.error(result.error || 'Une erreur est survenue lors de l\'inscription');
        }
        setIsLoading(false);
        return;
      }

      // Success - show email verification message
      setUserEmail(data.email);
      setSuccess(true);
      toast.success('Compte créé avec succès ! Vérifiez votre email.');
      reset();
    } catch (error) {
      console.error('[REGISTER] Error:', error);
      toast.error('Erreur réseau. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state - Email verification message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Compte créé !</CardTitle>
            <CardDescription className="text-center">
              Vérifiez votre boîte mail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong>Un email de vérification a été envoyé à :</strong>
              </p>
              <p className="text-sm font-mono text-blue-700 dark:text-blue-400 mb-3 break-all">
                {userEmail}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Cliquez sur le lien dans l'email pour activer votre compte.
                Le lien expire dans 24 heures.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <strong>Pas reçu d'email ?</strong> Vérifiez vos spams ou contactez le support.
              </p>
            </div>

            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('register.title')}</CardTitle>
          <CardDescription>
            Gérez votre garage en toute simplicité. Devis, factures, planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  placeholder="Jean"
                  disabled={isLoading}
                  {...register('firstName')}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  placeholder="Dupont"
                  disabled={isLoading}
                  {...register('lastName')}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email professionnel *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@garage-dupont.fr"
                disabled={isLoading}
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom du garage *</Label>
              <Input
                id="companyName"
                placeholder="Garage Dupont & Fils"
                disabled={isLoading}
                {...register('companyName')}
                className={errors.companyName ? 'border-destructive' : ''}
              />
              {errors.companyName && (
                <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Votre URL sera générée automatiquement (ex: garage-dupont.visioncrm.app)
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                disabled={isLoading}
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Min 12 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Ou continuer avec
                </span>
              </div>
            </div>
            <div className="mt-4">
              <SocialLogin />
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Vous avez déjà un compte ?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Terms & Privacy */}
          <div className="mt-4 pt-4 border-t text-xs text-center text-muted-foreground">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/legal/terms" className="underline hover:text-primary">
              Conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/legal/privacy" className="underline hover:text-primary">
              Politique de confidentialité
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
