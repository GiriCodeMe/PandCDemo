import { Router } from 'express';
import { authService } from '../services/auth.service';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = Router();

// GET /api/auth/personas — list all personas for persona switcher
router.get('/personas', (_req, res) => {
  sendSuccess(res, authService.getAllPersonas());
});

// POST /api/auth/login — switch persona (mock: body { personaId })
router.post('/login', (req, res) => {
  const { personaId } = req.body as { personaId?: string };
  if (!personaId) {
    sendError(res, 'MISSING_PERSONA_ID', 'personaId is required', 400);
    return;
  }
  const result = authService.login(personaId);
  if (!result) {
    sendError(res, 'PERSONA_NOT_FOUND', 'Persona ' + personaId + ' not found', 404);
    return;
  }
  sendSuccess(res, result);
});

// GET /api/auth/me — current persona
router.get('/me', requireAuth, (req: AuthRequest, res) => {
  sendSuccess(res, req.persona);
});

export default router;
