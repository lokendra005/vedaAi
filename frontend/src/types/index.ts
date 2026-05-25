export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export type QuestionType =
  | 'MCQ'
  | 'Short Answer'
  | 'Long Answer'
  | 'Diagram/Graph-Based'
  | 'Fill in the Blanks';

export type QuestionCounts = Partial<Record<QuestionType, number>>;

export interface QuestionPaper {
  title: string;
  subject: string;
  totalMarks: number;
  duration: string;
  sections: {
    title: string;
    instruction: string;
    questions: {
      question: string;
      difficulty: Difficulty;
      marks: number;
      options?: string[];
    }[];
  }[];
}

export type AssignmentStatus =
  | 'draft'
  | 'queued'
  | 'generating'
  | 'completed'
  | 'failed';

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade?: string;
  dueDate: string;
  questionTypes: QuestionType[];
  questionCounts?: QuestionCounts;
  questionMarks?: QuestionCounts;
  totalQuestions: number;
  marksPerQuestion: number;
  difficulty: DifficultyDistribution;
  instructions?: string;
  status: AssignmentStatus;
  createdAt: string;
}

export interface JobStatus {
  progress: number;
  state: string;
  error?: string;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionType[];
  questionCounts: QuestionCounts;
  questionMarks: QuestionCounts;
  marksPerQuestion: number;
  difficulty: DifficultyDistribution;
  instructions: string;
  file: File | null;
}

export interface Group {
  _id: string;
  name: string;
  grade: string;
  section: string;
  description?: string;
  studentCount: number;
  createdAt: string;
}

export interface TeacherSettings {
  schoolName: string;
  schoolLocation: string;
  defaultGrade: string;
  defaultMarksPerQuestion: number;
  defaultDifficulty: DifficultyDistribution;
}

export type WsEvent =
  | 'generation_started'
  | 'generation_progress'
  | 'generation_completed'
  | 'generation_failed';

export interface WsMessage {
  event: WsEvent;
  payload: {
    assignmentId: string;
    progress?: number;
    state?: string;
    error?: string;
    paperId?: string;
  };
}
