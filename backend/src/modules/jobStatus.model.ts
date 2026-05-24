import mongoose, { Schema, Document } from 'mongoose';

export interface IJobStatus extends Document {
  assignmentId: mongoose.Types.ObjectId;
  progress: number;
  state: string;
  error?: string;
}

const jobStatusSchema = new Schema<IJobStatus>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, unique: true },
    progress: { type: Number, default: 0 },
    state: { type: String, default: 'idle' },
    error: String,
  },
  { timestamps: true }
);

export const JobStatus = mongoose.model<IJobStatus>('JobStatus', jobStatusSchema);
