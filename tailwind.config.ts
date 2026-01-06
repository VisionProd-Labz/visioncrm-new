import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Krypton Theme Colors
        krypton: {
          background: {
            primary: '#07010f',
            card: 'rgba(226, 232, 255, 0.12)',
            overlay: 'rgba(0, 0, 0, 0.7)',
          },
          accent: {
            orange: '#f68100',
            blue: '#0099ff',
            purple: '#7647ff',
            green: '#10b981',
          },
          text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            muted: 'rgba(255, 255, 255, 0.6)',
          },
          border: {
            default: 'rgba(255, 255, 255, 0.2)',
            muted: 'rgba(255, 255, 255, 0.15)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter Display', 'Inter', 'system-ui'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Krypton border radius
        'krypton-sm': '8px',
        'krypton-md': '10px',
        'krypton-lg': '14px',
        'krypton-xl': '20px',
        'krypton-2xl': '24px',
      },
      boxShadow: {
        'krypton-card': '0 0 0 1px rgba(255, 255, 255, 0.16), 0 1px 8px rgba(118, 71, 255, 0.04), 0 1px 4px rgba(151, 71, 255, 0.08), inset 0 0 16px rgba(255, 255, 255, 0.03)',
        'krypton-glow': '0 3px 20px rgba(255, 186, 109, 0.4)',
        'krypton-subtle': '0 0 0 1px rgba(255, 255, 255, 0.16)',
      },
      backdropBlur: {
        'krypton-sm': '4px',
        'krypton-md': '10px',
        'krypton-lg': '90px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
