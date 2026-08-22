import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { getMongoStatus } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { morganMiddleware } from './middleware/morganMiddleware.js';
import { checkAiHealth } from './services/aiBridge.js';
import authRoutes from './routes/authRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import legalRoutes from './routes/legalRoutes.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false })); // allow images to be loaded cross-origin
app.use(cors({ origin: true, credentials: true })); // Enable credentials for cookies
app.use(morganMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use(rateLimiter);

app.get('/health', async (_req, res) => {
  const aiAvailable = await checkAiHealth();

  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'nyaya-server',
      timestamp: new Date().toISOString(),
      dependencies: {
        mongodb: getMongoStatus(),
        aiService: aiAvailable ? 'available' : 'unavailable',
      },
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/legal', legalRoutes);

app.use(errorHandler);

export default app;
