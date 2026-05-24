import type { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';
import { Assignment } from '../modules/assignment.model.js';
import type { QuestionType } from '../types/assignment.js';
import { GeneratedPaper } from '../modules/generatedPaper.model.js';
import { JobStatus } from '../modules/jobStatus.model.js';
import { createAssignmentSchema, regenerateSchema } from '../validators/assignment.validator.js';
import { getGenerationQueue } from '../queues/generation.queue.js';
import { extractTextFromFile } from '../middlewares/upload.js';
import { generatePdfBuffer } from '../services/pdf.service.js';

export async function createAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const body = { ...req.body };
    if (typeof body.questionTypes === 'string') {
      body.questionTypes = JSON.parse(body.questionTypes);
    }
    if (typeof body.difficulty === 'string') {
      body.difficulty = JSON.parse(body.difficulty);
    }
    if (typeof body.questionCounts === 'string') {
      body.questionCounts = JSON.parse(body.questionCounts);
    }
    if (typeof body.questionMarks === 'string') {
      body.questionMarks = JSON.parse(body.questionMarks);
    }

    const parsed = createAssignmentSchema.parse({
      ...body,
      totalQuestions: body.totalQuestions ? Number(body.totalQuestions) : undefined,
      marksPerQuestion: Number(body.marksPerQuestion),
    });

    let documentContext = parsed.documentContext;
    if (req.file) {
      documentContext = extractTextFromFile(req.file.buffer, req.file.mimetype);
    }

    const assignment = await Assignment.create({
      ...parsed,
      questionTypes: parsed.questionTypes as QuestionType[],
      dueDate: new Date(parsed.dueDate),
      instructions: parsed.instructions
        ? sanitizeHtml(parsed.instructions, { allowedTags: [], allowedAttributes: {} })
        : undefined,
      documentContext,
      fileName: req.file?.originalname,
      status: 'queued',
    });

    await JobStatus.create({
      assignmentId: assignment._id,
      progress: 0,
      state: 'queued',
    });

    const queue = getGenerationQueue();
    await queue.add('generate', { assignmentId: assignment._id.toString() });

    res.status(201).json({
      success: true,
      data: { assignment, wsUrl: `/ws?assignmentId=${assignment._id}` },
    });
  } catch (err) {
    next(err);
  }
}

export async function listAssignments(_req: Request, res: Response, next: NextFunction) {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
}

export async function getAssignment(req: Request, res: Response, next: NextFunction) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Not found' });

    const paper = await GeneratedPaper.findOne({ assignmentId: assignment._id }).sort({
      generatedAt: -1,
    });
    const jobStatus = await JobStatus.findOne({ assignmentId: assignment._id });

    res.json({
      success: true,
      data: { assignment, paper: paper?.paperData, paperId: paper?._id, jobStatus },
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const jobStatus = await JobStatus.findOne({ assignmentId: req.params.id });
    res.json({ success: true, data: jobStatus });
  } catch (err) {
    next(err);
  }
}

export async function regenerate(req: Request, res: Response, next: NextFunction) {
  try {
    const { scope, sectionTitle } = regenerateSchema.parse(req.body);
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Not found' });

    await Assignment.findByIdAndUpdate(assignment._id, { status: 'queued' });
    const queue = getGenerationQueue();
    await queue.add('regenerate', {
      assignmentId: assignment._id.toString(),
      regenerate: true,
      sectionTitle: scope === 'section' ? sectionTitle : undefined,
    });

    res.json({ success: true, message: 'Regeneration queued' });
  } catch (err) {
    next(err);
  }
}

export async function exportPdf(req: Request, res: Response, next: NextFunction) {
  try {
    const paper = await GeneratedPaper.findOne({ assignmentId: req.params.id }).sort({
      generatedAt: -1,
    });
    if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' });

    const assignment = await Assignment.findById(req.params.id);
    const { getOrCreateSettings } = await import('../modules/settings.model.js');
    const teacherSettings = await getOrCreateSettings();
    const buffer = await generatePdfBuffer(paper.paperData, {
      school: teacherSettings.schoolName,
      className: assignment?.grade,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${paper.paperData.title.replace(/\s+/g, '_')}.pdf"`
    );
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}
