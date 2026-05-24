import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  grade: string;
  section: string;
  description?: string;
  studentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    studentCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Group = mongoose.model<IGroup>('Group', groupSchema);
