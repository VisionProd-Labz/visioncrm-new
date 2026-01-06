import { cn } from '@/lib/utils';
import { kryptonDesign } from '@/lib/design-system';
import { forwardRef } from 'react';

interface KryptonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  error?: string;
}

export const KryptonInput = forwardRef<HTMLInputElement, KryptonInputProps>(
  ({ className, icon, iconPosition = 'left', error, ...props }, ref) => {
    return (
      <div className="relative">
        {/* Icon left */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          className={cn(
            // Base
            'w-full rounded-lg font-medium',
            'bg-white/5 border border-white/10',
            'text-white placeholder:text-white/40',

            // Focus
            'focus:bg-white/10 focus:border-[#f68100]/50 focus:outline-none',
            'focus:ring-2 focus:ring-[#f68100]/20',

            // Transitions
            kryptonDesign.transitions.default,

            // Error state
            error && 'border-red-500/50 focus:border-red-500',

            // Icon padding
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            !icon && 'px-4',

            // Height
            'h-11',

            // Custom
            className
          )}
          {...props}
        />

        {/* Icon right */}
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            {icon}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

KryptonInput.displayName = 'KryptonInput';
