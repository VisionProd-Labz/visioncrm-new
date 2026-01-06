import Link from 'next/link';
import { Car, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';
import { AnimatedParticles } from '@/components/ui/animated-particles';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero avec particules animées (TOUJOURS BLEU) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#3b82f6] flex-col justify-between p-12 relative overflow-hidden">
        {/* Animated particles background */}
        <AnimatedParticles />

        {/* Gradient overlays */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">VisionCRM</span>
          </Link>
        </div>

        <div className="text-white relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium shadow-lg">
              <Sparkles className="w-4 h-4" />
              Intelligence Artificielle
            </div>
            <h2 className="text-6xl font-bold leading-tight">
              Gérez votre garage
              <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                en toute simplicité
              </span>
            </h2>
            <p className="text-xl text-blue-100 max-w-md leading-relaxed">
              La solution complète pour les garages automobiles : clients, véhicules, devis, factures et IA.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 max-w-md">
            {[
              { icon: CheckCircle2, text: 'Gestion client complète' },
              { icon: Car, text: 'Suivi intelligent des véhicules' },
              { icon: TrendingUp, text: 'Analytics en temps réel' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-base font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-blue-100 text-sm relative z-10">
          <p>&copy; 2026 VisionCRM. Tous droits réservés.</p>
        </div>
      </div>

      {/* Right side - Auth forms (S'ADAPTE AU THÈME) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">VisionCRM</span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
