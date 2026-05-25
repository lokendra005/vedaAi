'use client';

import { create } from 'zustand';
import type {
  Assignment,
  AssignmentFormData,
  JobStatus,
  QuestionPaper,
  QuestionType,
  TeacherSettings,
} from '@/types';

const defaultCounts = { MCQ: 3, 'Short Answer': 4 } as const;

const defaultMarks: Record<QuestionType, number> = {
  MCQ: 1,
  'Short Answer': 2,
  'Long Answer': 5,
  'Diagram/Graph-Based': 5,
  'Fill in the Blanks': 1,
};

const defaultForm: AssignmentFormData = {
  title: '',
  subject: '',
  grade: '8',
  dueDate: '',
  questionTypes: ['MCQ', 'Short Answer'],
  questionCounts: { MCQ: 3, 'Short Answer': 4 },
  questionMarks: { MCQ: 1, 'Short Answer': 2 },
  marksPerQuestion: 2,
  difficulty: { easy: 40, medium: 40, hard: 20 },
  instructions: '',
  file: null,
};

const defaultSettings: TeacherSettings = {
  schoolName: 'Delhi Public School, Sector-4, Bokaro',
  schoolLocation: 'Bokaro Steel City',
  defaultGrade: '8',
  defaultMarksPerQuestion: 2,
  defaultDifficulty: { easy: 40, medium: 40, hard: 20 },
};

interface AppState {
  form: AssignmentFormData;
  settings: TeacherSettings;
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  paper: QuestionPaper | null;
  jobStatus: JobStatus | null;
  isLoading: boolean;
  isGenerating: boolean;
  wsConnected: boolean;
  setForm: (partial: Partial<AssignmentFormData>) => void;
  setQuestionTypes: (types: QuestionType[]) => void;
  setQuestionCount: (type: QuestionType, count: number) => void;
  setQuestionMark: (type: QuestionType, mark: number) => void;
  resetForm: () => void;
  applySettingsToForm: () => void;
  setSettings: (s: TeacherSettings) => void;
  setAssignments: (a: Assignment[]) => void;
  setCurrent: (assignment: Assignment | null, paper?: QuestionPaper | null) => void;
  setJobStatus: (status: JobStatus | null) => void;
  setLoading: (v: boolean) => void;
  setGenerating: (v: boolean) => void;
  setWsConnected: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  form: defaultForm,
  settings: defaultSettings,
  assignments: [],
  currentAssignment: null,
  paper: null,
  jobStatus: null,
  isLoading: false,
  isGenerating: false,
  wsConnected: false,
  setForm: (partial) => set((s) => ({ form: { ...s.form, ...partial } })),
  setQuestionTypes: (types) =>
    set((s) => {
      const counts = { ...s.form.questionCounts };
      const marks = { ...s.form.questionMarks };
      for (const t of types) {
        if (!counts[t]) counts[t] = 3;
        if (!marks[t]) marks[t] = defaultMarks[t] || s.settings.defaultMarksPerQuestion;
      }
      for (const key of Object.keys(counts) as QuestionType[]) {
        if (!types.includes(key)) delete counts[key];
      }
      for (const key of Object.keys(marks) as QuestionType[]) {
        if (!types.includes(key)) delete marks[key];
      }
      return { form: { ...s.form, questionTypes: types, questionCounts: counts, questionMarks: marks } };
    }),
  setQuestionCount: (type, count) =>
    set((s) => ({
      form: {
        ...s.form,
        questionCounts: { ...s.form.questionCounts, [type]: Math.max(1, Math.min(50, count)) },
      },
    })),
  setQuestionMark: (type, mark) =>
    set((s) => ({
      form: {
        ...s.form,
        questionMarks: { ...s.form.questionMarks, [type]: Math.max(1, Math.min(100, mark)) },
      },
    })),
  resetForm: () => {
    const { settings } = get();
    set({
      form: {
        ...defaultForm,
        grade: settings.defaultGrade,
        marksPerQuestion: settings.defaultMarksPerQuestion,
        difficulty: { ...settings.defaultDifficulty },
        questionCounts: { ...defaultCounts },
        questionMarks: { MCQ: 1, 'Short Answer': 2 },
      },
    });
  },
  applySettingsToForm: () => {
    const { settings, form } = get();
    set({
      form: {
        ...form,
        grade: form.grade || settings.defaultGrade,
        marksPerQuestion: settings.defaultMarksPerQuestion,
        difficulty: { ...settings.defaultDifficulty },
      },
    });
  },
  setSettings: (settings) => set({ settings }),
  setAssignments: (assignments) => set({ assignments }),
  setCurrent: (currentAssignment, paper = null) =>
    set({ currentAssignment, paper: paper ?? null }),
  setJobStatus: (jobStatus) => set({ jobStatus }),
  setLoading: (isLoading) => set({ isLoading }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
}));
