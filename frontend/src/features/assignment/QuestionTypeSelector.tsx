'use client';

import { X, ChevronDown } from 'lucide-react';
import type { QuestionType } from '@/types';
import { cn } from '@/utils/cn';

const ALL_TYPES: QuestionType[] = [
  'MCQ',
  'Short Answer',
  'Long Answer',
  'Diagram/Graph-Based',
  'Fill in the Blanks',
];

const labels: Record<QuestionType, string> = {
  MCQ: 'Multiple Choice Questions',
  'Short Answer': 'Short Questions',
  'Long Answer': 'Long Answer Questions',
  'Diagram/Graph-Based': 'Diagram/Graph-Based Questions',
  'Fill in the Blanks': 'Fill in the Blanks',
};

interface QuestionTypeSelectorProps {
  selected: QuestionType[];
  onChange: (types: QuestionType[]) => void;
  error?: string;
}

export function QuestionTypeSelector({ selected, onChange, error }: QuestionTypeSelectorProps) {
  const available = ALL_TYPES.filter((t) => !selected.includes(t));

  const add = (type: QuestionType) => {
    if (!selected.includes(type)) onChange([...selected, type]);
  };

  const remove = (type: QuestionType) => {
    onChange(selected.filter((t) => t !== type));
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium font-display">
        Question Type
      </label>
      <div className="flex flex-wrap gap-2">
        {selected.map((type) => (
          <div
            key={type}
            className="flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-2.5"
          >
            <span className="text-sm">{labels[type]}</span>
            <button
              type="button"
              onClick={() => remove(type)}
              className="text-text-muted hover:text-red-500"
              aria-label={`Remove ${type}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {available.length > 0 && (
        <div className="relative">
          <select
            className={cn(
              'w-full appearance-none rounded-2xl border border-border bg-white px-4 py-3 pr-10',
              'text-sm text-text-secondary cursor-pointer',
              error && 'border-red-400'
            )}
            value=""
            onChange={(e) => {
              if (e.target.value) add(e.target.value as QuestionType);
            }}
          >
            <option value="">Add question type...</option>
            {available.map((t) => (
              <option key={t} value={t}>
                {labels[t]}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
