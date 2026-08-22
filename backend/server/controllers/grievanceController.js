import Grievance from '../models/Grievance.js';
import LegalDraft from '../models/LegalDraft.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { validateGrievance } from '../utils/validators.js';
import { generateDraft } from '../services/aiBridge.js';

export const createGrievance = async (req, res, next) => {
  try {
    const errors = validateGrievance(req.body);
    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400, 'VALIDATION_ERROR');
    }

    const { plainText, category, language, additionalDetails } = req.body;
    const user = await User.findById(req.userId);
    const lang = language || user?.preferredLang || 'en';

    const attachments = (req.files || []).map(f => ({
      filename: f.originalname,
      path: f.path,
      mimetype: f.mimetype,
      size: f.size
    }));

    const grievance = await Grievance.create({
      userId: req.userId,
      plainText: plainText.trim(),
      category,
      language: lang,
      additionalDetails: additionalDetails?.trim() || '',
      attachments,
      status: 'processing',
    });

    try {
      let userContext = '';
      if (user.state || user.city || user.age || user.profession || (user.gender && user.gender !== 'Prefer not to say') || (user.incomeBracket && user.incomeBracket !== 'Prefer not to say') || (user.socialCategory && user.socialCategory !== 'Prefer not to say')) {
        const parts = [];
        if (user.age) parts.push(`Age ${user.age}`);
        if (user.gender && user.gender !== 'Prefer not to say') parts.push(`Gender ${user.gender}`);
        if (user.socialCategory && user.socialCategory !== 'Prefer not to say') parts.push(`Category ${user.socialCategory}`);
        if (user.incomeBracket && user.incomeBracket !== 'Prefer not to say') parts.push(`Income ${user.incomeBracket}`);
        if (user.city || user.state) parts.push(`Location ${user.city ? user.city + ', ' : ''}${user.state || ''}`);
        if (user.profession) parts.push(`Profession ${user.profession}`);
        userContext = `[User Demographics: ${parts.join(', ')}]`;
      }

      const aiResult = await generateDraft({
        plainText: grievance.plainText,
        category: grievance.category,
        language: grievance.language,
        additionalDetails: grievance.additionalDetails,
        files: req.files || [],
        userContext
      });

      grievance.legalDraft = aiResult.draft || aiResult.legal_draft || aiResult.legalDraft || '';
      grievance.simplifiedExplanation =
        aiResult.simplified_explanation || aiResult.simplifiedExplanation || '';
      grievance.statutes = (aiResult.sources || aiResult.statutes || []).map((s) => ({
        act: s.act || '',
        section: s.section || '',
        title: s.title || '',
        relevance: s.relevance || '',
        source: s.source || '',
      }));
      grievance.status = 'completed';
      await grievance.save();

      await LegalDraft.create({
        grievanceId: grievance._id,
        userId: req.userId,
        content: grievance.legalDraft,
        simplifiedContent: grievance.simplifiedExplanation,
        statutes: grievance.statutes,
        language: grievance.language,
      });
    } catch (aiError) {
      grievance.status = 'failed';
      await grievance.save();
      throw aiError;
    }

    res.status(201).json({
      success: true,
      data: { grievance },
    });
  } catch (err) {
    next(err);
  }
};

export const getGrievances = async (req, res, next) => {
  try {
    const grievances = await Grievance.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: { grievances },
    });
  } catch (err) {
    next(err);
  }
};

export const getGrievanceById = async (req, res, next) => {
  try {
    const grievance = await Grievance.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).select('-__v');

    if (!grievance) {
      throw new AppError('Grievance not found', 404, 'GRIEVANCE_NOT_FOUND');
    }

    res.json({
      success: true,
      data: { grievance },
    });
  } catch (err) {
    next(err);
  }
};
