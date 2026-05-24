import { Worker, Job } from 'bullmq';
import mongoose from 'mongoose';
import { getRedis, cacheGet, cacheSet } from '../utils/redis.js';
import { GENERATION_QUEUE, type GenerationJobData } from '../queues/generation.queue.js';
import { Assignment } from '../modules/assignment.model.js';
import { GeneratedPaper } from '../modules/generatedPaper.model.js';
import { JobStatus } from '../modules/jobStatus.model.js';
import { generateQuestionPaper, regenerateSection } from '../services/ai.service.js';
import { buildCacheKey } from '../services/prompt.service.js';
import { broadcast } from '../websocket/manager.js';
import { env } from '../config/env.js';
import type { CreateAssignmentInput } from '../types/assignment.js';

async function updateProgress(assignmentId: string, progress: number, state: string, error?: string) {
  await JobStatus.findOneAndUpdate(
    { assignmentId: new mongoose.Types.ObjectId(assignmentId) },
    { progress, state, error },
    { upsert: true }
  );
  broadcast(assignmentId, 'generation_progress', { assignmentId, progress, state, error });
}

export function startGenerationWorker(): Worker<GenerationJobData> {
  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE,
    async (job: Job<GenerationJobData>) => {
      const { assignmentId, regenerate, sectionTitle } = job.data;
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error('Assignment not found');

      broadcast(assignmentId, 'generation_started', { assignmentId, state: 'started' });
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'generating' });
      await updateProgress(assignmentId, 10, 'building_prompt');

      const questionCounts = (assignment.questionCounts || {}) as CreateAssignmentInput['questionCounts'];
      const questionMarks = (assignment.questionMarks || {}) as CreateAssignmentInput['questionMarks'];
      const input: CreateAssignmentInput = {
        title: assignment.title,
        subject: assignment.subject,
        grade: assignment.grade,
        dueDate: assignment.dueDate.toISOString(),
        questionTypes: assignment.questionTypes,
        questionCounts,
        questionMarks,
        totalQuestions: assignment.totalQuestions,
        marksPerQuestion: assignment.marksPerQuestion,
        difficulty: assignment.difficulty,
        instructions: assignment.instructions,
        documentContext: assignment.documentContext,
      };

      const cacheKey = buildCacheKey(input);
      let cached = regenerate ? null : await cacheGet<import('../types/questionPaper.js').QuestionPaper>(cacheKey);

      await updateProgress(assignmentId, 30, 'calling_ai');
      job.updateProgress(30);

      let paper;
      if (regenerate && sectionTitle) {
        const existing = await GeneratedPaper.findOne({ assignmentId }).sort({ generatedAt: -1 });
        if (!existing) throw new Error('No existing paper to regenerate section');
        await updateProgress(assignmentId, 50, 'regenerating_section');
        paper = await regenerateSection(input, sectionTitle, existing.paperData);
      } else {
        const result = await generateQuestionPaper(input, { cached });
        paper = result.paper;

        if (result.source === 'mock_fallback') {
          console.warn(`[Worker] ${result.warning}`);
          await updateProgress(assignmentId, 75, 'fallback_mock', result.warning);
        }

        if (result.source === 'ai' && !result.fromCache) {
          await cacheSet(cacheKey, paper);
        }
      }

      await updateProgress(assignmentId, 80, 'validating');
      job.updateProgress(80);

      const saved = await GeneratedPaper.findOneAndUpdate(
        { assignmentId: new mongoose.Types.ObjectId(assignmentId) },
        { paperData: paper, generatedAt: new Date() },
        { upsert: true, new: true }
      );

      await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });
      await updateProgress(assignmentId, 100, 'completed');

      broadcast(assignmentId, 'generation_completed', {
        assignmentId,
        progress: 100,
        state: 'completed',
        paperId: saved._id.toString(),
      });

      return { paperId: saved._id.toString() };
    },
    {
      connection: getRedis(),
      concurrency: env.queueConcurrency,
    }
  );

  worker.on('failed', async (job, err) => {
    if (!job?.data?.assignmentId) return;
    const assignmentId = job.data.assignmentId;
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
    await updateProgress(assignmentId, 0, 'failed', err.message);
    broadcast(assignmentId, 'generation_failed', {
      assignmentId,
      state: 'failed',
      error: err.message,
    });
  });

  return worker;
}
