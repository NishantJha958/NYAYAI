import crypto from 'crypto';
import ChatHistory from '../models/ChatHistory.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { validateChat } from '../utils/validators.js';
import { sendChatMessage } from '../services/aiBridge.js';

const buildHistoryForAi = (messages) =>
  messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

export const sendMessage = async (req, res, next) => {
  try {
    const errors = validateChat(req.body);
    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400, 'VALIDATION_ERROR');
    }

    const { message, sessionId, language } = req.body;
    const user = await User.findById(req.userId);
    const lang = language || user?.preferredLang || 'en';
    const sid = sessionId || crypto.randomUUID();

    let chat = await ChatHistory.findOne({ userId: req.userId, sessionId: sid });

    if (!chat) {
      chat = await ChatHistory.create({
        userId: req.userId,
        sessionId: sid,
        messages: [],
      });
    }

    chat.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    });

    const aiResult = await sendChatMessage({
      message: message.trim(),
      history: buildHistoryForAi(chat.messages.slice(0, -1)),
      language: lang,
    });

    // FastAPI pre-formats the entire response (Legal, Simple, Next Steps) into 'answer'
    const assistantContent = aiResult.answer || 'I am sorry, I could not generate a response.';
    const legalContent = '';
    const simpleContent = '';
    const nextSteps = [];

    chat.messages.push({
      role: 'assistant',
      content: assistantContent,
      legalContent,
      simpleContent,
      timestamp: new Date(),
    });

    await chat.save();

    res.json({
      success: true,
      data: {
        sessionId: sid,
        message: chat.messages[chat.messages.length - 1],
        nextSteps,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getChatSession = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOne({
      userId: req.userId,
      sessionId: req.params.sessionId,
    }).select('-__v');

    if (!chat) {
      throw new AppError('Chat session not found', 404, 'CHAT_NOT_FOUND');
    }

    res.json({
      success: true,
      data: { chat },
    });
  } catch (err) {
    next(err);
  }
};

export const getChatSessions = async (req, res, next) => {
  try {
    const sessions = await ChatHistory.find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .select('sessionId messages updatedAt createdAt');

    const summary = sessions.map((s) => ({
      sessionId: s.sessionId,
      messageCount: s.messages.length,
      lastMessage: s.messages[s.messages.length - 1]?.content?.slice(0, 100) || '',
      updatedAt: s.updatedAt,
      createdAt: s.createdAt,
    }));

    res.json({
      success: true,
      data: { sessions: summary },
    });
  } catch (err) {
    next(err);
  }
};
