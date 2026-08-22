import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

export const authMiddleware = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError('JWT configuration error', 500, 'CONFIG_ERROR');
    }

    const decoded = jwt.verify(token, secret);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
      return;
    }
    next(err);
  }
};

export const signAccessToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = '1h'; // Access token valid for 1 hour

  if (!secret) {
    throw new AppError('JWT configuration error', 500, 'CONFIG_ERROR');
  }

  return jwt.sign({ userId }, secret, { expiresIn });
};

export const signRefreshToken = (userId) => {
  // Use a separate secret for refresh tokens ideally, but falling back to JWT_SECRET if REFRESH_TOKEN_SECRET is not set
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
  const expiresIn = '7d'; // Long-lived refresh token

  if (!secret) {
    throw new AppError('JWT configuration error', 500, 'CONFIG_ERROR');
  }

  return jwt.sign({ userId }, secret, { expiresIn });
};
