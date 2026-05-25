import type { AssignmentFormData, QuestionType } from '@/types';

export interface FieldErrors {
  [key: string]: string;
}

export function getTotalQuestions(counts: AssignmentFormData['questionCounts'], types: QuestionType[]): number {
  return types.reduce((sum, t) => sum + (counts[t] || 0), 0);
}

export function validateAssignmentForm(data: AssignmentFormData): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.title.trim()) errors.title = 'Assignment title is required';
  if (!data.subject.trim()) errors.subject = 'Subject is required';
  if (!data.dueDate) {
    errors.dueDate = 'Due date is required';
  } else if (new Date(data.dueDate) <= new Date()) {
    errors.dueDate = 'Due date must be in the future';
  }
  if (data.questionTypes.length === 0) {
    errors.questionTypes = 'Select at least one question type';
  }
  for (const t of data.questionTypes) {
    const c = data.questionCounts[t];
    if (!c || c < 1) {
      errors.questionTypes = `Set at least 1 question for ${t}`;
      break;
    }
  }
  const total = getTotalQuestions(data.questionCounts, data.questionTypes);
  if (total < 1) errors.questionTypes = 'Total questions must be at least 1';
  if (data.marksPerQuestion < 1) errors.marksPerQuestion = 'Marks must be positive';
  const diffSum = data.difficulty.easy + data.difficulty.medium + data.difficulty.hard;
  if (diffSum !== 100) errors.difficulty = 'Difficulty must total 100%';
  if (data.file) {
    const allowed = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
    if (!allowed.includes(data.file.type)) {
      errors.file = 'Allowed: PDF, TXT, JPEG, PNG (max 10MB)';
    }
    if (data.file.size > 10 * 1024 * 1024) errors.file = 'File must be under 10MB';
  }

  return errors;
}
