'use client';

import { useId } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary font-display">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-2xl border-[1.75px] border-border bg-white px-4 py-3',
          'text-text-primary placeholder:text-text-muted outline-none transition',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
