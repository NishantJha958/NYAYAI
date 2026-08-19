const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'nyaya_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(method, path, body, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.message || 'Request failed');
    err.code = data.code;
    err.status = response.status;
    throw err;
  }

  return data;
}

export async function checkHealth() {
  const baseUrl = API_URL.replace(/\/api$/, '');
  const response = await fetch(`${baseUrl}/health`);
  if (!response.ok) throw new Error('Server health check failed');
  return response.json();
}

export const authApi = {
  register: (payload) => request('POST', '/auth/register', payload, false),
  login: (payload) => request('POST', '/auth/login', payload, false),
  profile: () => request('GET', '/auth/profile'),
  updateProfile: (payload) => request('PATCH', '/auth/profile', payload),
};

export const grievanceApi = {
  create: (payload) => request('POST', '/grievances', payload),
  list: () => request('GET', '/grievances'),
  get: (id) => request('GET', `/grievances/${id}`),
};

export const chatApi = {
  send: (payload) => request('POST', '/chat', payload),
  getSession: (sessionId) => request('GET', `/chat/${sessionId}`),
  listSessions: () => request('GET', '/chat/sessions'),
};

export const legalApi = {
  search: (payload) => request('POST', '/legal/search', payload),
};

export { API_URL };
