import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-nyaya';
process.env.JWT_EXPIRE = '1h';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nyaya_test';

let server;
let baseUrl;
let authToken;
const testEmail = `test-${Date.now()}@nyaya.test`;

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

  await User.deleteMany({ email: testEmail });

  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await User.deleteMany({ email: testEmail });
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
});

describe('Auth API', () => {
  test('POST /api/auth/register — creates a new user', async () => {
    const { status, data } = await request('POST', '/api/auth/register', {
      name: 'Test User',
      email: testEmail,
      password: 'password123',
      preferredLang: 'hi',
    });

    assert.equal(status, 201);
    assert.equal(data.success, true);
    assert.ok(data.data.token);
    assert.equal(data.data.user.email, testEmail);
    assert.equal(data.data.user.preferredLang, 'hi');
    assert.equal(data.data.user.passwordHash, undefined);

    authToken = data.data.token;
  });

  test('POST /api/auth/register — rejects duplicate email', async () => {
    const { status, data } = await request('POST', '/api/auth/register', {
      name: 'Duplicate',
      email: testEmail,
      password: 'password123',
    });

    assert.equal(status, 409);
    assert.equal(data.success, false);
    assert.equal(data.code, 'EMAIL_EXISTS');
  });

  test('POST /api/auth/login — authenticates valid credentials', async () => {
    const { status, data } = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'password123',
    });

    assert.equal(status, 200);
    assert.equal(data.success, true);
    assert.ok(data.data.token);
    authToken = data.data.token;
  });

  test('POST /api/auth/login — rejects invalid password', async () => {
    const { status, data } = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'wrongpassword',
    });

    assert.equal(status, 401);
    assert.equal(data.success, false);
    assert.equal(data.code, 'INVALID_CREDENTIALS');
  });

  test('GET /api/auth/profile — returns user for valid token', async () => {
    const { status, data } = await request('GET', '/api/auth/profile', null, authToken);

    assert.equal(status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.user.email, testEmail);
  });

  test('GET /api/auth/profile — rejects unauthorized request', async () => {
    const { status, data } = await request('GET', '/api/auth/profile');

    assert.equal(status, 401);
    assert.equal(data.success, false);
    assert.equal(data.code, 'UNAUTHORIZED');
  });

  test('POST /api/auth/register — rejects invalid input', async () => {
    const { status, data } = await request('POST', '/api/auth/register', {
      name: 'A',
      email: 'not-an-email',
      password: '123',
    });

    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.equal(data.code, 'VALIDATION_ERROR');
  });
});

describe('Protected routes', () => {
  test('GET /api/grievances — rejects unauthorized request', async () => {
    const { status, data } = await request('GET', '/api/grievances');

    assert.equal(status, 401);
    assert.equal(data.code, 'UNAUTHORIZED');
  });

  test('GET /api/grievances — returns empty list for authenticated user', async () => {
    const { status, data } = await request('GET', '/api/grievances', null, authToken);

    assert.equal(status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data.grievances));
  });
});

describe('Health', () => {
  test('GET /health — returns ok status', async () => {
    const { status, data } = await request('GET', '/health');

    assert.equal(status, 200);
    assert.equal(data.success, true);
    assert.equal(data.data.status, 'ok');
  });
});
