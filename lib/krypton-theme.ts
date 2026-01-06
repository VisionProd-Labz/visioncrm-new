/**
 * Krypton Design System Configuration
 * Cloned from https://krypton.framer.website/
 */

export const kryptonTheme = {
  colors: {
    // Primary Colors
    background: {
      primary: '#07010f',
      card: 'rgba(226, 232, 255, 0.12)',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
    accent: {
      orange: '#f68100',
      blue: '#0099ff',
      purple: '#7647ff',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      muted: 'rgba(255, 255, 255, 0.6)',
    },
    border: {
      default: 'rgba(255, 255, 255, 0.2)',
      muted: 'rgba(255, 255, 255, 0.15)',
      accent: '#f68100',
    },
  },

  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Inter Display', 'Inter', 'system-ui'],
    },
    fontSize: {
      hero: {
        desktop: '50px',
        tablet: '32px',
        mobile: '24px',
      },
      h1: {
        desktop: '40px',
        tablet: '30px',
        mobile: '19px',
      },
      h2: {
        desktop: '24px',
        tablet: '19px',
        mobile: '15px',
      },
      body: {
        desktop: '18px',
        tablet: '14px',
        mobile: '14px',
      },
      small: '14px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.4',
      relaxed: '1.5',
    },
    letterSpacing: {
      tight: '-0.06em',
      normal: '-0.01em',
    },
  },

  spacing: {
    xs: '6px',
    sm: '10px',
    md: '14px',
    lg: '20px',
    xl: '30px',
    '2xl': '40px',
    '3xl': '64px',
    '4xl': '100px',
  },

  borderRadius: {
    sm: '8px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    '2xl': '24px',
  },

  shadows: {
    card: '0 0 0 1px rgba(255, 255, 255, 0.16), 0 1px 8px rgba(118, 71, 255, 0.04), 0 1px 4px rgba(151, 71, 255, 0.08), inset 0 0 16px rgba(255, 255, 255, 0.03)',
    glow: '0 3px 20px rgba(255, 186, 109, 0.4)',
    subtle: '0 0 0 1px rgba(255, 255, 255, 0.16)',
  },

  effects: {
    backdropBlur: {
      sm: 'blur(4px)',
      md: 'blur(10px)',
      lg: 'blur(90px)',
    },
    gradient: {
      card: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
      radial: 'radial-gradient(50% 50% at 50% 0%, rgba(246, 129, 0, 0.2) 0%, transparent 100%)',
      accent: 'linear-gradient(135deg, #f68100 0%, #ff9500 100%)',
    },
  },

  breakpoints: {
    mobile: '390px',
    tablet: '810px',
    desktop: '1200px',
  },

  animation: {
    spring: {
      damping: 50,
      stiffness: 200,
      mass: 1,
    },
    duration: {
      fast: '200ms',
      normal: '300ms',
      slow: '600ms',
    },
    easing: {
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const;

export type KryptonTheme = typeof kryptonTheme;
