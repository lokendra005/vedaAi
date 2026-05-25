import { cn } from '@/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200',
        className
      )}
    />
  );
}
