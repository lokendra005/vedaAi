import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { env, validateStartupConfig } from './config/env.js';
import { getLlmProviderLabel } from './services/llm.client.js';
import { smokeTestLlm } from './services/ai.service.js';
import { initWebSocket } from './websocket/manager.js';
import { startGenerationWorker } from './workers/generation.worker.js';
import { upload } from './middlewares/upload.js';
import { errorHandler } from './middlewares/errorHandler.js';
import {
  createAssignment,
  listAssignments,
  getAssignment,
  getJobStatus,
  regenerate,
  exportPdf,
} from './controllers/assignment.controller.js';
import { listGroups, createGroup, deleteGroup } from './controllers/group.controller.js';
import { getSettings, updateSettings } from './controllers/settings.controller.js';

const app = express();
const server = createServer(app);

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', async (_req, res) => {
  const config = validateStartupConfig();
  let llmReachable: boolean | null = null;
  let llmMessage: string | undefined;

  if (!env.mockAi) {
    const smoke = await smokeTestLlm();
    llmReachable = smoke.ok;
    llmMessage = smoke.message;
  }

  res.json({
    status: config.ok ? 'ok' : 'degraded',
    mockAi: env.mockAi,
    llmProvider: env.llmProvider,
    llmLabel: getLlmProviderLabel(),
    model:
      env.llmProvider === 'groq'
        ? env.groqModel
        : env.llmProvider === 'grok'
          ? env.xaiModel
          : env.openaiModel,
    llmReachable,
    llmMessage,
    configWarnings: config.warnings,
    configErrors: config.errors,
  });
});

app.get('/api/assignments', listAssignments);
app.get('/api/assignments/:id', getAssignment);
app.get('/api/assignments/:id/status', getJobStatus);
app.get('/api/assignments/:id/pdf', exportPdf);
app.post('/api/assignments', upload.single('file'), createAssignment);
app.post('/api/assignments/:id/regenerate', regenerate);

app.get('/api/groups', listGroups);
app.post('/api/groups', createGroup);
app.delete('/api/groups/:id', deleteGroup);

app.get('/api/settings', getSettings);
app.put('/api/settings', updateSettings);

app.use(errorHandler);

initWebSocket(server);

async function bootstrap() {
  const config = validateStartupConfig();
  for (const w of config.warnings) console.warn(`[Config] ${w}`);
  for (const e of config.errors) console.error(`[Config] ${e}`);
  if (!config.ok) {
    console.error('Fatal config errors — fix .env before running in production.');
    if (env.nodeEnv === 'production') process.exit(1);
  }

  await mongoose.connect(env.mongodbUri);
  console.log('MongoDB connected');

  startGenerationWorker();
  console.log('BullMQ worker started');

  if (!env.mockAi) {
    const smoke = await smokeTestLlm();
    if (smoke.ok) {
      console.log(`LLM smoke test OK (${getLlmProviderLabel()} / ${smoke.model})`);
    } else {
      console.error(`LLM smoke test FAILED: ${smoke.message}`);
    }
  }

  server.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
    console.log(`WebSocket: ws://localhost:${env.port}/ws`);
    if (env.mockAi) {
      console.log('AI mode: MOCK — set MOCK_AI=false and a valid API key');
    } else {
      const model =
        env.llmProvider === 'groq'
          ? env.groqModel
          : env.llmProvider === 'grok'
            ? env.xaiModel
            : env.openaiModel;
      console.log(`AI mode: ${getLlmProviderLabel()} (${model})`);
    }
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
