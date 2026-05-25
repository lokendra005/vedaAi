'use client';

import type { DifficultyDistribution } from '@/types';
import { cn } from '@/utils/cn';

interface DifficultySliderProps {
  value: DifficultyDistribution;
  onChange: (v: DifficultyDistribution) => void;
  error?: string;
}

export function DifficultySlider({ value, onChange, error }: DifficultySliderProps) {
  const adjust = (key: keyof DifficultyDistribution, newVal: number) => {
    const clamped = Math.max(0, Math.min(100, newVal));
    const others = (['easy', 'medium', 'hard'] as const).filter((k) => k !== key);
    const remaining = 100 - clamped;
    const otherSum = others.reduce((s, k) => s + value[k], 0);
    const next = { ...value, [key]: clamped };
    if (otherSum > 0) {
      for (const k of others) {
        next[k] = Math.round((value[k] / otherSum) * remaining);
      }
    } else {
      const each = Math.floor(remaining / others.length);
      others.forEach((k, i) => {
        next[k] = i === 0 ? remaining - each * (others.length - 1) : each;
      });
    }
    const sum = next.easy + next.medium + next.hard;
    if (sum !== 100) next[others[0]] += 100 - sum;
    onChange(next);
  };

  const fields: { key: keyof DifficultyDistribution; label: string; color: string }[] = [
    { key: 'easy', label: 'Easy', color: 'accent-green-500' },
    { key: 'medium', label: 'Medium', color: 'accent-amber-500' },
    { key: 'hard', label: 'Hard', color: 'accent-red-500' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-medium font-display">
        Difficulty Distribution
      </label>
      {fields.map(({ key, label, color }) => (
        <div key={key} className="flex items-center gap-4">
          <span className="w-16 text-sm text-text-secondary">{label}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={value[key]}
            onChange={(e) => adjust(key, Number(e.target.value))}
            className={cn('flex-1 h-2 rounded-full', color)}
          />
          <span className="w-10 text-right text-sm font-semibold">{value[key]}%</span>
        </div>
      ))}
      <div className="flex h-3 rounded-full overflow-hidden">
        <div className="bg-green-400" style={{ width: `${value.easy}%` }} />
        <div className="bg-amber-400" style={{ width: `${value.medium}%` }} />
        <div className="bg-red-400" style={{ width: `${value.hard}%` }} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
