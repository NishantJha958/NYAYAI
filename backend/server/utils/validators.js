const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegister = (body) => {
  const errors = [];
  const { name, email, password, preferredLang } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (preferredLang && !['en', 'hi'].includes(preferredLang)) {
    errors.push('preferredLang must be en or hi');
  }

  return errors;
};

export const validateLogin = (body) => {
  const errors = [];
  const { email, password } = body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  return errors;
};

export const validateGrievance = (body) => {
  const errors = [];
  const { plainText, category, language } = body;

  const validCategories = [
    'Property / Rent',
    'Consumer',
    'Police / Criminal',
    'RTI',
    'Employment',
    'Government Services',
    'Family',
    'Other',
  ];

  if (!plainText || typeof plainText !== 'string' || plainText.trim().length < 10) {
    errors.push('Problem description must be at least 10 characters');
  }

  if (!category || !validCategories.includes(category)) {
    errors.push('A valid category is required');
  }

  if (language && !['en', 'hi'].includes(language)) {
    errors.push('language must be en or hi');
  }

  return errors;
};

export const validateChat = (body) => {
  const errors = [];
  const { message, sessionId, language } = body;

  if (!message || typeof message !== 'string' || message.trim().length < 1) {
    errors.push('Message is required');
  }

  if (sessionId && typeof sessionId !== 'string') {
    errors.push('sessionId must be a string');
  }

  if (language && !['en', 'hi'].includes(language)) {
    errors.push('language must be en or hi');
  }

  return errors;
};

export const validateLegalQuery = (body) => {
  const errors = [];
  const { query, language } = body;

  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    errors.push('Query must be at least 3 characters');
  }

  if (language && !['en', 'hi'].includes(language)) {
    errors.push('language must be en or hi');
  }

  return errors;
};
