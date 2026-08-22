import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('A valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredLang: z.enum(['en', 'hi'], {
    errorMap: () => ({ message: 'preferredLang must be en or hi' }),
  }).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const grievanceSchema = z.object({
  plainText: z.string().trim().min(10, 'Problem description must be at least 10 characters'),
  category: z.enum([
    'Property / Rent',
    'Consumer',
    'Police / Criminal',
    'RTI',
    'Employment',
    'Government Services',
    'Family',
    'Other',
  ], {
    errorMap: () => ({ message: 'A valid category is required' }),
  }),
  language: z.enum(['en', 'hi'], {
    errorMap: () => ({ message: 'language must be en or hi' }),
  }).optional(),
});

const chatSchema = z.object({
  message: z.string().trim().min(1, 'Message is required'),
  sessionId: z.string().optional(),
  language: z.enum(['en', 'hi'], {
    errorMap: () => ({ message: 'language must be en or hi' }),
  }).optional(),
});

const legalQuerySchema = z.object({
  query: z.string().trim().min(3, 'Query must be at least 3 characters'),
  language: z.enum(['en', 'hi'], {
    errorMap: () => ({ message: 'language must be en or hi' }),
  }).optional(),
});

const formatZodErrors = (result) => {
  if (result.success) return [];
  return result.error.errors.map(err => err.message);
};

export const validateRegister = (body) => formatZodErrors(registerSchema.safeParse(body));
export const validateLogin = (body) => formatZodErrors(loginSchema.safeParse(body));
export const validateGrievance = (body) => formatZodErrors(grievanceSchema.safeParse(body));
export const validateChat = (body) => formatZodErrors(chatSchema.safeParse(body));
export const validateLegalQuery = (body) => formatZodErrors(legalQuerySchema.safeParse(body));
