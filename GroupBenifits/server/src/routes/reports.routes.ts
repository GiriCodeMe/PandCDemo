import { Router, Request, Response } from 'express';
import { reportsService } from '../services/reports.service';

const router = Router();

router.get('/executive-summary', (_req: Request, res: Response) => {
  try {
    const data = reportsService.getExecutiveSummary();
    res.json({ success: true, data, requestId: `req-${Date.now()}`, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'REPORT_ERROR', message: (err as Error).message } });
  }
});

router.get('/enrollment', (_req: Request, res: Response) => {
  try {
    const data = reportsService.getEnrollmentReport();
    res.json({ success: true, data, requestId: `req-${Date.now()}`, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'REPORT_ERROR', message: (err as Error).message } });
  }
});

router.get('/carrier-audit', (_req: Request, res: Response) => {
  try {
    const data = reportsService.getCarrierAuditReport();
    res.json({ success: true, data, requestId: `req-${Date.now()}`, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'REPORT_ERROR', message: (err as Error).message } });
  }
});

router.get('/compliance', (_req: Request, res: Response) => {
  try {
    const data = reportsService.getComplianceReport();
    res.json({ success: true, data, requestId: `req-${Date.now()}`, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'REPORT_ERROR', message: (err as Error).message } });
  }
});

export default router;
