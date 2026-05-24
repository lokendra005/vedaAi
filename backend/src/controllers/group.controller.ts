import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Group } from '../modules/group.model.js';

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  grade: z.string().min(1).max(20),
  section: z.string().min(1).max(20),
  description: z.string().max(500).optional(),
  studentCount: z.number().int().min(0).max(500).optional(),
});

export async function listGroups(_req: Request, res: Response, next: NextFunction) {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json({ success: true, data: groups });
  } catch (err) {
    next(err);
  }
}

export async function createGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createGroupSchema.parse(req.body);
    const group = await Group.create({
      ...parsed,
      studentCount: parsed.studentCount ?? 0,
    });
    res.status(201).json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
}

export async function deleteGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await Group.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, message: 'Group deleted' });
  } catch (err) {
    next(err);
  }
}
