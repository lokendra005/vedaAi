'use client';

import { X, ChevronDown, Minus, Plus } from 'lucide-react';
import type { QuestionType, QuestionCounts } from '@/types';
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

interface QuestionTypeConfigProps {
  selected: QuestionType[];
  counts: QuestionCounts;
  marks: QuestionCounts;
  onTypesChange: (types: QuestionType[]) => void;
  onCountsChange: (counts: QuestionCounts) => void;
  onMarksChange: (marks: QuestionCounts) => void;
  error?: string;
}

export function QuestionTypeConfig({
  selected,
  counts,
  marks,
  onTypesChange,
  onCountsChange,
  onMarksChange,
  error,
}: QuestionTypeConfigProps) {
  const available = ALL_TYPES.filter((t) => !selected.includes(t));

  const add = (type: QuestionType) => {
    if (!selected.includes(type)) {
      onTypesChange([...selected, type]);
    }
  };

  const remove = (type: QuestionType) => {
    const nextCounts = { ...counts };
    delete nextCounts[type];
    onCountsChange(nextCounts);

    const nextMarks = { ...marks };
    delete nextMarks[type];
    onMarksChange(nextMarks);

    onTypesChange(selected.filter((t) => t !== type));
  };

  const setCount = (type: QuestionType, count: number) => {
    onCountsChange({ ...counts, [type]: Math.max(1, Math.min(50, count)) });
  };

  const setMark = (type: QuestionType, mark: number) => {
    onMarksChange({ ...marks, [type]: Math.max(1, Math.min(100, mark)) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span id="question-types-label" className="text-sm font-bold font-display text-text-primary">
          Question Configuration
        </span>
        <span className="text-xs text-text-muted">
          Configure counts and marks per type
        </span>
      </div>

      {selected.length > 0 && (
        <div className="space-y-4">
          {/* Grid Headers - Desktop Only */}
          <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
            <div>Question Type</div>
            <div className="text-center">No. of Questions</div>
            <div className="text-center">Marks per Question</div>
            <div className="w-10"></div>
          </div>

          <div className="space-y-3">
            {selected.map((type) => (
              <div
                key={type}
                className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_auto] gap-3 md:gap-4 items-center rounded-2xl border border-border/80 bg-white/60 backdrop-blur-sm p-4 hover:border-primary/30 transition-all shadow-sm"
              >
                {/* Type Title */}
                <div className="flex items-center justify-between md:justify-start gap-2">
                  <div>
                    <p className="text-sm font-bold text-text-primary font-display">{labels[type]}</p>
                    <p className="text-xs text-text-muted font-medium">{type}</p>
                  </div>
                  {/* Mobile delete button */}
                  <button
                    type="button"
                    onClick={() => remove(type)}
                    className="md:hidden flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:text-red-500 hover:bg-red-50 transition"
                    aria-label={`Remove ${labels[type]}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Question Counter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-center gap-2">
                  <span className="text-xs font-medium text-text-secondary md:hidden">No. of Questions:</span>
                  <div className="flex items-center justify-between md:justify-center rounded-full bg-white border border-border px-1 py-1 w-full md:w-32 shadow-sm">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-bg-off-white active:scale-95 transition"
                      onClick={() => setCount(type, (counts[type] || 1) - 1)}
                      aria-label={`Decrease ${labels[type]} count`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm font-bold text-text-primary w-8 text-center tabular-nums">
                      {counts[type] || 1}
                    </span>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-bg-off-white active:scale-95 transition"
                      onClick={() => setCount(type, (counts[type] || 1) + 1)}
                      aria-label={`Increase ${labels[type]} count`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Marks Counter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between md:justify-center gap-2">
                  <span className="text-xs font-medium text-text-secondary md:hidden">Marks per Question:</span>
                  <div className="flex items-center justify-between md:justify-center rounded-full bg-white border border-border px-1 py-1 w-full md:w-32 shadow-sm">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-bg-off-white active:scale-95 transition"
                      onClick={() => setMark(type, (marks[type] || 1) - 1)}
                      aria-label={`Decrease ${labels[type]} marks`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm font-bold text-text-primary w-8 text-center tabular-nums">
                      {marks[type] || 1}
                    </span>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-bg-off-white active:scale-95 transition"
                      onClick={() => setMark(type, (marks[type] || 1) + 1)}
                      aria-label={`Increase ${labels[type]} marks`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Desktop delete button */}
                <div className="hidden md:block">
                  <button
                    type="button"
                    onClick={() => remove(type)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:text-red-500 hover:bg-red-50 transition"
                    aria-label={`Remove ${labels[type]}`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected.length === 0 && (
        <p className="text-sm text-text-muted italic bg-bg-off-white/40 p-4 rounded-xl border border-dashed text-center">
          Add at least one question type below to get started.
        </p>
      )}

      {available.length > 0 && (
        <div className="relative mt-2">
          <select
            id="add-question-type"
            aria-labelledby="question-types-label"
            className={cn(
              'w-full appearance-none rounded-2xl border border-border bg-white px-4 py-3.5 pr-10',
              'text-sm font-semibold text-text-secondary cursor-pointer shadow-sm focus:border-primary transition-all',
              error && 'border-red-400'
            )}
            value=""
            onChange={(e) => {
              if (e.target.value) add(e.target.value as QuestionType);
            }}
          >
            <option value="">+ Add Question Type (e.g. MCQ, Short Answer)...</option>
            {available.map((t) => (
              <option key={t} value={t}>
                {labels[t]}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
        </div>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
