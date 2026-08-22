import crypto from 'crypto';

const CACHE_VERSION = 'v1';

/**
 * Normalizes text by removing punctuation, extra spaces, and converting to lowercase.
 */
export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, '') // Keep alphanumeric, spaces, and Hindi/Devanagari characters
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Generates a SHA-256 hash of the input string.
 */
export const generateHash = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Generates a robust, versioned cache key.
 * @param {string} type - e.g., 'chat', 'search'
 * @param {string} lang - e.g., 'en', 'hi'
 * @param {string} text - The raw user query/message
 * @param {object} [filters] - Optional filters object (e.g., for search)
 * @returns {string} The final cache key
 */
export const getCacheKey = (type, lang, text, filters = {}) => {
  const normalizedText = normalizeText(text);
  
  let keyBase = `${normalizedText}`;
  
  // If filters exist, append them deterministically
  const filterKeys = Object.keys(filters).sort();
  if (filterKeys.length > 0) {
    const filterString = filterKeys.map(k => `${k}:${filters[k]}`).join('|');
    keyBase += `|${filterString}`;
  }

  const hash = generateHash(keyBase);
  return `ai_${CACHE_VERSION}_${type}_${lang}_${hash}`;
};
