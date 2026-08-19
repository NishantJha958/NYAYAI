import { Router } from 'express';
import { searchLegal } from '../controllers/legalController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.post('/search', searchLegal);

export default router;
