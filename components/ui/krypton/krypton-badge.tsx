import { cn } from '@/lib/utils';
import { kryptonDesign } from '@/lib/design-system';

interface KryptonBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export function KryptonBadge({
  children,
  variant = 'default',
  size = 'md',
  className,
  icon,
}: KryptonBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  const variantClasses = {
    default: 'bg-white/10 border-white/20 text-white/80',
    primary: 'bg-[#f68100]/20 border-[#f68100]/30 text-white',
    secondary: 'bg-[#0099ff]/20 border-[#0099ff]/30 text-white',
    success: 'bg-[#10b981]/20 border-[#10b981]/30 text-white',
    warning: 'bg-[#f59e0b]/20 border-[#f59e0b]/30 text-white',
    error: 'bg-[#ef4444]/20 border-[#ef4444]/30 text-white',
    purple: 'bg-[#8b5cf6]/20 border-[#8b5cf6]/30 text-white',
  };

  return (
    <span
      className={cn(
        // Base
        'inline-flex items-center gap-1.5',
        'rounded-lg font-semibold border',
        kryptonDesign.transitions.fast,

        // Size
        sizeClasses[size],

        // Variant
        variantClasses[variant],

        // Custom
        className
      )}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </span>
  );
}
