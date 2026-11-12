const configuredApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE_URL = configuredApiUrl
  ? `${configuredApiUrl}${configuredApiUrl.endsWith('/api') ? '' : '/api'}`
  : '/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  let token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 && !token) {
    try {
      let emailParam = '';
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (u.email) emailParam = `?email=${encodeURIComponent(u.email)}`;
      } catch {}
      const refRes = await fetch(`${BASE_URL}/auth/dev-token${emailParam}`, { method: 'POST' });
      if (refRes.ok) {
        const refData = await refRes.json();
        if (refData.token) {
          localStorage.setItem('token', refData.token);
          headers['Authorization'] = `Bearer ${refData.token}`;
          response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
        }
      }
    } catch {}
  }

  if (!response.ok) {
    let message = `API error: ${response.status}`;
    try {
      const errorBody = await response.json();
      const apiMessage = errorBody?.message || errorBody?.detail || errorBody?.title;
      if (typeof apiMessage === 'string' && apiMessage.trim()) message = apiMessage;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

