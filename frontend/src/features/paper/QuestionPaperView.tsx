'use client';

import { Download, RefreshCw } from 'lucide-react';
import type { QuestionPaper } from '@/types';
import { DifficultyBadge } from '@/components/ui/DifficultyBadge';
import { Button } from '@/components/ui/Button';
import { getPdfUrl } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { isMcqSection } from '@/utils/questionTypes';
import { McqOptions } from '@/components/paper/McqOptions';

interface QuestionPaperViewProps {
  paper: QuestionPaper;
  assignmentId: string;
  grade?: string;
  onRegenerate?: (scope: 'full' | 'section', sectionTitle?: string) => void;
  regenerating?: boolean;
}

export function QuestionPaperView({
  paper,
  assignmentId,
  grade,
  onRegenerate,
  regenerating,
}: QuestionPaperViewProps) {
  const { settings } = useAppStore();
  let questionNum = 1;

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-bg-dark p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <p className="font-bold font-display">
          Your customized question paper for {paper.subject} is ready.
        </p>
        <div className="flex gap-2 flex-wrap">
          <a href={getPdfUrl(assignmentId)} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" icon={<Download className="h-4 w-4" />}>
              Download as PDF
            </Button>
          </a>
          {onRegenerate && (
            <Button
              variant="ghost"
              className="text-white border border-white/30"
              icon={<RefreshCw className="h-4 w-4" />}
              loading={regenerating}
              onClick={() => onRegenerate('full')}
            >
              Regenerate All
            </Button>
          )}
        </div>
      </div>

      <article
        id="question-paper"
        className="glass-card rounded-[32px] p-8 md:p-12 space-y-8 print:shadow-none print:border print:border-gray-300"
      >
        <header className="text-center space-y-2 border-b border-border pb-6">
          <h1 className="text-xl md:text-2xl font-bold font-display">
            {settings.schoolName}
          </h1>
          <p className="text-lg font-semibold">{paper.title}</p>
          <p className="text-sm text-text-secondary">
            Subject: {paper.subject}
            {grade ? ` · Class: ${grade}` : ''}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm mt-4">
            <span>Time Allowed: {paper.duration}</span>
            <span>Maximum Marks: {paper.totalMarks}</span>
          </div>
          <p className="text-sm italic mt-2">
            All questions are compulsory unless stated otherwise.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-b border-dashed border-border pb-6">
          <p>Name: _____________________________</p>
          <p>Roll Number: ______________________</p>
          <p>Section: ___________________________</p>
        </section>

        {paper.sections.map((section) => (
          <section key={section.title} className="space-y-4 break-inside-avoid">
            <div className="flex items-start justify-between gap-4 no-print">
              <div>
                <h2 className="text-lg font-bold font-display">
                  {section.title}
                </h2>
                <p className="text-sm text-text-secondary italic">{section.instruction}</p>
              </div>
              {onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  loading={regenerating}
                  onClick={() => onRegenerate('section', section.title)}
                >
                  Regenerate section
                </Button>
              )}
            </div>
            <div className="print:block hidden">
              <h2 className="text-lg font-bold">{section.title}</h2>
              <p className="text-sm italic mb-4">{section.instruction}</p>
            </div>
            <ol className="space-y-5 list-none">
              {section.questions.map((q) => {
                const num = questionNum++;
                return (
                  <li key={`${section.title}-${num}`} className="flex gap-3">
                    <span className="font-semibold shrink-0 w-6">{num}.</span>
                    <div className="flex-1 space-y-2">
                      <p className="text-base leading-relaxed font-medium">{q.question}</p>
                      {q.options && q.options.length > 0 && (
                        <McqOptions options={q.options} />
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        <DifficultyBadge difficulty={q.difficulty} />
                        <span className="text-sm font-medium text-text-secondary">
                          [{q.marks} Marks]
                        </span>
                        {isMcqSection(section.title) && (
                          <span className="text-xs text-text-muted">Select one option</span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}

        <footer className="text-center pt-8 border-t border-border">
          <p className="font-bold text-text-secondary">— End of Question Paper —</p>
        </footer>
      </article>
    </div>
  );
}
