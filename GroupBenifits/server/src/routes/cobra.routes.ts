import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { cobraService } from '../services/cobra.service';

const router = Router();

router.get('/stats', requireAuth, (_req: Request, res: Response) => {
  sendSuccess(res, cobraService.getStats());
});

router.get('/alerts', requireAuth, (_req: Request, res: Response) => {
  sendSuccess(res, cobraService.getComplianceAlerts());
});

router.get('/audit-log', requireAuth, (req: Request, res: Response) => {
  const { eventType, employeeId } = req.query as Record<string, string>;
  sendSuccess(res, cobraService.getAuditLog({ eventType, employeeId }));
});

router.get('/employee/:employeeId', requireAuth, (req: Request, res: Response) => {
  sendSuccess(res, cobraService.getByEmployee(req.params.employeeId));
});

router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const event = cobraService.getById(req.params.id);
  if (!event) {
    sendError(res, 'NOT_FOUND', 'COBRA event not found', 404);
    return;
  }
  sendSuccess(res, event);
});

router.get('/', requireAuth, (req: Request, res: Response) => {
  const { electionStatus } = req.query as Record<string, string>;
  sendSuccess(res, cobraService.getAll({ electionStatus }));
});

export default router;
