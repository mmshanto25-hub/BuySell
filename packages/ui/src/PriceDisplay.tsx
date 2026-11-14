import * as React from 'react';
import { cn } from './lib/utils';
import { formatCurrency } from '@marketplace/utils';

export interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function PriceDisplay({ price, compareAtPrice, className, size = 'md' }: PriceDisplayProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  const sizeStyles = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-extrabold',
  };

  return (
    <div className={cn('flex items-baseline gap-2 flex-wrap', className)}>
      <span className={cn('text-[#101828]', sizeStyles[size])}>{formatCurrency(price)}</span>

      {hasDiscount && (
        <>
          <span className="text-xs text-[#667085] line-through font-normal">
            {formatCurrency(compareAtPrice!)}
          </span>
          <span className="text-xs font-semibold text-[#059669] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
