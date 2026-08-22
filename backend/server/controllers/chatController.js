import crypto from 'crypto';
import ChatHistory from '../models/ChatHistory.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { validateChat } from '../utils/validators.js';
import { sendChatMessage, streamChatMessage } from '../services/aiBridge.js';
import axios from 'axios';
import FormData from 'form-data';

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

    let userContext = '';
    if (user.state || user.city || user.age || user.profession || (user.gender && user.gender !== 'Prefer not to say') || (user.incomeBracket && user.incomeBracket !== 'Prefer not to say') || (user.socialCategory && user.socialCategory !== 'Prefer not to say')) {
      const parts = [];
      if (user.age) parts.push(`Age ${user.age}`);
      if (user.gender && user.gender !== 'Prefer not to say') parts.push(`Gender ${user.gender}`);
      if (user.socialCategory && user.socialCategory !== 'Prefer not to say') parts.push(`Category ${user.socialCategory}`);
      if (user.incomeBracket && user.incomeBracket !== 'Prefer not to say') parts.push(`Income ${user.incomeBracket}`);
      if (user.city || user.state) parts.push(`Location ${user.city ? user.city + ', ' : ''}${user.state || ''}`);
      if (user.profession) parts.push(`Profession ${user.profession}`);
      userContext = `[User Context: ${parts.join(', ')}] `;
    }

    const aiResult = await sendChatMessage({
      message: `${userContext}${message.trim()}`,
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

export const streamMessage = async (req, res, next) => {
  try {
    const errors = validateChat(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join('; ') });
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

    let userContext = '';
    if (user.state || user.city || user.age || user.profession || (user.gender && user.gender !== 'Prefer not to say') || (user.incomeBracket && user.incomeBracket !== 'Prefer not to say') || (user.socialCategory && user.socialCategory !== 'Prefer not to say')) {
      const parts = [];
      if (user.age) parts.push(`Age ${user.age}`);
      if (user.gender && user.gender !== 'Prefer not to say') parts.push(`Gender ${user.gender}`);
      if (user.socialCategory && user.socialCategory !== 'Prefer not to say') parts.push(`Category ${user.socialCategory}`);
      if (user.incomeBracket && user.incomeBracket !== 'Prefer not to say') parts.push(`Income ${user.incomeBracket}`);
      if (user.city || user.state) parts.push(`Location ${user.city ? user.city + ', ' : ''}${user.state || ''}`);
      if (user.profession) parts.push(`Profession ${user.profession}`);
      userContext = `[User Context: ${parts.join(', ')}] `;
    }

    // Set a header with the sessionId so the client knows it immediately
    res.setHeader('X-Session-Id', sid);

    await streamChatMessage({
      message: `${userContext}${message.trim()}`,
      history: buildHistoryForAi(chat.messages.slice(0, -1)),
      language: lang,
      res,
      onComplete: async (fullAnswer) => {
        chat.messages.push({
          role: 'assistant',
          content: fullAnswer,
          timestamp: new Date(),
        });
        await chat.save();
      }
    });
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Stream failed setup' });
    } else {
      res.end();
    }
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

export const processVoice = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No audio file provided', 400, 'VALIDATION_ERROR');
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: 'audio.webm',
      contentType: req.file.mimetype,
    });

    const aiUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    const response = await axios.post(`${aiUrl}/speech/transcribe`, formData, {
      headers: { ...formData.getHeaders() },
    });

    res.json({
      success: true,
      data: { text: response.data.text },
    });
  } catch (err) {
    next(err);
  }
};
