import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  console.error('[Error]', message);
  res.status(500).json({ success: false, message });
}
