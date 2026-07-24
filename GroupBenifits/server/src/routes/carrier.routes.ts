import { Router } from 'express';
import { carrierService } from '../services/product.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = Router();

// GET /api/carriers
router.get('/', (_req, res) => {
  sendSuccess(res, carrierService.getAll());
});

// GET /api/carriers/:carrierId
router.get('/:carrierId', (req, res) => {
  const { carrierId } = req.params;
  const carrier = carrierService.getById(carrierId);
  if (!carrier) {
    sendError(res, 'NOT_FOUND', 'Carrier ' + carrierId + ' not found', 404);
    return;
  }
  sendSuccess(res, carrier);
});

export default router;
