import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { enrollmentService } from '../services/enrollment.service';

const router = Router();

router.get('/open-period', requireAuth, (req: Request, res: Response) => {
  const employerId = (req.query.employerId as string) ?? 'ACM-001';
  const period = enrollmentService.getOpenPeriod(employerId);
  if (!period) {
    sendError(res, 404, 'NOT_FOUND', 'No open enrollment period found');
    return;
  }
  sendSuccess(res, period);
});

router.get('/plans', requireAuth, (_req: Request, res: Response) => {
  const plans = enrollmentService.getPlansForEnrollment();
  const rates = enrollmentService.getAllRates();
  sendSuccess(res, { plans, rates });
});

router.get('/employee/:employeeId', requireAuth, (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const enrollment = enrollmentService.getByEmployeeId(employeeId);
  if (!enrollment) {
    sendSuccess(res, null);
    return;
  }
  const rates = enrollmentService.getAllRates();
  const premiumSummary = enrollmentService.calculatePremiumSummary(
    enrollment.elections.map((e) => ({
      productType: e.productType,
      planCode: e.planCode,
      tierType: e.tierType,
      waived: false,
    }))
  );
  sendSuccess(res, { enrollment, premiumSummary });
});

router.get('/', requireAuth, (req: Request, res: Response) => {
  const employerId = req.query.employerId as string | undefined;
  const enrollments = enrollmentService.getAllEnrollments(employerId);
  sendSuccess(res, { enrollments, total: enrollments.length });
});

router.post('/wizard/start', requireAuth, (req: Request, res: Response) => {
  const { employeeId } = req.body as { employeeId?: string };
  const empId = employeeId ?? 'ACM-E001';
  const session = enrollmentService.startWizard(empId);
  sendSuccess(res, session);
});

router.put('/wizard/:sessionId/step', requireAuth, (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { step, elections } = req.body as { step?: number; elections?: unknown[] };
  if (!step || !elections) {
    sendError(res, 400, 'INVALID_INPUT', 'step and elections are required');
    return;
  }
  const session = enrollmentService.updateWizardStep(sessionId, step, elections as never);
  if (!session) {
    sendError(res, 404, 'NOT_FOUND', 'Wizard session not found');
    return;
  }
  const premiumSummary = enrollmentService.calculatePremiumSummary(session.elections);
  sendSuccess(res, { session, premiumSummary });
});

router.post('/wizard/:sessionId/submit', requireAuth, (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const result = enrollmentService.submitWizard(sessionId);
  if (!result) {
    sendError(res, 404, 'NOT_FOUND', 'Wizard session not found');
    return;
  }
  sendSuccess(res, result);
});

router.get('/comparison', requireAuth, (req: Request, res: Response) => {
  const planCodes = ((req.query.plans as string) ?? '').split(',').filter(Boolean);
  const tierType = (req.query.tierType as string) ?? 'EE Only';
  const plans = enrollmentService.getPlansForEnrollment();
  const rates = enrollmentService.getAllRates();
  const selected = planCodes.length > 0
    ? plans.filter((p) => planCodes.includes(p.planCode))
    : plans.filter((p) => ['MED-PPO-500', 'MED-PPO-1000', 'MED-HDHP-3000'].includes(p.planCode));
  const comparison = selected.map((plan) => {
    const rate = rates.find((r) => r.planCode === plan.planCode && r.tierType === tierType);
    return { ...plan, rate };
  });
  sendSuccess(res, { plans: comparison, tierType });
});

export default router;
