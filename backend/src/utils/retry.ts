export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableLlmError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { status?: number; code?: string; message?: string };
  if (e.status === 429 || e.status === 502 || e.status === 503 || e.status === 504) {
    return true;
  }
  const msg = (e.message || '').toLowerCase();
  return (
    msg.includes('rate limit') ||
    msg.includes('timeout') ||
    msg.includes('overloaded') ||
    msg.includes('econnreset')
  );
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts: number; baseDelayMs?: number }
): Promise<T> {
  const { maxAttempts, baseDelayMs = 1000 } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt >= maxAttempts || !isRetryableLlmError(err)) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[LLM] Retry ${attempt}/${maxAttempts} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}
