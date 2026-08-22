import { Router } from 'express';
import {
  createGrievance,
  getGrievances,
  getGrievanceById,
} from '../controllers/grievanceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});
const upload = multer({ storage });

const router = Router();

router.use(authMiddleware);

router.post('/', upload.array('files', 5), createGrievance);
router.get('/', getGrievances);
router.get('/:id', getGrievanceById);

export default router;
