import { Queue } from 'bullmq';
import { getRedis } from '../utils/redis.js';

export const GENERATION_QUEUE = 'ai-generation';

export interface GenerationJobData {
  assignmentId: string;
  regenerate?: boolean;
  sectionTitle?: string;
}

export function getGenerationQueue(): Queue<GenerationJobData> {
  return new Queue<GenerationJobData>(GENERATION_QUEUE, {
    connection: getRedis(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });
}
