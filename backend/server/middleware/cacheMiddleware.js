import cache from '../utils/cache.js';
import logger from '../utils/logger.js';

export const cacheMiddleware = async (req, res, next) => {
  // Only cache GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return next();
  }

  // Generate a unique key based on URL and body (if it's a POST request)
  const key = `__express__${req.originalUrl || req.url}__${JSON.stringify(req.body || {})}`;
  
  try {
    const cachedData = await cache.get(key);

    if (cachedData) {
      logger.info(`Cache hit for key: ${key}`);
      return res.json(JSON.parse(cachedData));
    }
  } catch (err) {
    logger.error(`Cache get error: ${err.message}`);
    // If Redis fails, just bypass the cache and proceed
  }

  // Store the original res.json function
  const originalJson = res.json;

  // Override res.json to intercept the response before sending it
  res.json = (body) => {
    // Only cache successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        // Cache with an expiry of 1 hour (3600 seconds)
        cache.setex(key, 3600, JSON.stringify(body)).catch(err => {
          logger.error(`Cache set error: ${err.message}`);
        });
      } catch (err) {
        logger.error(`Cache serialization error: ${err.message}`);
      }
    }
    
    // Call original res.json with the body
    originalJson.call(res, body);
  };

  next();
};
