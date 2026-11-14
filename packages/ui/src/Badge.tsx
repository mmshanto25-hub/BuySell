import * as React from 'react';
import { cn } from './lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'cyan' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#F8FAFC] text-[#101828] border border-[#E4E7EC]',
    success: 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]',
    warning: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
    destructive: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
    info: 'bg-[#EFF4FF] text-[#3563E9] border border-[#DBE7FE]',
    cyan: 'bg-[#CFFAFE] text-[#0891B2] border border-[#A5F3FC]',
    outline: 'border border-[#E4E7EC] text-[#667085]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
