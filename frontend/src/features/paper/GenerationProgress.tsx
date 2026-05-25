'use client';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';

const stateLabels: Record<string, string> = {
  queued: 'Queued for processing',
  building_prompt: 'Building AI prompt...',
  calling_ai: 'Generating questions with AI...',
  validating: 'Validating structured output...',
  regenerating_section: 'Regenerating section...',
  completed: 'Complete!',
  failed: 'Generation failed',
};

interface GenerationProgressProps {
  progress: number;
  state: string;
  error?: string;
}

export function GenerationProgress({ progress, state, error }: GenerationProgressProps) {
  return (
    <div className="glass-card rounded-[32px] p-8 space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
          <div className="h-6 w-6 rounded-full bg-primary" />
        </div>
        <div>
          <h3 className="font-bold font-display text-lg">
            Generating Question Paper
          </h3>
          <p className="text-sm text-text-secondary">
            {stateLabels[state] || state}
          </p>
        </div>
      </div>
      <ProgressBar progress={progress} />
      <p className="text-right text-sm font-semibold text-primary">{progress}%</p>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>
      )}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );
}
