import { Router } from 'express';
import { searchService } from '../services/search.service';
import { requireAuth } from '../middleware/auth';
import { sendSuccess } from '../utils/apiResponse';

const router = Router();
router.use(requireAuth);

// GET /api/search?q=acme&limit=20
router.get('/', (req, res) => {
  const q = (req.query['q'] as string) ?? '';
  const limit = parseInt((req.query['limit'] as string) ?? '20', 10);
  sendSuccess(res, { query: q, results: searchService.search(q, limit) });
});

export default router;
