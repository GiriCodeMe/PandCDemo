import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[ERROR]', err.message);
  if (!res.headersSent) {
    sendError(res, 'INTERNAL_ERROR', 'An unexpected error occurred', 500, undefined, true);
  }
}

export function notFound(_req: Request, res: Response): void {
  sendError(res, 'NOT_FOUND', 'Route not found', 404);
}
