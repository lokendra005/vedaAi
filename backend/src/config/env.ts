import dotenv from 'dotenv';
dotenv.config();

export type LlmProvider = 'openai' | 'grok' | 'groq';

const openaiApiKey = process.env.OPENAI_API_KEY?.trim() || '';
const groqApiKey = (
  process.env.GROQ_API_KEY ||
  process.env.GROK_API_KEY ||
  ''
).trim();
const xaiApiKey = (process.env.XAI_API_KEY || '').trim();

/** Auto-detect provider from key prefix when LLM_PROVIDER not set */
function detectProviderFromKeys(): LlmProvider | null {
  if (groqApiKey.startsWith('gsk_')) return 'groq';
  if (xaiApiKey.startsWith('xai-') || groqApiKey.startsWith('xai-')) return 'grok';
  if (openaiApiKey.startsWith('sk-')) return 'openai';
  return null;
}

function resolveProvider(): LlmProvider {
  const explicit = (process.env.LLM_PROVIDER || '').toLowerCase();
  if (explicit === 'groq' || explicit === 'grok' || explicit === 'openai') {
    return explicit;
  }
  return detectProviderFromKeys() || 'openai';
}

const llmProvider = resolveProvider();

function getActiveApiKey(): string {
  if (llmProvider === 'groq') return groqApiKey;
  if (llmProvider === 'grok') return xaiApiKey || (groqApiKey.startsWith('xai-') ? groqApiKey : '');
  return openaiApiKey;
}

function hasLlmKey(): boolean {
  return getActiveApiKey().length > 0;
}

function resolveMockAi(): boolean {
  if (process.env.MOCK_AI === 'true') return true;
  if (process.env.MOCK_AI === 'false') return false;
  return !hasLlmKey();
}

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  llmProvider,
  openaiApiKey,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  groqApiKey,
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  groqBaseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  xaiApiKey: xaiApiKey || (groqApiKey.startsWith('xai-') ? groqApiKey : ''),
  xaiModel: process.env.XAI_MODEL || process.env.GROK_MODEL || 'grok-4-1-fast-non-reasoning',
  xaiBaseUrl: process.env.XAI_BASE_URL || 'https://api.x.ai/v1',
  llmTimeoutMs: parseInt(process.env.LLM_TIMEOUT_MS || '120000', 10),
  llmMaxRetries: parseInt(process.env.LLM_MAX_RETRIES || '3', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  queueConcurrency: parseInt(process.env.QUEUE_CONCURRENCY || '2', 10),
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
  mockAi: resolveMockAi(),
  allowMockFallback: process.env.ALLOW_MOCK_FALLBACK !== 'false',
};

export function validateStartupConfig(): { ok: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (env.mockAi) {
    warnings.push('MOCK_AI is active — papers will not call a real LLM.');
  }

  if (!env.mockAi) {
    const key = getActiveApiKey();
    if (!key) {
      errors.push(`No API key for provider "${env.llmProvider}".`);
    } else if (env.llmProvider === 'groq' && !key.startsWith('gsk_')) {
      warnings.push('Groq keys usually start with gsk_. Check GROQ_API_KEY.');
    } else if (env.llmProvider === 'grok' && !key.startsWith('xai-')) {
      warnings.push('xAI Grok keys usually start with xai-. You may have a Groq (gsk_) key — set LLM_PROVIDER=groq.');
    }
  }

  if (groqApiKey.startsWith('gsk_') && env.llmProvider === 'grok') {
    warnings.push('Key looks like Groq (gsk_) but LLM_PROVIDER=grok. Use LLM_PROVIDER=groq.');
  }

  return { ok: errors.length === 0, warnings, errors };
}
