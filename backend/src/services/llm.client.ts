import OpenAI from 'openai';
import { env } from '../config/env.js';

let client: OpenAI | null = null;

export function getLlmClient(): OpenAI | null {
  if (client) return client;

  if (env.llmProvider === 'groq') {
    if (!env.groqApiKey) return null;
    client = new OpenAI({
      apiKey: env.groqApiKey,
      baseURL: env.groqBaseUrl,
      timeout: env.llmTimeoutMs,
      maxRetries: 0,
    });
    return client;
  }

  if (env.llmProvider === 'grok') {
    if (!env.xaiApiKey) return null;
    client = new OpenAI({
      apiKey: env.xaiApiKey,
      baseURL: env.xaiBaseUrl,
      timeout: env.llmTimeoutMs,
      maxRetries: 0,
    });
    return client;
  }

  if (!env.openaiApiKey) return null;
  client = new OpenAI({
    apiKey: env.openaiApiKey,
    timeout: env.llmTimeoutMs,
    maxRetries: 0,
  });
  return client;
}

export function getLlmModel(): string {
  switch (env.llmProvider) {
    case 'groq':
      return env.groqModel;
    case 'grok':
      return env.xaiModel;
    default:
      return env.openaiModel;
  }
}

export function getLlmProviderLabel(): string {
  switch (env.llmProvider) {
    case 'groq':
      return 'Groq';
    case 'grok':
      return 'Grok (xAI)';
    default:
      return 'OpenAI';
  }
}

export function resetLlmClient(): void {
  client = null;
}
