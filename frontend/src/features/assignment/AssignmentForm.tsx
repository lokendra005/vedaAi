'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Mic } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '@/store/useAppStore';
import { validateAssignmentForm, getTotalQuestions } from '@/utils/validation';
import { createAssignment } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { FileUpload } from './FileUpload';
import { QuestionTypeConfig } from './QuestionTypeConfig';
import { DifficultySlider } from './DifficultySlider';

export function AssignmentForm() {
  const router = useRouter();
  const { form, setForm, setQuestionTypes, setLoading, isLoading } = useAppStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalQuestions = getTotalQuestions(form.questionCounts, form.questionTypes);
  const totalMarks = form.questionTypes.reduce((sum, type) => {
    const count = form.questionCounts[type] || 0;
    const marks = form.questionMarks[type] || 0;
    return sum + count * marks;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validateAssignmentForm(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error('Please fix validation errors');
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('subject', form.subject);
      fd.append('grade', form.grade);
      fd.append('dueDate', new Date(form.dueDate).toISOString());
      fd.append('questionTypes', JSON.stringify(form.questionTypes));
      fd.append('questionCounts', JSON.stringify(form.questionCounts));
      fd.append('questionMarks', JSON.stringify(form.questionMarks));
      fd.append('totalQuestions', String(totalQuestions));
      fd.append('marksPerQuestion', String(2)); // Default placeholder to satisfy backend Zod schema
      fd.append('difficulty', JSON.stringify(form.difficulty));
      if (form.instructions) fd.append('instructions', form.instructions);
      if (form.file) fd.append('file', form.file);

      const { assignment } = await createAssignment(fd);
      toast.success('Assignment created — generating question paper...');
      router.push(`/assignments/${assignment._id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="glass-card rounded-[32px] p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold font-display">
            Assignment Details
          </h2>
          <p className="text-sm text-text-secondary">Basic information about your assignment</p>
        </div>

        <FileUpload
          file={form.file}
          onChange={(file) => setForm({ file })}
          error={errors.file}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Assignment Title"
            placeholder="e.g. Physics Unit Test"
            value={form.title}
            onChange={(e) => setForm({ title: e.target.value })}
            error={errors.title}
          />
          <Input
            label="Subject"
            placeholder="e.g. Science"
            value={form.subject}
            onChange={(e) => setForm({ subject: e.target.value })}
            error={errors.subject}
          />
          <Input
            label="Grade / Class"
            placeholder="e.g. 8"
            value={form.grade}
            onChange={(e) => setForm({ grade: e.target.value })}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium font-display">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-2xl border-[1.75px] border-border bg-white px-4 py-3 pr-10"
                value={form.dueDate}
                onChange={(e) => setForm({ dueDate: e.target.value })}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none" />
            </div>
            {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate}</p>}
          </div>
        </div>

        <QuestionTypeConfig
          selected={form.questionTypes}
          counts={form.questionCounts}
          marks={form.questionMarks}
          onTypesChange={setQuestionTypes}
          onCountsChange={(questionCounts) => setForm({ questionCounts })}
          onMarksChange={(questionMarks) => setForm({ questionMarks })}
          error={errors.questionTypes}
        />

        <div className="grid grid-cols-2 gap-4 bg-bg-off-white/40 p-4 rounded-2xl border border-border">
          <div className="text-center py-3 bg-white rounded-xl shadow-sm border border-border/60">
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Total Questions</p>
            <p className="text-xl font-bold font-display text-text-primary mt-1">{totalQuestions}</p>
          </div>
          <div className="text-center py-3 bg-white rounded-xl shadow-sm border border-border/60">
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Total Marks</p>
            <p className="text-xl font-bold font-display text-primary mt-1">{totalMarks}</p>
          </div>
        </div>

        <DifficultySlider
          value={form.difficulty}
          onChange={(difficulty) => setForm({ difficulty })}
          error={errors.difficulty}
        />

        <Textarea
          label="Additional Instructions"
          placeholder="Bloom's level focus, chapter references, formatting preferences..."
          value={form.instructions}
          onChange={(e) => setForm({ instructions: e.target.value })}
        />

        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Mic className="h-4 w-4 text-primary" />
          <span>Voice input coming soon</span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push('/')}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading} size="lg">
          Generate Question Paper
        </Button>
      </div>
    </form>
  );
}
