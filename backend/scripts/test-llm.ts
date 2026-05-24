/**
 * LLM integration test — run: npm run test:llm
 * Does not print API keys.
 */
import { env, validateStartupConfig } from '../src/config/env.js';
import { smokeTestLlm, generateQuestionPaper } from '../src/services/ai.service.js';
import { getLlmModel, getLlmProviderLabel } from '../src/services/llm.client.js';

async function main() {
  console.log('=== VedaAI LLM Test ===\n');
  const config = validateStartupConfig();
  console.log('Provider:', env.llmProvider, `(${getLlmProviderLabel()})`);
  console.log('Model:', getLlmModel());
  console.log('Mock AI:', env.mockAi);
  if (config.warnings.length) console.log('Warnings:', config.warnings.join('; '));
  if (config.errors.length) {
    console.error('Errors:', config.errors.join('; '));
    process.exit(1);
  }

  console.log('\n1) Smoke test...');
  const smoke = await smokeTestLlm();
  console.log(smoke.ok ? '✓ PASS' : '✗ FAIL', smoke.message);
  if (!smoke.ok) process.exit(1);

  console.log('\n2) Full question paper generation...');
  const start = Date.now();
  const result = await generateQuestionPaper({
    title: 'Integration Test',
    subject: 'Mathematics',
    grade: '9',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    questionTypes: ['MCQ', 'Short Answer'],
    questionCounts: { MCQ: 2, 'Short Answer': 2 },
    totalQuestions: 4,
    marksPerQuestion: 2,
    difficulty: { easy: 50, medium: 30, hard: 20 },
    instructions: 'Keep questions concise for testing.',
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`✓ Generated in ${elapsed}s`);
  console.log('  Source:', result.source);
  console.log('  Quality:', result.qualityScore);
  if (result.warning) console.log('  Warning:', result.warning);
  console.log('  Title:', result.paper.title);
  console.log('  Sections:', result.paper.sections.length);
  console.log(
    '  Questions:',
    result.paper.sections.reduce((n, s) => n + s.questions.length, 0)
  );

  const isMock =
    result.source === 'mock' ||
    result.source === 'mock_fallback' ||
    result.paper.sections.some((s) =>
      s.questions.some((q) => q.question.includes('Sample question'))
    );

  if (isMock && !env.mockAi) {
    console.error('\n✗ FAIL: Expected real AI output but got mock/sample content');
    process.exit(1);
  }

  console.log('\n=== All tests passed ===');
}

main().catch((err) => {
  console.error('\n✗ Test failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
