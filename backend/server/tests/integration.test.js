import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Grievance from '../models/Grievance.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-nyaya';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nyaya_test';
process.env.FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
process.env.INTER_SERVICE_KEY = process.env.INTER_SERVICE_KEY || 'dev-inter-service-key';

const testEmail = `integration-${Date.now()}@nyaya.test`;
const GRIEVANCE_HI =
  'मेरे मकान मालिक ने 6 महीने से सिक्योरिटी डिपॉजिट वापस नहीं किया है, 50,000 रुपये थे।';

let server;
let baseUrl;
let authToken;

const request = async (method, path, body, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;

  const reg = await request('POST', '/api/auth/register', {
    name: 'Integration Test',
    email: testEmail,
    password: 'integration123',
    preferredLang: 'hi',
  });
  authToken = reg.data.data.token;
});

after(async () => {
  await Grievance.deleteMany({ userId: { $exists: true } });
  await User.deleteMany({ email: testEmail });
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
});

describe('Full stack integration', () => {
  test('health shows AI service available', async () => {
    const { status, data } = await request('GET', '/health');
    assert.equal(status, 200);
    assert.equal(data.data.dependencies.aiService, 'available');
  });

  test('POST /api/grievances — full Node → FastAPI → RAG flow', async () => {
    const { status, data } = await request(
      'POST',
      '/api/grievances',
      {
        plainText: GRIEVANCE_HI,
        category: 'Property / Rent',
        language: 'hi',
      },
      authToken
    );

    assert.equal(status, 201);
    assert.equal(data.success, true);

    const g = data.data.grievance;
    assert.ok(g.legalDraft.length > 50);
    assert.ok(g.simplifiedExplanation.length > 20);
    assert.equal(g.status, 'completed');
    assert.ok(Array.isArray(g.statutes));
  });

  test('POST /api/legal/search — returns RAG results', async () => {
    const { status, data } = await request(
      'POST',
      '/api/legal/search',
      {
        query: 'security deposit refund landlord tenant UP rent',
        language: 'en',
      },
      authToken
    );

    assert.equal(status, 200);
    assert.equal(data.success, true);
    assert.ok(
      data.data.results?.length >= 1 || data.data.context_sufficient,
      'Expected search results or sufficient context flag'
    );
  });

  test('POST /api/chat — returns dual output', async () => {
    const { status, data } = await request(
      'POST',
      '/api/chat',
      {
        message: 'My landlord is not returning my security deposit. What can I do?',
        language: 'en',
      },
      authToken
    );

    assert.equal(status, 200);
    assert.ok(data.data.message.content.length > 20);
  });
});
