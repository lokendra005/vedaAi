'use client';

import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' &&
          'bg-[#181818] text-white hover:bg-black shadow-sm active:scale-95 border border-white/10',
        variant === 'secondary' &&
          'bg-white text-text-primary border border-border hover:bg-bg-off-white hover:text-text-primary active:scale-95',
        variant === 'ghost' && 'bg-transparent text-text-secondary hover:bg-black/5 hover:text-text-primary active:scale-95',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-5 py-2.5 text-sm font-semibold',
        size === 'lg' && 'px-7 py-3.5 text-base font-semibold',
        className
      )}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
