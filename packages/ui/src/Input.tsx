import * as React from 'react';
import { cn } from './lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, id, ...props }, ref) => {
    const generatedId = id || React.useId();

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={generatedId} className="block text-xs font-medium text-[#101828]">
            {label}
          </label>
        )}
        <input
          id={generatedId}
          type={type}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-[#E4E7EC] bg-white px-3 py-2 text-sm text-[#101828] placeholder:text-[#667085] transition-all duration-200',
            'focus:border-[#3563E9] focus:outline-none focus:ring-2 focus:ring-[#3563E9]/20',
            'disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-50',
            error && 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
