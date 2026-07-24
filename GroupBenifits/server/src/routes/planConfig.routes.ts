import { Router } from 'express';
import { planConfigService } from '../services/planConfig.service';
import { sendSuccess } from '../utils/apiResponse';

const router = Router();

// GET /api/plan-config?employerId=
router.get('/', (req, res) => {
  const employerId = (req.query.employerId as string) || 'ACM-001';
  const summary = planConfigService.getSummary(employerId);
  sendSuccess(res, summary);
});

// GET /api/plan-config/open-enrollment?employerId=
router.get('/open-enrollment', (req, res) => {
  const employerId = (req.query.employerId as string) || 'ACM-001';
  const oe = planConfigService.getOpenEnrollment(employerId);
  sendSuccess(res, oe);
});

// POST /api/plan-config/publish — mock publish workflow
router.post('/publish', (req, res) => {
  const { employerId, planYear } = req.body as { employerId?: string; planYear?: number };
  sendSuccess(res, {
    status: 'PUBLISHED',
    employerId: employerId ?? 'ACM-001',
    planYear: planYear ?? 2027,
    publishedAt: new Date().toISOString(),
    publishedBy: 'Benefits Admin',
    message: 'Plan configuration published. Carrier transmission scheduled for next batch window.',
    nextBatchWindow: '2026-11-01T02:00:00Z',
  });
});

export default router;
