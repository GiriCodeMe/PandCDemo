import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { notificationsService } from '../services/notifications.service';

const router = Router();

router.get('/stats', requireAuth, (_req: Request, res: Response) => {
  sendSuccess(res, notificationsService.getStats());
});

router.get('/templates', requireAuth, (req: Request, res: Response) => {
  const { category, channel } = req.query as Record<string, string>;
  sendSuccess(res, notificationsService.getTemplates({ category, channel }));
});

router.get('/templates/:id', requireAuth, (req: Request, res: Response) => {
  const tpl = notificationsService.getTemplateById(req.params.id);
  if (!tpl) {
    sendError(res, 'NOT_FOUND', 'Template not found', 404);
    return;
  }
  sendSuccess(res, tpl);
});

router.get('/', requireAuth, (req: Request, res: Response) => {
  const { status, category, employeeId } = req.query as Record<string, string>;
  sendSuccess(res, notificationsService.getNotifications({ status, category, employeeId }));
});

export default router;
