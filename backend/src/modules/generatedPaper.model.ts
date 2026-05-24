import mongoose, { Schema, Document } from 'mongoose';
import type { QuestionPaper } from '../types/questionPaper.js';

export interface IGeneratedPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  paperData: QuestionPaper;
  generatedAt: Date;
}

const generatedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    paperData: { type: Schema.Types.Mixed, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const GeneratedPaper = mongoose.model<IGeneratedPaper>(
  'GeneratedPaper',
  generatedPaperSchema
);
