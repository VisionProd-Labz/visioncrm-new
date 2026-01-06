/**
 * VisionCRM Design System - Krypton Theme
 *
 * Design tokens et configurations pour un design cohérent
 */

export const kryptonDesign = {
  // Couleurs principales
  colors: {
    // Couleurs d'accent
    primary: '#f68100',        // Orange principal
    primaryLight: '#ff9500',   // Orange clair
    primaryDark: '#d97706',    // Orange foncé

    secondary: '#0099ff',      // Bleu
    secondaryLight: '#0099ff', // Bleu clair
    secondaryDark: '#0077cc',  // Bleu foncé

    success: '#10b981',        // Vert
    successDark: '#059669',    // Vert foncé

    warning: '#f59e0b',        // Ambre
    error: '#ef4444',          // Rouge

    purple: '#8b5cf6',         // Violet
    purpleDark: '#7c3aed',     // Violet foncé

    // Backgrounds
    background: {
      primary: '#07010f',                    // Fond principal ultra-sombre
      secondary: '#0a0612',                  // Fond secondaire
      card: 'rgba(226,232,255,0.12)',       // Fond carte (glassmorphism)
      cardHover: 'rgba(226,232,255,0.18)',  // Fond carte hover
      input: 'rgba(255,255,255,0.05)',      // Fond input
    },

    // Textes
    text: {
      primary: '#ffffff',           // Blanc
      secondary: 'rgba(255,255,255,0.70)',   // Blanc 70%
      muted: 'rgba(255,255,255,0.60)',       // Blanc 60%
      disabled: 'rgba(255,255,255,0.40)',    // Blanc 40%
    },

    // Bordures
    border: {
      default: 'rgba(255,255,255,0.20)',     // Blanc 20%
      focus: 'rgba(246,129,0,0.50)',         // Orange 50%
      hover: 'rgba(255,255,255,0.30)',       // Blanc 30%
    }
  },

  // Gradients prédéfinis
  gradients: {
    orange: {
      from: '#ff9500',
      via: '#f68100',
      to: '#ff9500',
      class: 'from-[#ff9500] via-[#f68100] to-[#ff9500]',
    },
    blue: {
      from: '#0099ff',
      to: '#0077cc',
      class: 'from-[#0099ff] to-[#0077cc]',
    },
    green: {
      from: '#10b981',
      to: '#059669',
      class: 'from-[#10b981] to-[#059669]',
    },
    purple: {
      from: '#8b5cf6',
      to: '#7c3aed',
      class: 'from-[#8b5cf6] to-[#7c3aed]',
    },
    // Gradients de background
    warmGlow: {
      class: 'bg-gradient-to-br from-[#ff9500]/20 via-[#f68100]/10 to-transparent',
    },
    blueGlow: {
      class: 'bg-gradient-to-br from-[#0099ff]/20 via-[#0077cc]/10 to-transparent',
    },
  },

  // Effets visuels
  effects: {
    // Glassmorphism
    glassmorphism: {
      default: 'bg-[rgba(226,232,255,0.12)] backdrop-blur-md',
      hover: 'bg-[rgba(226,232,255,0.18)] backdrop-blur-md',
      strong: 'bg-[rgba(226,232,255,0.15)] backdrop-blur-xl',
    },

    // Shadows
    shadow: {
      card: 'shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_1px_8px_rgba(118,71,255,0.04)]',
      cardHover: 'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
      button: 'shadow-lg',
    },

    // Glows
    glow: {
      orange: 'shadow-[0_0_20px_rgba(246,129,0,0.4)]',
      orangeStrong: 'shadow-[0_0_30px_rgba(246,129,0,0.6)]',
      blue: 'shadow-[0_0_20px_rgba(0,153,255,0.4)]',
      green: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
      purple: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]',
    },

    // Borders
    border: {
      default: 'border border-white/20',
      focus: 'border-[#f68100]/50',
      glow: 'border border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.16)]',
    },
  },

  // Espacement
  spacing: {
    cardPadding: {
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
      xl: 'p-8',
    },
    sectionGap: {
      sm: 'gap-3',
      md: 'gap-5',
      lg: 'gap-8',
    },
    pageMargin: {
      default: 'space-y-8',
      compact: 'space-y-5',
    },
  },

  // Typographie
  typography: {
    heading: {
      h1: 'text-4xl md:text-5xl font-bold text-white tracking-tight',
      h2: 'text-3xl md:text-4xl font-bold text-white tracking-tight',
      h3: 'text-2xl md:text-3xl font-bold text-white',
      h4: 'text-xl font-bold text-white',
      h5: 'text-lg font-semibold text-white',
    },
    body: {
      large: 'text-lg text-white/60',
      default: 'text-base text-white/70',
      small: 'text-sm text-white/60',
      xsmall: 'text-xs text-white/50',
    },
  },

  // Border Radius
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },

  // Transitions
  transitions: {
    default: 'transition-all duration-300',
    fast: 'transition-all duration-200',
    slow: 'transition-all duration-500',
  },
} as const;

// Animations Framer Motion
export const kryptonAnimations = {
  // Container avec stagger
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },

  // Item avec spring
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 50,
        stiffness: 200,
        mass: 1,
      },
    },
  },

  // Fade in simple
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6 },
    },
  },

  // Scale on hover
  scaleOnHover: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  },

  // Slide from left
  slideLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  },

  // Slide from bottom
  slideUp: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  },
};

// Helpers pour construire des classes
export const buildKryptonClasses = {
  card: (hover = true) => {
    const base = `${kryptonDesign.effects.border.default} ${kryptonDesign.effects.glassmorphism.default} ${kryptonDesign.effects.shadow.card} ${kryptonDesign.radius.md}`;
    const hoverClass = hover ? `hover:${kryptonDesign.effects.glassmorphism.hover} ${kryptonDesign.transitions.default}` : '';
    return `${base} ${hoverClass}`.trim();
  },

  button: (variant: 'primary' | 'secondary' | 'success' | 'purple' | 'outline' = 'primary') => {
    const base = 'px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 border-0';

    const variants = {
      primary: `bg-gradient-to-r ${kryptonDesign.gradients.orange.class} text-white hover:${kryptonDesign.effects.glow.orange}`,
      secondary: `bg-gradient-to-r ${kryptonDesign.gradients.blue.class} text-white hover:${kryptonDesign.effects.glow.blue}`,
      success: `bg-gradient-to-r ${kryptonDesign.gradients.green.class} text-white hover:${kryptonDesign.effects.glow.green}`,
      purple: `bg-gradient-to-r ${kryptonDesign.gradients.purple.class} text-white hover:${kryptonDesign.effects.glow.purple}`,
      outline: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    };

    return `${base} ${variants[variant]}`;
  },

  input: () => {
    return `bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-[#f68100]/50 ${kryptonDesign.transitions.default}`;
  },

  badge: (variant: 'default' | 'primary' | 'secondary' | 'success' = 'default') => {
    const base = 'px-3 py-1 rounded-lg text-xs font-semibold border';

    const variants = {
      default: 'bg-white/10 border-white/20 text-white/80',
      primary: 'bg-[#f68100]/20 border-[#f68100]/30 text-white',
      secondary: 'bg-[#0099ff]/20 border-[#0099ff]/30 text-white',
      success: 'bg-[#10b981]/20 border-[#10b981]/30 text-white',
    };

    return `${base} ${variants[variant]}`;
  },
};

// Export des couleurs pour usage dans le code
export const getKryptonColor = (path: string) => {
  const keys = path.split('.');
  let value: any = kryptonDesign.colors;

  for (const key of keys) {
    value = value?.[key];
  }

  return value || kryptonDesign.colors.primary;
};
