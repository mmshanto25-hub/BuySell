import * as React from 'react';
import { Card, CardContent } from './Card';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  changePercent?: number; // e.g. 12.5 or -3.2
  timeframe?: string; // e.g. "vs last month"
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, changePercent, timeframe = 'vs last month', icon, className }: StatCardProps) {
  const isPositive = changePercent !== undefined && changePercent >= 0;

  return (
    <Card className={cn('p-5 overflow-hidden', className)}>
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#667085] tracking-wide uppercase">{title}</span>
          {icon && <div className="text-[#3563E9] p-2 rounded-lg bg-[#EFF4FF]">{icon}</div>}
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight text-[#101828]">{value}</div>

          {changePercent !== undefined && (
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  'inline-flex items-center font-semibold gap-0.5',
                  isPositive ? 'text-[#059669]' : 'text-[#DC2626]'
                )}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive ? `+${changePercent}%` : `${changePercent}%`}
              </span>
              <span className="text-[#667085]">{timeframe}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
