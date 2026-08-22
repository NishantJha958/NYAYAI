import { Router } from 'express';
import { searchLegal } from '../controllers/legalController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.post('/search', cacheMiddleware, searchLegal);

export default router;
