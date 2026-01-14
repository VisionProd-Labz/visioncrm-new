#!/bin/bash
echo "📦 Installation des dépendances complètes..."

# Animation & UI
pnpm add framer-motion recharts date-fns --silent

# Radix UI - Tous les composants
pnpm add @radix-ui/react-switch @radix-ui/react-dropdown-menu @radix-ui/react-select \
  @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-popover \
  @radix-ui/react-separator @radix-ui/react-tabs @radix-ui/react-avatar @radix-ui/react-checkbox \
  @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-accordion \
  @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-collapsible \
  @radix-ui/react-context-menu @radix-ui/react-hover-card @radix-ui/react-menubar \
  @radix-ui/react-navigation-menu @radix-ui/react-progress @radix-ui/react-radio-group \
  @radix-ui/react-scroll-area @radix-ui/react-slider @radix-ui/react-toast @radix-ui/react-tooltip --silent

echo "✅ Toutes les dépendances installées!"
