import { z } from 'zod';
import { isMcqSection } from '../utils/questionTypes.js';

export const difficultySchema = z.enum(['easy', 'medium', 'hard']);

export const questionSchema = z.object({
  question: z.string().min(1),
  difficulty: difficultySchema,
  marks: z.number().positive(),
  options: z.array(z.string().min(1)).min(4).max(6).optional(),
});

export const sectionSchema = z
  .object({
    title: z.string().min(1),
    instruction: z.string().min(1),
    questions: z.array(questionSchema).min(1),
  })
  .superRefine((section, ctx) => {
    if (!isMcqSection(section.title)) return;
    section.questions.forEach((q, i) => {
      if (!q.options || q.options.length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['questions', i, 'options'],
          message: 'MCQ questions must have at least 4 options',
        });
      }
    });
  });

export const questionPaperSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  totalMarks: z.number().positive(),
  duration: z.string().min(1),
  sections: z.array(sectionSchema).min(1),
});

export type QuestionPaper = z.infer<typeof questionPaperSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Section = z.infer<typeof sectionSchema>;
