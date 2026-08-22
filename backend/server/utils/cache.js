import Redis from 'ioredis';
import logger from './logger.js';

// Initialize Redis client connecting to local Redis server
const cache = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

cache.on('connect', () => {
  logger.info('Connected to Redis server successfully');
});

cache.on('error', (err) => {
  logger.error(`Redis connection error: ${err.message}`);
});

export default cache;
