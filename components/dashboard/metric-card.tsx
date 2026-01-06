'use client';

import { LucideIcon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trendData?: Array<{ value: number }>;
  trendColor?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBgColor,
  trendData,
  trendColor = '#3b82f6',
}: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
              isPositive
                ? 'text-emerald-500 bg-emerald-500/10'
                : isNegative
                ? 'text-red-500 bg-red-500/10'
                : 'text-muted-foreground bg-muted'
            }`}
          >
            {isPositive && <ArrowUpIcon className="w-3 h-3" />}
            {isNegative && <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </div>
      {trendData && trendData.length > 0 && (
        <div className="mt-3 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={trendColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
