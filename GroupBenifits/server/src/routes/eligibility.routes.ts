import { Router } from 'express';
import { eligibilityService } from '../services/eligibility.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = Router();

// GET /api/eligibility-rules?employerId=
router.get('/', (req, res) => {
  const employerId = (req.query.employerId as string) || 'ACM-001';
  const rules = eligibilityService.getRules(employerId);
  sendSuccess(res, rules);
});

// GET /api/eligibility-rules/dependent-rules
router.get('/dependent-rules', (_req, res) => {
  sendSuccess(res, eligibilityService.getDependentRules());
});

// GET /api/eligibility-rules/:ruleId
router.get('/:ruleId', (req, res) => {
  const rule = eligibilityService.getRuleById(req.params.ruleId);
  if (!rule) {
    sendError(res, 'NOT_FOUND', 'Eligibility rule not found', 404);
    return;
  }
  sendSuccess(res, rule);
});

// POST /api/eligibility-rules/evaluate — check one employee against one rule
router.post('/evaluate', (req, res) => {
  const { ruleId, employeeData } = req.body as {
    ruleId?: string;
    employeeData?: Record<string, unknown>;
  };
  if (!ruleId) {
    sendError(res, 'MISSING_FIELDS', 'ruleId is required', 400);
    return;
  }
  const result = eligibilityService.evaluateEmployee(ruleId, employeeData ?? {});
  sendSuccess(res, result);
});

export default router;
