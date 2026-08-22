const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'nyaya_token';

export function getToken() {
  if (localStorage.getItem(TOKEN_KEY)) {
    localStorage.removeItem(TOKEN_KEY);
  }
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

async function request(method, path, body, auth = true) {
  const isFormData = body instanceof FormData;
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'omit', // We only want credentials (cookies) on auth routes (login/register/refresh/logout), wait, actually let's set to 'include' globally if the API is same-origin or CORS allows credentials.
    // wait, we must set credentials: 'include' globally for refresh to work if we hit /auth/refresh, but wait, we only need it for /auth/refresh and /auth/logout. It's safer to just set 'include' globally.
    credentials: 'include',
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  if (response.status === 401 && auth && path !== '/auth/login' && path !== '/auth/refresh') {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        // Try to refresh token
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!refreshResponse.ok) {
          throw new Error('Refresh failed');
        }
        
        const data = await refreshResponse.json();
        setToken(data.data.token);
        isRefreshing = false;
        onRefreshed(data.data.token);
      } catch (err) {
        isRefreshing = false;
        setToken(null);
        window.location.href = '/login'; // Force logout
        throw err;
      }
    }

    // Wait for the refresh to complete before retrying
    return new Promise((resolve) => {
      addRefreshSubscriber((newToken) => {
        headers.Authorization = `Bearer ${newToken}`;
        resolve(
          fetch(`${API_URL}${path}`, {
            method,
            headers,
            credentials: 'include',
            body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
          }).then((res) => {
            if (!res.ok) throw new Error('Request failed after refresh');
            return res.json();
          })
        );
      });
    });
  }

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
  logout: () => request('POST', '/auth/logout', null, false),
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
  stream: async (payload, onChunk) => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Stream request failed');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
    
    return response.headers.get('X-Session-Id');
  },
  getSession: (sessionId) => request('GET', `/chat/${sessionId}`),
  listSessions: () => request('GET', '/chat/sessions'),
  transcribeVoice: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    const token = getToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    
    const response = await fetch(`${API_URL}/chat/voice`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Voice transcription failed');
    return response.json();
  },
};

export const legalApi = {
  search: (payload) => request('POST', '/legal/search', payload),
};

export { API_URL };
