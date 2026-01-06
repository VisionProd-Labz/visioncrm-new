'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import { SocialLogin } from '@/components/auth/social-login';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    tenantName: '',
    subdomain: '',
  });

  const handleSubdomainChange = (value: string) => {
    // Auto-generate subdomain from tenant name
    const subdomain = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    setFormData({ ...formData, subdomain });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue');
        setIsLoading(false);
        return;
      }

      // Redirect to login
      router.push('/login?registered=true');
    } catch (error) {
      setError(t('register.error.generic'));
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{t('register.title')}</CardTitle>
        <CardDescription>
          {t('register.description')}
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
            <Label htmlFor="name">{t('register.name')}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t('register.name_placeholder')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('register.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('register.email_placeholder')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('register.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('register.password_placeholder')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
              minLength={12}
            />
            <p className="text-xs text-muted-foreground">
              {t('register.password_hint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantName">{t('register.tenant_name')}</Label>
            <Input
              id="tenantName"
              type="text"
              placeholder={t('register.tenant_name_placeholder')}
              value={formData.tenantName}
              onChange={(e) => {
                setFormData({ ...formData, tenantName: e.target.value });
                if (!formData.subdomain) {
                  handleSubdomainChange(e.target.value);
                }
              }}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">{t('register.subdomain')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain"
                type="text"
                placeholder={t('register.subdomain_placeholder')}
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                required
                disabled={isLoading}
                pattern="[a-z0-9-]+"
                minLength={3}
                maxLength={63}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                .visioncrm.app
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('register.subdomain_hint').replace('{subdomain}', formData.subdomain || t('register.subdomain_default'))}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t('register.submitting') : t('register.submit')}
          </Button>
        </form>

        {/* Social Login */}
        <div className="mt-6">
          <SocialLogin />
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            {t('register.already_have_account')}{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t('register.sign_in')}
            </Link>
          </p>
        </div>

        <div className="mt-4 pt-4 border-t text-xs text-center text-muted-foreground">
          {t('register.terms_text')}{' '}
          <Link href="/legal/terms" className="underline">
            {t('register.terms_link')}
          </Link>{' '}
          {t('register.and')}{' '}
          <Link href="/legal/privacy" className="underline">
            {t('register.privacy_link')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
