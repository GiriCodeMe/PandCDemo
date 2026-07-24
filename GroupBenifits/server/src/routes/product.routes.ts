import { Router } from 'express';
import { productService } from '../services/product.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

const router = Router();

// GET /api/products?employerId=
router.get('/', (req, res) => {
  const employerId = req.query.employerId as string | undefined;
  const products = productService.getAll(employerId);
  sendSuccess(res, products);
});

// GET /api/products/:productId
router.get('/:productId', (req, res) => {
  const { productId } = req.params;
  const product = productService.getById(productId);
  if (!product) {
    sendError(res, 'NOT_FOUND', 'Product ' + productId + ' not found', 404);
    return;
  }
  const plans = productService.getPlans(productId);
  const plansWithRates = plans.map((plan) => ({
    ...plan,
    rates: productService.getRates(plan.planId),
  }));
  sendSuccess(res, { ...product, plans: plansWithRates });
});

// GET /api/products/:productId/plans
router.get('/:productId/plans', (req, res) => {
  const { productId } = req.params;
  const plans = productService.getPlans(productId);
  const plansWithRates = plans.map((plan) => ({
    ...plan,
    rates: productService.getRates(plan.planId),
    versions: productService.getPlanVersions(plan.planId),
  }));
  sendSuccess(res, plansWithRates);
});

export default router;
