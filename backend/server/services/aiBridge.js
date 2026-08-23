import '../config/env.js';
import axios from 'axios';
import { AppError } from '../utils/AppError.js';

const getAiConfig = () => ({
  baseURL: (process.env.FASTAPI_URL || 'http://127.0.0.1:8000').replace(/\/+$/, ''),
  interServiceKey: process.env.INTER_SERVICE_KEY || '',
  timeout: 60000,
});

const createClient = () => {
  const config = getAiConfig();
  return axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
      'Content-Type': 'application/json',
      'X-Inter-Service-Key': config.interServiceKey,
    },
  });
};

const handleAiError = (error, operation) => {
  if (error.code === 'ECONNABORTED') {
    throw new AppError(`AI service timed out during ${operation}`, 504, 'AI_TIMEOUT');
  }

  if (error.response) {
    const status = error.response.status;
    const detail = error.response.data?.detail;
    const message =
      (typeof detail === 'string' ? detail : detail?.[0]?.msg) ||
      error.response.data?.message ||
      `AI service error during ${operation}`;

    throw new AppError(message, status >= 500 ? 502 : status, 'AI_SERVICE_ERROR');
  }

  if (error.request) {
    throw new AppError(
      'AI service is unavailable. Please try again later.',
      503,
      'AI_UNAVAILABLE'
    );
  }

  throw new AppError(`Unexpected AI bridge error during ${operation}`, 500, 'AI_BRIDGE_ERROR');
};

import fs from 'fs';
import FormData from 'form-data';

export const generateDraft = async ({ plainText, category, language, additionalDetails, files, userContext }) => {
  try {
    const situation = `${userContext ? userContext + ' ' : ''}${plainText}. Additional details: ${additionalDetails || 'None'}. Language: ${language || 'en'}`;
    
    const formData = new FormData();
    formData.append('situation', situation);
    formData.append('document_type', category || 'Legal Document');
    
    if (files && files.length > 0) {
      for (const file of files) {
        formData.append('files', fs.createReadStream(file.path), file.filename);
      }
    }

    const config = getAiConfig();
    const response = await axios.post(`${config.baseURL}/api/v1/draft`, formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Inter-Service-Key': config.interServiceKey,
      },
      timeout: config.timeout,
    });
    return response.data;
  } catch (error) {
    handleAiError(error, 'draft generation');
  }
};

export const queryLegal = async ({ query, language, filters = {} }) => {
  try {
    const response = await createClient().post('/api/v1/query', {
      question: `${query} (Respond in language: ${language || 'en'})`,
    });
    return response.data;
  } catch (error) {
    handleAiError(error, 'legal query');
  }
};

export const searchLegalDB = async ({ query, language, filters = {} }) => {
  try {
    const response = await createClient().post('/api/v1/search', {
      query: query,
      filters: filters,
    });
    return response.data;
  } catch (error) {
    handleAiError(error, 'legal search');
  }
};

export const sendChatMessage = async ({ message, history, language }) => {
  try {
    // The chat uses the same RAG Q&A endpoint
    const response = await createClient().post('/api/v1/query', {
      question: `${message} (Respond in language: ${language || 'en'})`,
    });
    return response.data;
  } catch (error) {
    handleAiError(error, 'chat');
  }
};

export const streamChatMessage = async ({ message, history, language, res, onComplete }) => {
  try {
    const config = getAiConfig();
    const response = await axios.post(`${config.baseURL}/api/v1/query/stream`, {
      question: `${message} (Respond in language: ${language || 'en'})`,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Inter-Service-Key': config.interServiceKey,
      },
      responseType: 'stream'
    });
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullAnswer = '';

    response.data.on('data', chunk => {
      const text = chunk.toString();
      fullAnswer += text;
      res.write(text);
    });

    response.data.on('end', () => {
      res.end();
      if (onComplete) onComplete(fullAnswer);
    });

    response.data.on('error', (err) => {
      res.end();
    });
  } catch (error) {
    if (error.response?.status) {
       res.status(error.response.status).json({ success: false, message: 'AI stream error' });
    } else {
       res.status(500).json({ success: false, message: 'Failed to connect to AI for streaming' });
    }
  }
};

export const checkAiHealth = async () => {
  try {
    const response = await createClient().get('/health', { timeout: 5000 });
    // AI service returns { status: 'ok', service: '...' } at the top level
    return response.data?.status === 'ok';
  } catch {
    return false;
  }
};
