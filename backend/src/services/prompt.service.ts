import type { CreateAssignmentInput } from '../types/assignment.js';

const SYSTEM_PROMPT = `You are an expert curriculum designer and senior teacher with 20+ years of experience.
You create examination question papers aligned with Bloom's taxonomy.
You balance difficulty across sections, avoid duplicate questions, and ensure pedagogical quality.
You MUST respond with valid JSON only — no markdown, no code fences, no explanations.`;

function formatQuestionCountsAndMarks(input: CreateAssignmentInput): string {
  return input.questionTypes
    .map((t) => {
      const count = input.questionCounts[t] || 0;
      const marks = input.questionMarks?.[t] || input.marksPerQuestion || 2;
      return `- ${t}: exactly ${count} questions, carrying ${marks} marks each`;
    })
    .join('\n');
}

export function buildUserPrompt(input: CreateAssignmentInput): string {
  let totalMarks = 0;
  for (const type of input.questionTypes) {
    const count = input.questionCounts[type] || 0;
    const marks = input.questionMarks?.[type] || input.marksPerQuestion || 2;
    totalMarks += count * marks;
  }

  return `Create a structured question paper as JSON matching this exact schema:
{
  "title": string,
  "subject": string,
  "totalMarks": number,
  "duration": string (e.g. "45 minutes"),
  "sections": [{
    "title": string (e.g. "Section A"),
    "instruction": string,
    "questions": [{
      "question": string,
      "difficulty": "easy" | "medium" | "hard",
      "marks": number,
      "options": string[] (REQUIRED for MCQ sections only — exactly 4 options as full choice text, e.g. "Photosynthesis", "Respiration", ...)
    }]
  }]
}

Requirements:
- Subject: ${input.subject}
- Grade/Class: ${input.grade || 'General'}
- Total questions: ${input.totalQuestions}
- Total marks: ${totalMarks}
- Question counts and marks per type (MUST match exactly):
${formatQuestionCountsAndMarks(input)}
- Create one section per question type listed above with the exact question count for that type
- The questions inside each section MUST carry the exact marks specified for that question type above (e.g. every question in Section A - MCQ must have "marks": value specified above)
- Section title MUST include the question type name (e.g. "Section A - MCQ", "Section B - Short Answer")
- For MCQ / Multiple Choice sections: EVERY question MUST have an "options" array with exactly 4 distinct answer choices (complete option text, not just "A" or "B")
- For non-MCQ sections (Short Answer, Long Answer, etc.): omit the "options" field entirely
- Difficulty distribution: Easy ${input.difficulty.easy}%, Medium ${input.difficulty.medium}%, Hard ${input.difficulty.hard}%
- Each question must be unique and curriculum-appropriate
- Map difficulty labels: easy/medium/hard only
${input.instructions ? `- Teacher instructions: ${input.instructions}` : ''}
${input.documentContext ? `- Reference material context:\n${input.documentContext.slice(0, 4000)}` : ''}

Return ONLY the JSON object.`;
}

export function getSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

export function buildCacheKey(input: CreateAssignmentInput): string {
  return `prompt:${JSON.stringify({
    subject: input.subject,
    grade: input.grade,
    totalQuestions: input.totalQuestions,
    marksPerQuestion: input.marksPerQuestion,
    difficulty: input.difficulty,
    questionTypes: input.questionTypes.sort(),
    questionCounts: input.questionCounts,
    instructions: input.instructions?.slice(0, 200),
  })}`;
}
