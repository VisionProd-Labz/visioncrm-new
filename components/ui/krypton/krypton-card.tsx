import { cn } from '@/lib/utils';
import { kryptonDesign } from '@/lib/design-system';

interface KryptonCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}

export function KryptonCard({
  children,
  className,
  hover = true,
  padding = 'md',
  onClick,
}: KryptonCardProps) {
  const paddingClass = kryptonDesign.spacing.cardPadding[padding];

  return (
    <div
      onClick={onClick}
      className={cn(
        // Base styles
        'relative overflow-hidden',
        paddingClass,
        kryptonDesign.effects.border.default,
        kryptonDesign.effects.glassmorphism.default,
        kryptonDesign.effects.shadow.card,
        kryptonDesign.radius.md,

        // Hover effect
        hover && [
          `hover:${kryptonDesign.effects.glassmorphism.hover}`,
          kryptonDesign.transitions.default,
        ],

        // Cursor
        onClick && 'cursor-pointer',

        // Custom classes
        className
      )}
    >
      {/* Hover gradient effect */}
      {hover && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}

interface KryptonCardWithAccentProps extends KryptonCardProps {
  accentColor?: string;
  accentPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export function KryptonCardWithAccent({
  children,
  accentColor = kryptonDesign.colors.primary,
  accentPosition = 'bottom',
  ...props
}: KryptonCardWithAccentProps) {
  const positionClasses = {
    top: 'top-0 left-0 right-0 h-1',
    bottom: 'bottom-0 left-0 right-0 h-1',
    left: 'left-0 top-0 bottom-0 w-1',
    right: 'right-0 top-0 bottom-0 w-1',
  };

  return (
    <KryptonCard {...props}>
      {/* Accent line */}
      <div
        className={cn('absolute', positionClasses[accentPosition])}
        style={{
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        }}
      />
      {children}
    </KryptonCard>
  );
}
