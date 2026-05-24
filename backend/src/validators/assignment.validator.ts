import { z } from 'zod';

const difficultySchema = z
  .object({
    easy: z.number().min(0).max(100),
    medium: z.number().min(0).max(100),
    hard: z.number().min(0).max(100),
  })
  .refine((d) => d.easy + d.medium + d.hard === 100, {
    message: 'Difficulty distribution must sum to 100%',
  });

const questionCountsSchema = z.record(z.string(), z.number().int().positive().max(50));

export const createAssignmentSchema = z
  .object({
    title: z.string().min(1).max(200),
    subject: z.string().min(1).max(100),
    grade: z.string().max(50).optional(),
    dueDate: z.string().refine((d) => new Date(d) > new Date(), {
      message: 'Due date must be in the future',
    }),
    questionTypes: z.array(z.string()).min(1),
    questionCounts: questionCountsSchema.optional(),
    questionMarks: z.record(z.string(), z.number().int().positive().max(100)).optional(),
    totalQuestions: z.number().int().positive().max(100).optional(),
    marksPerQuestion: z.number().positive().max(100),
    difficulty: difficultySchema,
    instructions: z.string().max(5000).optional(),
    documentContext: z.string().max(50000).optional(),
  })
  .transform((data) => {
    const types = data.questionTypes;
    let counts = data.questionCounts || {};
    let marks = data.questionMarks || {};

    for (const t of types) {
      if (!counts[t] || counts[t] < 1) {
        counts = { ...counts, [t]: counts[t] || 3 };
      }
      if (!marks[t] || marks[t] < 1) {
        marks = { ...marks, [t]: data.marksPerQuestion || 2 };
      }
    }

    for (const key of Object.keys(counts)) {
      if (!types.includes(key)) delete counts[key];
    }
    for (const key of Object.keys(marks)) {
      if (!types.includes(key)) delete marks[key];
    }

    const totalQuestions =
      data.totalQuestions ||
      types.reduce((sum, t) => sum + (counts[t] || 0), 0);

    return {
      ...data,
      questionCounts: counts,
      questionMarks: marks,
      totalQuestions,
      questionTypes: types,
    };
  });

export const regenerateSchema = z
  .object({
    scope: z.enum(['full', 'section']),
    sectionTitle: z.string().optional(),
  })
  .refine((d) => d.scope !== 'section' || !!d.sectionTitle, {
    message: 'sectionTitle required for section regeneration',
  });
