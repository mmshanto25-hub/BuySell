'use client';

import * as React from 'react';
import { cn } from './lib/utils';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto', className)}>
      <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E4E7EC] flex items-center justify-center text-[#667085] mb-4">
        {icon || <PackageOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-[#101828] mb-1">{title}</h3>
      <p className="text-sm text-[#667085] mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-[#E4E7EC]/60', className)} {...props} />;
}
