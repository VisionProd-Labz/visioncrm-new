import { cn } from '@/lib/utils';
import { kryptonDesign } from '@/lib/design-system';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { KryptonCardWithAccent } from './krypton-card';

interface KryptonStatProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  icon: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export function KryptonStat({
  title,
  value,
  subtitle,
  change,
  icon,
  accentColor = kryptonDesign.colors.primary,
  className,
}: KryptonStatProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <KryptonCardWithAccent
      accentColor={accentColor}
      accentPosition="bottom"
      className={cn('group', className)}
      hover
    >
      {/* Icon and Change */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-3 rounded-lg transition-transform group-hover:scale-110 duration-300"
          style={{
            backgroundColor: `${accentColor}20`,
            color: accentColor,
          }}
        >
          {icon}
        </div>

        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-semibold',
              isPositive ? 'text-emerald-500' : 'text-red-500'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {change}%
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <p className="text-sm text-white/60 mb-1">{title}</p>

      {/* Value */}
      <p className="text-3xl font-bold text-white mb-1">{value}</p>

      {/* Subtitle */}
      {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
    </KryptonCardWithAccent>
  );
}
