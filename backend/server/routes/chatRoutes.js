import { Router } from 'express';
import multer from 'multer';
import {
  sendMessage,
  streamMessage,
  getChatSession,
  getChatSessions,
  processVoice,
} from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.post('/', sendMessage);
router.post('/stream', streamMessage);
router.post('/voice', upload.single('audio'), processVoice);
router.get('/sessions', getChatSessions);
router.get('/:sessionId', getChatSession);

export default router;
