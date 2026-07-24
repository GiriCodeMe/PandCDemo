import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { integrationsService } from '../services/integrations.service';

const router = Router();

router.get('/stats', requireAuth, (_req: Request, res: Response) => {
  sendSuccess(res, integrationsService.getStats());
});

router.get('/exceptions', requireAuth, (_req: Request, res: Response) => {
  sendSuccess(res, integrationsService.getExceptions());
});

router.get('/carriers', requireAuth, (_req: Request, res: Response) => {
  sendSuccess(res, integrationsService.getCarriers());
});

router.get('/carriers/:id', requireAuth, (req: Request, res: Response) => {
  const carrier = integrationsService.getCarrierById(req.params.id);
  if (!carrier) {
    sendError(res, 404, 'NOT_FOUND', 'Carrier not found');
    return;
  }
  sendSuccess(res, carrier);
});

router.get('/carrier-transactions', requireAuth, (req: Request, res: Response) => {
  const { carrierId, status, employeeId, transactionType } = req.query as Record<string, string>;
  sendSuccess(res, integrationsService.getCarrierTransactions({ carrierId, status, employeeId, transactionType }));
});

router.get('/payroll-transactions', requireAuth, (req: Request, res: Response) => {
  const { employeeId, reconciliationStatus } = req.query as Record<string, string>;
  sendSuccess(res, integrationsService.getPayrollTransactions({ employeeId, reconciliationStatus }));
});

export default router;
