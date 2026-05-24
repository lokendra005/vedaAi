import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getOrCreateSettings } from '../modules/settings.model.js';

const updateSettingsSchema = z.object({
  schoolName: z.string().min(1).max(200).optional(),
  schoolLocation: z.string().max(100).optional(),
  defaultGrade: z.string().max(20).optional(),
  defaultMarksPerQuestion: z.number().int().min(1).max(100).optional(),
  defaultDifficulty: z
    .object({
      easy: z.number().min(0).max(100),
      medium: z.number().min(0).max(100),
      hard: z.number().min(0).max(100),
    })
    .refine((d) => d.easy + d.medium + d.hard === 100, {
      message: 'Difficulty must sum to 100%',
    })
    .optional(),
});

export async function getSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateSettingsSchema.parse(req.body);
    const settings = await getOrCreateSettings();
    Object.assign(settings, parsed);
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}
