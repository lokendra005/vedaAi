'use client';

import { cn } from '@/utils/cn';

export function ProgressBar({ progress, className }: { progress: number; className?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-black/10', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
