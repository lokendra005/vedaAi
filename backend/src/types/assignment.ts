export type AssignmentStatus =
  | 'draft'
  | 'queued'
  | 'generating'
  | 'completed'
  | 'failed';

export type QuestionType =
  | 'MCQ'
  | 'Short Answer'
  | 'Long Answer'
  | 'Diagram/Graph-Based'
  | 'Fill in the Blanks';

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export type QuestionCounts = Partial<Record<QuestionType, number>>;

export interface CreateAssignmentInput {
  title: string;
  subject: string;
  grade?: string;
  dueDate: string;
  questionTypes: QuestionType[];
  questionCounts: QuestionCounts;
  questionMarks?: QuestionCounts;
  totalQuestions: number;
  marksPerQuestion: number;
  difficulty: DifficultyDistribution;
  instructions?: string;
  documentContext?: string;
}

export type WsEvent =
  | 'generation_started'
  | 'generation_progress'
  | 'generation_completed'
  | 'generation_failed';

export interface WsPayload {
  assignmentId: string;
  progress?: number;
  state?: string;
  error?: string;
  paperId?: string;
}
