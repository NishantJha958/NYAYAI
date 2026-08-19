import { Router } from 'express';
import {
  sendMessage,
  getChatSession,
  getChatSessions,
} from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', sendMessage);
router.get('/sessions', getChatSessions);
router.get('/:sessionId', getChatSession);

export default router;
