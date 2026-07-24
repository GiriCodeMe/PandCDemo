import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { lifeEventsService } from '../services/life-events.service';

const router = Router();

router.get('/', requireAuth, (req: Request, res: Response) => {
  const { status, employeeId, eventType } = req.query as Record<string, string>;
  const events = lifeEventsService.getAll({ status, employeeId, eventType });
  sendSuccess(res, { events, stats: lifeEventsService.getStats() });
});

router.get('/dependent-rules', requireAuth, (_req: Request, res: Response) => {
  sendSuccess(res, lifeEventsService.getDependentRules());
});

router.get('/event-types', requireAuth, (_req: Request, res: Response) => {
  sendSuccess(res, lifeEventsService.getEventTypes());
});

router.get('/stats', requireAuth, (_req: Request, res: Response) => {
  sendSuccess(res, lifeEventsService.getStats());
});

router.get('/employee/:employeeId', requireAuth, (req: Request, res: Response) => {
  const events = lifeEventsService.getByEmployee(req.params.employeeId);
  sendSuccess(res, events);
});

router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const event = lifeEventsService.getById(req.params.id);
  if (!event) {
    sendError(res, 'NOT_FOUND', 'Life event not found', 404);
    return;
  }
  sendSuccess(res, event);
});

router.post('/', requireAuth, (req: Request, res: Response) => {
  const { employeeId, eventType, eventDate } = req.body as {
    employeeId?: string;
    eventType?: string;
    eventDate?: string;
  };
  if (!employeeId || !eventType || !eventDate) {
    sendError(res, 'VALIDATION_ERROR', 'employeeId, eventType, and eventDate are required', 400);
    return;
  }
  const event = lifeEventsService.submit(employeeId, eventType, eventDate);
  res.status(201).json({ success: true, data: event, requestId: (res.locals['requestId'] as string) ?? 'unknown', timestamp: new Date().toISOString() });
});

router.put('/:id/status', requireAuth, (req: Request, res: Response) => {
  const { status } = req.body as { status?: string };
  if (!status) {
    sendError(res, 'VALIDATION_ERROR', 'status is required', 400);
    return;
  }
  const valid = ['Pending Documentation', 'Submitted', 'Approved', 'Completed', 'Rejected'];
  if (!valid.includes(status)) {
    sendError(res, 'VALIDATION_ERROR', `status must be one of: ${valid.join(', ')}`, 400);
    return;
  }
  const updated = lifeEventsService.updateStatus(req.params.id, status);
  if (!updated) {
    sendError(res, 'NOT_FOUND', 'Life event not found', 404);
    return;
  }
  sendSuccess(res, updated);
});

router.post('/:id/documents', requireAuth, (req: Request, res: Response) => {
  const { documentName } = req.body as { documentName?: string };
  if (!documentName) {
    sendError(res, 'VALIDATION_ERROR', 'documentName is required', 400);
    return;
  }
  const updated = lifeEventsService.submitDocument(req.params.id, documentName);
  if (!updated) {
    sendError(res, 'NOT_FOUND', 'Life event not found', 404);
    return;
  }
  sendSuccess(res, updated);
});

export default router;
