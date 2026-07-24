import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({
    success: true,
    data,
    requestId: (res.locals['requestId'] as string) ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>,
  retryable = false,
): void {
  const body: Record<string, unknown> = {
    success: false,
    error: {
      code,
      message,
      requestId: (res.locals['requestId'] as string) ?? 'unknown',
      timestamp: new Date().toISOString(),
      retryable,
    },
  };
  if (details) (body['error'] as Record<string, unknown>)['details'] = details;
  res.status(status).json(body);
}
