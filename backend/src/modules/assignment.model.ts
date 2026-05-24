import mongoose, { Schema, Document } from 'mongoose';
import type { AssignmentStatus, DifficultyDistribution, QuestionType } from '../types/assignment.js';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade?: string;
  dueDate: Date;
  questionTypes: QuestionType[];
  questionCounts: Record<string, number>;
  questionMarks: Record<string, number>;
  totalQuestions: number;
  marksPerQuestion: number;
  difficulty: DifficultyDistribution;
  instructions?: string;
  documentContext?: string;
  fileName?: string;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    grade: String,
    dueDate: { type: Date, required: true },
    questionTypes: [{ type: String, required: true }],
    questionCounts: { type: Schema.Types.Mixed, required: true },
    questionMarks: { type: Schema.Types.Mixed, required: true },
    totalQuestions: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 1 },
    difficulty: {
      easy: { type: Number, required: true },
      medium: { type: Number, required: true },
      hard: { type: Number, required: true },
    },
    instructions: String,
    documentContext: String,
    fileName: String,
    status: {
      type: String,
      enum: ['draft', 'queued', 'generating', 'completed', 'failed'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
