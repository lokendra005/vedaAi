import { cn } from '@/utils/cn';
import type { Difficulty } from '@/types';

const styles: Record<Difficulty, string> = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
};

const labels: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize no-print',
        styles[difficulty]
      )}
    >
      {labels[difficulty]}
    </span>
  );
}
