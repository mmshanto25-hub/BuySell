import * as React from 'react';
import { cn } from './lib/utils';
import { Star } from 'lucide-react';

export interface RatingProps {
  value: number; // 0 to 5
  totalReviews?: number;
  size?: 'sm' | 'md';
  className?: string;
  showText?: boolean;
}

export function Rating({ value, totalReviews, size = 'sm', className, showText = true }: RatingProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center text-[#D97706]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              iconSize,
              star <= Math.round(value) ? 'fill-[#D97706] text-[#D97706]' : 'text-[#E4E7EC]'
            )}
          />
        ))}
      </div>
      {showText && (
        <span className="text-xs font-medium text-[#101828]">
          {value.toFixed(1)}
          {totalReviews !== undefined && (
            <span className="text-[#667085] ml-1">({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  );
}
