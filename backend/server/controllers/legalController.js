import { searchLegalDB } from '../services/aiBridge.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { validateLegalQuery } from '../utils/validators.js';

export const searchLegal = async (req, res, next) => {
  try {
    const errors = validateLegalQuery(req.body);
    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400, 'VALIDATION_ERROR');
    }

    const { query, language, filters } = req.body;
    const user = await User.findById(req.userId);
    const lang = language || user?.preferredLang || 'en';

    const results = await searchLegalDB({
      query: query.trim(),
      language: lang,
      filters: filters || {},
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};
