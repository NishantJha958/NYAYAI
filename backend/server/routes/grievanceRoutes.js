import { Router } from 'express';
import {
  createGrievance,
  getGrievances,
  getGrievanceById,
} from '../controllers/grievanceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', createGrievance);
router.get('/', getGrievances);
router.get('/:id', getGrievanceById);

export default router;
