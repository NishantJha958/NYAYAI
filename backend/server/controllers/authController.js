import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken, signRefreshToken } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../utils/validators.js';

export const register = async (req, res, next) => {
  try {
    const errors = validateRegister(req.body);
    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400, 'VALIDATION_ERROR');
    }

    const { name, email, password, preferredLang } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      preferredLang: preferredLang || 'en',
    });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(201).json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token: accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validateLogin(req.body);
    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400, 'VALIDATION_ERROR');
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        token: accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: { user: user.toSafeObject() },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, preferredLang, state, city, age, gender, profession, incomeBracket, socialCategory } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        throw new AppError('Name must be at least 2 characters', 400, 'VALIDATION_ERROR');
      }
      updates.name = name.trim();
    }

    if (preferredLang !== undefined) {
      if (!['en', 'hi'].includes(preferredLang)) {
        throw new AppError('preferredLang must be en or hi', 400, 'VALIDATION_ERROR');
      }
      updates.preferredLang = preferredLang;
    }

    if (state !== undefined) updates.state = typeof state === 'string' ? state.trim() : '';
    if (city !== undefined) updates.city = typeof city === 'string' ? city.trim() : '';
    if (age !== undefined && age !== '') updates.age = Number(age) || undefined;
    if (gender !== undefined) updates.gender = gender;
    if (profession !== undefined) updates.profession = typeof profession === 'string' ? profession.trim() : '';
    if (incomeBracket !== undefined) updates.incomeBracket = incomeBracket;
    if (socialCategory !== undefined) updates.socialCategory = socialCategory;

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: { user: user.toSafeObject() },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      throw new AppError('No refresh token provided', 401, 'UNAUTHORIZED');
    }

    const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
    
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, secret);
    } catch (err) {
      res.clearCookie('refreshToken');
      throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.clearCookie('refreshToken');
      throw new AppError('User not found', 401, 'UNAUTHORIZED');
    }

    const newAccessToken = signAccessToken(user._id.toString());
    const newRefreshToken = signRefreshToken(user._id.toString());

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      data: { token: newAccessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};
