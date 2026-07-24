import { Router } from 'express';
import { auditService } from '../services/audit.service';
import { requireAuth } from '../middleware/auth';
import { sendSuccess } from '../utils/apiResponse';

const router = Router();
router.use(requireAuth);

// GET /api/audit?employerId=ACM-001
router.get('/', (req, res) => {
  const employerId = req.query['employerId'] as string | undefined;
  const events = employerId ? auditService.getByEmployer(employerId) : auditService.getAll();
  sendSuccess(res, { events, total: events.length });
});

export default router;
