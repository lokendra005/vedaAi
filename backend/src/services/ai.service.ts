import { env } from '../config/env.js';
import { questionPaperSchema, type QuestionPaper } from '../types/questionPaper.js';
import { isMcqSection, defaultMcqOptions } from '../utils/questionTypes.js';
import type { CreateAssignmentInput } from '../types/assignment.js';
import { buildUserPrompt, getSystemPrompt } from './prompt.service.js';
import { getLlmClient, getLlmModel } from './llm.client.js';
import { withRetry, isRetryableLlmError } from '../utils/retry.js';

export type GenerationSource = 'cache' | 'ai' | 'mock' | 'mock_fallback';

export interface GenerationResult {
  paper: QuestionPaper;
  qualityScore: number;
  fromCache: boolean;
  source: GenerationSource;
  warning?: string;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('LLM returned empty response');

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  throw new Error('LLM response did not contain valid JSON object');
}

function normalizeDifficulty(value: unknown): 'easy' | 'medium' | 'hard' {
  const s = String(value).toLowerCase().trim();
  if (s.includes('easy') || s === 'low') return 'easy';
  if (s.includes('hard') || s.includes('challeng') || s === 'high') return 'hard';
  return 'medium';
}

function normalizePaper(raw: unknown): QuestionPaper {
  const obj = raw as Record<string, unknown>;
  if (!obj || typeof obj !== 'object') {
    throw new Error('Parsed JSON is not an object');
  }

  const sections = Array.isArray(obj.sections) ? obj.sections : [];
  const normalized = {
    title: String(obj.title || 'Assessment'),
    subject: String(obj.subject || 'General'),
    totalMarks: Number(obj.totalMarks) || 0,
    duration: String(obj.duration || '45 minutes'),
    sections: sections.map((sec, idx) => {
      const s = sec as Record<string, unknown>;
      const sectionTitle = String(s.title || `Section ${String.fromCharCode(65 + idx)}`);
      const mcqSection = isMcqSection(sectionTitle);
      const questions = Array.isArray(s.questions) ? s.questions : [];
      return {
        title: sectionTitle,
        instruction: String(s.instruction || 'Attempt all questions.'),
        questions: questions.map((q) => {
          const qq = q as Record<string, unknown>;
          let options: string[] | undefined;
          if (Array.isArray(qq.options)) {
            options = qq.options
              .map((o) => String(o).trim())
              .filter((o) => o.length > 0);
            if (options.length < 4) options = undefined;
          }
          const item: {
            question: string;
            difficulty: 'easy' | 'medium' | 'hard';
            marks: number;
            options?: string[];
          } = {
            question: String(qq.question || qq.text || '').trim(),
            difficulty: normalizeDifficulty(qq.difficulty),
            marks: Math.max(1, Number(qq.marks) || 1),
          };
          if (mcqSection) {
            item.options = options || defaultMcqOptions();
          }
          return item;
        }).filter((q) => q.question.length > 0),
      };
    }).filter((s) => s.questions.length > 0),
  };

  if (normalized.sections.length === 0) {
    throw new Error('No valid sections in LLM response');
  }

  if (!normalized.totalMarks) {
    normalized.totalMarks = normalized.sections.reduce(
      (sum, sec) => sum + sec.questions.reduce((s, q) => s + q.marks, 0),
      0
    );
  }

  return questionPaperSchema.parse(normalized);
}

function detectDuplicates(paper: QuestionPaper): QuestionPaper {
  const seen = new Set<string>();
  const sections = paper.sections.map((section) => ({
    ...section,
    questions: section.questions.filter((q) => {
      const key = q.question.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
  }));
  return { ...paper, sections: sections.filter((s) => s.questions.length > 0) };
}

function balanceDifficulty(
  paper: QuestionPaper,
  target: CreateAssignmentInput['difficulty']
): QuestionPaper {
  const counts = { easy: 0, medium: 0, hard: 0 };
  let total = 0;
  for (const s of paper.sections) {
    for (const q of s.questions) {
      counts[q.difficulty]++;
      total++;
    }
  }
  if (total === 0) return paper;

  const targetCounts = {
    easy: Math.round((target.easy / 100) * total),
    medium: Math.round((target.medium / 100) * total),
    hard: Math.round((target.hard / 100) * total),
  };

  const diffOrder: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  const sections = paper.sections.map((section) => ({
    ...section,
    questions: section.questions.map((q) => {
      let best: 'easy' | 'medium' | 'hard' = q.difficulty;
      let bestGap = Infinity;
      for (const d of diffOrder) {
        const gap = Math.abs(counts[d] - targetCounts[d]);
        if (gap < bestGap) {
          bestGap = gap;
          best = d;
        }
      }
      if (counts[best] > targetCounts[best]) return q;
      counts[best]++;
      counts[q.difficulty]--;
      return { ...q, difficulty: best };
    }),
  }));

  return { ...paper, sections };
}

function scoreQuality(paper: QuestionPaper): number {
  let score = 100;
  const allQuestions = paper.sections.flatMap((s) => s.questions);
  if (allQuestions.length < 3) score -= 20;
  for (const s of paper.sections) {
    for (const q of s.questions) {
      if (q.question.length < 10) score -= 5;
      if (q.marks <= 0) score -= 10;
      if (q.question.toLowerCase().includes('sample question')) score -= 15;
      if (isMcqSection(s.title) && (!q.options || q.options.length < 4)) score -= 20;
    }
  }
  return Math.max(0, score);
}

export function generateMockPaper(input: CreateAssignmentInput): QuestionPaper {
  let totalMarks = 0;
  for (const type of input.questionTypes) {
    const count = input.questionCounts[type] || 0;
    const marks = input.questionMarks?.[type] || input.marksPerQuestion || 2;
    totalMarks += count * marks;
  }
  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];

  const sections = input.questionTypes.map((type, idx) => {
    const sectionLetter = String.fromCharCode(65 + idx);
    const count = input.questionCounts[type] || 3;
    const marks = input.questionMarks?.[type] || input.marksPerQuestion || 2;
    const isMcq = type === 'MCQ';
    const questions = Array.from({ length: count }, (_, i) => {
      const diff = difficulties[i % 3];
      const base = {
        question: isMcq
          ? `Which of the following best describes concept ${i + 1} in ${input.subject}?`
          : `[${type}] Question ${i + 1} for ${input.subject} (${diff} level).`,
        difficulty: diff,
        marks: marks,
      };
      if (isMcq) {
        return {
          ...base,
          options: [
            `Choice A for question ${i + 1}`,
            `Choice B for question ${i + 1}`,
            `Choice C for question ${i + 1}`,
            `Choice D for question ${i + 1}`,
          ],
        };
      }
      return base;
    });
    return {
      title: `Section ${sectionLetter} - ${type}`,
      instruction: isMcq
        ? `Choose the correct answer. Each question carries ${marks} marks.`
        : `Attempt all ${type} questions. Each question carries ${marks} marks.`,
      questions,
    };
  });

  return {
    title: input.title || `${input.subject} Assessment`,
    subject: input.subject,
    totalMarks,
    duration: `${Math.ceil(totalMarks / 2)} minutes`,
    sections,
  };
}

async function callLlmOnce(
  input: CreateAssignmentInput,
  useJsonMode: boolean
): Promise<{ raw: string; usedJsonMode: boolean }> {
  const llm = getLlmClient();
  if (!llm) throw new Error(`${env.llmProvider} API key not configured`);

  const messages = [
    { role: 'system' as const, content: getSystemPrompt() },
    { role: 'user' as const, content: buildUserPrompt(input) },
  ];

  const baseParams = {
    model: getLlmModel(),
    temperature: 0.6,
    messages,
    max_tokens: 4096,
  };

  if (useJsonMode) {
    try {
      const response = await llm.chat.completions.create({
        ...baseParams,
        response_format: { type: 'json_object' as const },
      });
      return {
        raw: response.choices[0]?.message?.content || '',
        usedJsonMode: true,
      };
    } catch (err) {
      if (env.llmProvider === 'openai') throw err;
    }
  }

  const response = await llm.chat.completions.create(baseParams);
  return {
    raw: response.choices[0]?.message?.content || '',
    usedJsonMode: false,
  };
}

async function callLlm(input: CreateAssignmentInput): Promise<QuestionPaper> {
  return withRetry(
    async () => {
      let lastParseError: Error | null = null;

      for (const useJson of [true, false]) {
        try {
          const { raw } = await callLlmOnce(input, useJson);
          const jsonStr = extractJson(raw);
          const parsed = JSON.parse(jsonStr);
          return normalizePaper(parsed);
        } catch (err) {
          lastParseError = err instanceof Error ? err : new Error(String(err));
          if (!isRetryableLlmError(err) && useJson) continue;
          if (isRetryableLlmError(err)) throw err;
        }
      }

      throw lastParseError || new Error('Failed to parse LLM response');
    },
    { maxAttempts: env.llmMaxRetries, baseDelayMs: 1500 }
  );
}

export async function generateQuestionPaper(
  input: CreateAssignmentInput,
  options?: { cached?: QuestionPaper | null }
): Promise<GenerationResult> {
  if (options?.cached) {
    return {
      paper: options.cached,
      qualityScore: scoreQuality(options.cached),
      fromCache: true,
      source: 'cache',
    };
  }

  if (env.mockAi) {
    const paper = detectDuplicates(balanceDifficulty(generateMockPaper(input), input.difficulty));
    return {
      paper,
      qualityScore: scoreQuality(paper),
      fromCache: false,
      source: 'mock',
    };
  }

  try {
    let paper = await callLlm(input);
    paper = detectDuplicates(balanceDifficulty(paper, input.difficulty));
    const qualityScore = scoreQuality(paper);

    if (qualityScore < 40) {
      console.warn(`[LLM] Low quality score (${qualityScore}), retrying once`);
      const retryPaper = await callLlm(input);
      const balanced = detectDuplicates(balanceDifficulty(retryPaper, input.difficulty));
      const retryScore = scoreQuality(balanced);
      if (retryScore >= qualityScore) {
        return {
          paper: balanced,
          qualityScore: retryScore,
          fromCache: false,
          source: 'ai',
        };
      }
    }

    return { paper, qualityScore, fromCache: false, source: 'ai' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[LLM] Generation failed (${env.llmProvider}):`, message);

    if (!env.allowMockFallback) {
      throw new Error(`AI generation failed: ${message}`);
    }

    const paper = detectDuplicates(balanceDifficulty(generateMockPaper(input), input.difficulty));
    return {
      paper,
      qualityScore: scoreQuality(paper),
      fromCache: false,
      source: 'mock_fallback',
      warning: `AI unavailable (${message}). Returned practice paper — check API key and LLM_PROVIDER.`,
    };
  }
}

export async function regenerateSection(
  input: CreateAssignmentInput,
  sectionTitle: string,
  existingPaper: QuestionPaper
): Promise<QuestionPaper> {
  const partialInput = {
    ...input,
    totalQuestions: Math.max(3, Math.ceil(input.totalQuestions / existingPaper.sections.length)),
    instructions: `${input.instructions || ''}\nRegenerate only section "${sectionTitle}". Keep other sections unchanged in structure.`,
  };

  const { paper: newPaper } = await generateQuestionPaper(partialInput);
  const newSection =
    newPaper.sections.find((s) => s.title.toLowerCase() === sectionTitle.toLowerCase()) ||
    newPaper.sections[0];

  return {
    ...existingPaper,
    sections: existingPaper.sections.map((s) =>
      s.title === sectionTitle ? newSection : s
    ),
  };
}

/** Direct LLM smoke test (used by scripts/test-llm.ts) */
export async function smokeTestLlm(): Promise<{
  ok: boolean;
  provider: string;
  model: string;
  message: string;
}> {
  if (env.mockAi) {
    return { ok: false, provider: env.llmProvider, model: getLlmModel(), message: 'MOCK_AI is enabled' };
  }

  const llm = getLlmClient();
  if (!llm) {
    return { ok: false, provider: env.llmProvider, model: getLlmModel(), message: 'No API client' };
  }

  try {
    const useJsonFormat = env.llmProvider === 'openai' || env.llmProvider === 'groq';
    const res = await llm.chat.completions.create({
      model: getLlmModel(),
      messages: [
        {
          role: 'system',
          content: 'You respond only with valid JSON objects.',
        },
        {
          role: 'user',
          content: 'Return a json object: {"ok": true}',
        },
      ],
      max_tokens: 64,
      temperature: 0,
      ...(useJsonFormat ? { response_format: { type: 'json_object' as const } } : {}),
    });
    const text = res.choices[0]?.message?.content || '';
    return {
      ok: text.includes('ok'),
      provider: env.llmProvider,
      model: getLlmModel(),
      message: 'API reachable',
    };
  } catch (err) {
    return {
      ok: false,
      provider: env.llmProvider,
      model: getLlmModel(),
      message: err instanceof Error ? err.message : String(err),
    };
  }
}
