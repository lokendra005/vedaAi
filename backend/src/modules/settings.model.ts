import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  schoolName: string;
  schoolLocation: string;
  defaultGrade: string;
  defaultMarksPerQuestion: number;
  defaultDifficulty: { easy: number; medium: number; hard: number };
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, default: 'default', unique: true },
    schoolName: { type: String, default: 'Delhi Public School, Sector-4, Bokaro' },
    schoolLocation: { type: String, default: 'Bokaro Steel City' },
    defaultGrade: { type: String, default: '8' },
    defaultMarksPerQuestion: { type: Number, default: 2, min: 1 },
    defaultDifficulty: {
      easy: { type: Number, default: 40 },
      medium: { type: Number, default: 40 },
      hard: { type: Number, default: 20 },
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);

export async function getOrCreateSettings(): Promise<ISettings> {
  let doc = await Settings.findOne({ key: 'default' });
  if (!doc) {
    doc = await Settings.create({ key: 'default' });
  }
  return doc;
}
