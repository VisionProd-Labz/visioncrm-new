'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AnimatedParticles } from '@/components/ui/animated-particles';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/language-selector';
import { useLanguage } from '@/contexts/language-context';
import {
  Users,
  Car,
  FileText,
  CheckCircle2,
  Sparkles,
  Shield,
  ArrowRight,
  TrendingUp,
  Euro,
  Star,
  Bot,
  Gauge,
  Calendar,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  // Redirect to dashboard if user is authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">VisionCRM</span>
            </Link>
            <nav className="flex items-center gap-3">
              <LanguageSelector />
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  {t('landing.header.login')}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-400 text-white border-0">
                  {t('landing.header.start')}
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative pt-16">
        {/* Hero Section avec particules */}
        <section className="relative py-32 overflow-hidden">
          <AnimatedParticles />

          {/* Gradient orbs - adaptatifs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 dark:bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-sm font-medium text-primary shadow-lg">
                <Sparkles className="w-4 h-4" />
                {t('landing.hero.badge')}
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-6">
                {t('landing.hero.title1')}
                <span className="block bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {t('landing.hero.title2')}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {t('landing.hero.subtitle')}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex justify-center gap-4 mb-20">
              <Link href="/register">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-400 text-white border-0 text-lg px-8 h-14 shadow-lg shadow-primary/50">
                  {t('landing.hero.cta_trial')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="bg-muted hover:bg-muted/80 border-border text-lg px-8 h-14">
                  {t('landing.hero.cta_demo')}
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-card border border-border rounded-xl p-6 hover:bg-muted/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Euro className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">+15.7%</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{t('landing.stats.revenue')}</p>
                <p className="text-3xl font-bold text-foreground">45 678 €</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 hover:bg-muted/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">+12.3%</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{t('landing.stats.active_clients')}</p>
                <p className="text-3xl font-bold text-foreground">145</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 hover:bg-muted/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                    <Car className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">+8.9%</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{t('landing.stats.vehicles')}</p>
                <p className="text-3xl font-bold text-foreground">287</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-foreground mb-4">
                {t('landing.features.title')}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t('landing.features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  titleKey: 'landing.features.clients.title',
                  descKey: 'landing.features.clients.desc',
                  color: 'text-blue-600 dark:text-blue-400',
                  bg: 'bg-blue-500/10 dark:bg-blue-500/20',
                },
                {
                  icon: Car,
                  titleKey: 'landing.features.fleet.title',
                  descKey: 'landing.features.fleet.desc',
                  color: 'text-emerald-600 dark:text-emerald-400',
                  bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
                },
                {
                  icon: FileText,
                  titleKey: 'landing.features.quotes.title',
                  descKey: 'landing.features.quotes.desc',
                  color: 'text-purple-600 dark:text-purple-400',
                  bg: 'bg-purple-500/10 dark:bg-purple-500/20',
                },
                {
                  icon: Calendar,
                  titleKey: 'landing.features.tasks.title',
                  descKey: 'landing.features.tasks.desc',
                  color: 'text-pink-600 dark:text-pink-400',
                  bg: 'bg-pink-500/10 dark:bg-pink-500/20',
                },
                {
                  icon: Bot,
                  titleKey: 'landing.features.ai.title',
                  descKey: 'landing.features.ai.desc',
                  color: 'text-orange-600 dark:text-orange-400',
                  bg: 'bg-orange-500/10 dark:bg-orange-500/20',
                },
                {
                  icon: TrendingUp,
                  titleKey: 'landing.features.analytics.title',
                  descKey: 'landing.features.analytics.desc',
                  color: 'text-cyan-600 dark:text-cyan-400',
                  bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl p-6 hover:bg-muted/50 hover:border-border transition-all group"
                >
                  <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative py-24 border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-foreground mb-4">
                {t('landing.pricing.title')}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t('landing.pricing.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  nameKey: 'landing.pricing.starter',
                  price: '0 €',
                  periodKey: 'landing.pricing.month',
                  featuresKeys: ['landing.pricing.starter_feat1', 'landing.pricing.starter_feat2', 'landing.pricing.starter_feat3'],
                },
                {
                  nameKey: 'landing.pricing.pro',
                  price: '79 €',
                  periodKey: 'landing.pricing.month',
                  popular: true,
                  featuresKeys: ['landing.pricing.pro_feat1', 'landing.pricing.pro_feat2', 'landing.pricing.pro_feat3', 'landing.pricing.pro_feat4'],
                },
                {
                  nameKey: 'landing.pricing.enterprise',
                  priceKey: 'landing.pricing.custom',
                  period: '',
                  featuresKeys: ['landing.pricing.enterprise_feat1', 'landing.pricing.enterprise_feat2', 'landing.pricing.enterprise_feat3', 'landing.pricing.enterprise_feat4'],
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`bg-card border rounded-xl p-8 relative hover:bg-muted/50 transition-all ${
                    plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-blue-500 text-white text-sm font-semibold shadow-lg">
                        <Star className="w-4 h-4" />
                        {t('landing.pricing.popular')}
                      </div>
                    </div>
                  )}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold text-foreground mb-4">{t(plan.nameKey)}</h3>
                    <div className="text-5xl font-bold text-foreground mb-1">{plan.priceKey ? t(plan.priceKey) : plan.price}</div>
                    {plan.periodKey && <div className="text-sm text-muted-foreground">{t(plan.periodKey)}</div>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.featuresKeys.map((featureKey, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-foreground">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        {t(featureKey)}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button
                      variant={plan.popular ? 'default' : 'outline'}
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-400 text-white border-0' : ''}`}
                    >
                      {t('landing.pricing.choose')}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 border-t border-border">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 border border-border rounded-2xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5" />
              <div className="relative z-10">
                <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-5xl font-bold text-foreground mb-4">
                  {t('landing.cta.title')}
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  {t('landing.cta.subtitle')}
                </p>
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-400 text-white border-0 text-lg px-8 h-14 shadow-lg shadow-primary/50">
                    {t('landing.cta.button')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">&copy; 2026 VisionCRM</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('landing.footer.hosted')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
