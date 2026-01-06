import { cn } from '@/lib/utils';
import { kryptonDesign, kryptonAnimations } from '@/lib/design-system';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface KryptonButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'purple' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function KryptonButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  icon,
  iconPosition = 'left',
}: KryptonButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm h-9',
    md: 'px-6 py-2.5 text-base h-11',
    lg: 'px-8 py-3 text-lg h-14',
  };

  const variantClasses = {
    primary: `bg-gradient-to-r ${kryptonDesign.gradients.orange.class} text-white hover:${kryptonDesign.effects.glow.orange} hover:scale-[1.02]`,
    secondary: `bg-gradient-to-r ${kryptonDesign.gradients.blue.class} text-white hover:${kryptonDesign.effects.glow.blue} hover:scale-[1.02]`,
    success: `bg-gradient-to-r ${kryptonDesign.gradients.green.class} text-white hover:${kryptonDesign.effects.glow.green} hover:scale-[1.02]`,
    purple: `bg-gradient-to-r ${kryptonDesign.gradients.purple.class} text-white hover:${kryptonDesign.effects.glow.purple} hover:scale-[1.02]`,
    outline:
      'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center gap-2',
        'font-semibold rounded-xl',
        'transition-all duration-300',
        'border-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',

        // Size
        sizeClasses[size],

        // Variant
        variantClasses[variant],

        // Custom
        className
      )}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}

      {/* Icon left */}
      {!loading && icon && iconPosition === 'left' && (
        <span className="inline-flex">{icon}</span>
      )}

      {/* Content */}
      {!loading && children}

      {/* Icon right */}
      {!loading && icon && iconPosition === 'right' && (
        <span className="inline-flex">{icon}</span>
      )}
    </motion.button>
  );
}
