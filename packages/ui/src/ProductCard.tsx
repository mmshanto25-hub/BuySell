'use client';

import * as React from 'react';
import { Card } from './Card';
import { PriceDisplay } from './PriceDisplay';
import { Rating } from './Rating';
import { Badge } from './Badge';
import { Button } from './Button';
import { ShoppingCart, Heart } from 'lucide-react';
import { cn } from './lib/utils';

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  storeName: string;
  storeSlug?: string;
  basePrice: number;
  compareAtPrice?: number;
  rating: number;
  totalReviews: number;
  isFlashSale?: boolean;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  className?: string;
}

export function ProductCard({
  id,
  title,
  slug,
  imageUrl,
  storeName,
  basePrice,
  compareAtPrice,
  rating,
  totalReviews,
  isFlashSale = false,
  onAddToCart,
  onToggleWishlist,
  className,
}: ProductCardProps) {
  return (
    <Card className={cn('group overflow-hidden flex flex-col h-full hover:shadow-card transition-all duration-200 border-[#E4E7EC]', className)}>
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-[#F8FAFC] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#667085] text-xs">
            No image
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isFlashSale && <Badge variant="cyan">Flash Deal</Badge>}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist?.(id);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-[#E4E7EC] flex items-center justify-center text-[#667085] hover:text-[#DC2626] hover:bg-white shadow-sm transition-all"
          aria-label="Save to wishlist"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Product Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-[#667085] tracking-wide uppercase">{storeName}</span>
          <h4 className="text-sm font-semibold text-[#101828] line-clamp-2 leading-snug group-hover:text-[#3563E9] transition-colors">
            {title}
          </h4>
        </div>

        <div className="space-y-2 pt-1">
          <Rating value={rating} totalReviews={totalReviews} />

          <div className="flex items-center justify-between pt-1">
            <PriceDisplay price={basePrice} compareAtPrice={compareAtPrice} size="md" />

            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(id);
              }}
              className="rounded-lg hover:bg-[#3563E9] hover:text-white hover:border-[#3563E9] transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
