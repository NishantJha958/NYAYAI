import '../config/env.js';
import axios from 'axios';
import { AppError } from '../utils/AppError.js';

const getAiConfig = () => ({
  baseURL: process.env.FASTAPI_URL || 'http://localhost:8000',
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

export const generateDraft = async ({ plainText, category, language, additionalDetails }) => {
  try {
    const situation = `${plainText}. Additional details: ${additionalDetails || 'None'}. Language: ${language || 'en'}`;
    const response = await createClient().post('/api/v1/draft', {
      situation: situation,
      document_type: category || 'Legal Document',
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

export const checkAiHealth = async () => {
  try {
    const response = await createClient().get('/health', { timeout: 5000 });
    return response.data?.data?.status === 'ok';
  } catch {
    return false;
  }
};
