'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import { SocialLogin } from '@/components/auth/social-login';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Check for tenant/subdomain errors in URL
  useEffect(() => {
    const errorParam = searchParams.get('error');

    if (errorParam === 'invalid_subdomain') {
      setError('Ce sous-domaine n\'existe pas. Veuillez vérifier l\'URL ou contactez votre administrateur.');
    } else if (errorParam === 'wrong_tenant') {
      setError('Vous n\'avez pas accès à ce tenant. Veuillez vous connecter avec le bon compte.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('login.error.invalid'));
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError(t('login.error.generic'));
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{t('login.title')}</CardTitle>
        <CardDescription>
          {t('login.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('login.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('login.email_placeholder')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder={t('login.password_placeholder')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>

        {/* Social Login */}
        <div className="mt-6">
          <SocialLogin />
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            {t('login.no_account')}{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              {t('login.create_account')}
            </Link>
          </p>
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-center text-muted-foreground">
            <strong>{t('login.demo_account')}</strong> demo@visioncrm.app / demo123456!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
      </Card>
    }>
      <LoginForm />
    </Suspense>
  );
}
