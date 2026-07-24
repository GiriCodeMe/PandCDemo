import { Request, Response, NextFunction } from 'express';
import { getStore } from '../db/FileStore';
import { sendError } from '../utils/apiResponse';
import { env } from '../config/env';
import { Persona } from '../db/schema';

export interface AuthRequest extends Request {
  persona?: Persona;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  if (env.AUTH_MODE !== 'mock') {
    sendError(res, 'AUTH_NOT_CONFIGURED', 'Only mock auth is supported in Phase 0', 501);
    return;
  }
  const header = req.headers.authorization;
  let personaId = 'P-001';
  if (header?.startsWith('Bearer ')) {
    personaId = header.slice(7).trim();
  }
  const persona = getStore().findOne<Persona & Record<string,unknown>>('auth/personas', 'personaId', personaId);
  if (!persona) {
    sendError(res, 'PERSONA_NOT_FOUND', 'Persona ' + personaId + ' not found', 401);
    return;
  }
  req.persona = persona as Persona;
  next();
}
