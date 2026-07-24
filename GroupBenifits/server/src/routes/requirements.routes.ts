import { Router } from 'express';
import { requirementsService } from '../services/document.service';
import { sendSuccess } from '../utils/apiResponse';

const router = Router();

// GET /api/requirements?category=&priority=
router.get('/', (req, res) => {
  const { category, priority } = req.query as { category?: string; priority?: string };
  const reqs = requirementsService.getAll(category, priority);
  sendSuccess(res, reqs);
});

// GET /api/requirements/user-stories
router.get('/user-stories', (_req, res) => {
  sendSuccess(res, requirementsService.getUserStories());
});

// GET /api/requirements/business-rules
router.get('/business-rules', (_req, res) => {
  sendSuccess(res, requirementsService.getBusinessRules());
});

// POST /api/requirements/generate — mock AI generation
router.post('/generate', (req, res) => {
  const { documentId } = req.body as { documentId?: string };
  const reqs = requirementsService.getAll();
  const stories = requirementsService.getUserStories();
  const rules = requirementsService.getBusinessRules();
  sendSuccess(res, {
    documentId: documentId || 'DOC-2027-0001',
    generatedAt: new Date().toISOString(),
    requirementsCount: reqs.length,
    userStoriesCount: stories.length,
    businessRulesCount: rules.length,
    requirements: reqs,
    userStories: stories,
    businessRules: rules,
    conflicts: [
      {
        conflictId: 'CONF-001',
        description: 'Deduction language conflict: "monthly" vs "per-paycheck" in sections 3.2 and 7.4',
        severity: 'HIGH',
        resolution: 'Clarification required from HR before plan configuration',
      },
      {
        conflictId: 'CONF-002',
        description: 'Default plan not explicitly defined — ambiguous enrollment default behavior',
        severity: 'MEDIUM',
        resolution: 'Define default plan in Section 2 or add explicit waiver option',
      },
    ],
    model: 'mock-phase2',
    processingTimeMs: 1847,
  });
});

export default router;
