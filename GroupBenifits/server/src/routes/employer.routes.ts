import { Router } from 'express';
import { employerService } from '../services/employer.service';
import { requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = Router();
router.use(requireAuth);

// GET /api/employers
router.get('/', (_req, res) => {
  sendSuccess(res, employerService.getAll());
});

// GET /api/employers/:employerId
router.get('/:employerId', (req, res) => {
  const employer = employerService.getById(req.params['employerId']!);
  if (!employer) {
    sendError(res, 'EMPLOYER_NOT_FOUND', 'Employer ' + req.params['employerId'] + ' not found', 404);
    return;
  }
  sendSuccess(res, employer);
});

// GET /api/employers/:employerId/plan-years
router.get('/:employerId/plan-years', (req, res) => {
  const employer = employerService.getById(req.params['employerId']!);
  if (!employer) {
    sendError(res, 'EMPLOYER_NOT_FOUND', 'Employer not found', 404);
    return;
  }
  sendSuccess(res, employerService.getPlanYears(req.params['employerId']!));
});

// GET /api/employers/:employerId/dashboard
router.get('/:employerId/dashboard', (req, res) => {
  const dashboard = employerService.getDashboard(req.params['employerId']!);
  if (!dashboard) {
    sendError(res, 'EMPLOYER_NOT_FOUND', 'Employer not found', 404);
    return;
  }
  sendSuccess(res, dashboard);
});

export default router;
