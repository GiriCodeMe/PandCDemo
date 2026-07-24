import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { employeeService } from '../services/employee.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = Router();

router.use(requireAuth);

// GET /api/employees?employerId=&q=
router.get('/', (req: AuthRequest, res) => {
  const employerId = (req.query.employerId as string) || 'ACM-001';
  const q = req.query.q as string | undefined;
  const employees = q
    ? employeeService.search(q, employerId)
    : employeeService.getAll(employerId);
  sendSuccess(res, employees);
});

// GET /api/employees/:employeeId
router.get('/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  const employee = employeeService.getById(employeeId);
  if (!employee) {
    sendError(res, 'NOT_FOUND', 'Employee ' + employeeId + ' not found', 404);
    return;
  }
  sendSuccess(res, employee);
});

// GET /api/employees/:employeeId/dependents
router.get('/:employeeId/dependents', (req, res) => {
  const { employeeId } = req.params;
  const employee = employeeService.getById(employeeId);
  if (!employee) {
    sendError(res, 'NOT_FOUND', 'Employee ' + employeeId + ' not found', 404);
    return;
  }
  const dependents = employeeService.getDependents(employeeId);
  sendSuccess(res, dependents);
});

export default router;
