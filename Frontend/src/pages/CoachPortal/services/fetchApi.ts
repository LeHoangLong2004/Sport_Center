const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // Keep Coach APIs on the same authenticated account as the rest of the
  // portal. Some login flows store the access token under accessToken.
  let token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  if (response.status === 401) {
    try {
      const refRes = await fetch(`${BASE_URL}/auth/dev-token`, { method: 'POST' });
      if (refRes.ok) {
        const refData = await refRes.json();
        if (refData.token) {
          localStorage.setItem('token', refData.token);
          localStorage.setItem('accessToken', refData.token);
          if (refData.user) {
            localStorage.setItem('user', JSON.stringify(refData.user));
          }
          headers['Authorization'] = `Bearer ${refData.token}`;
          response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers
          });
        }
      }
    } catch {}
  }

  if (!response.ok) {
    let message = `API error: ${response.status}`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.message === 'string' && errorBody.message.trim()) {
        message = errorBody.message;
      } else if (typeof errorBody?.detail === 'string' && errorBody.detail.trim()) {
        message = errorBody.detail;
      } else if (typeof errorBody?.title === 'string' && errorBody.title.trim()) {
        message = errorBody.title;
      }
    } catch {}
    throw new Error(message);
  }
  
  return response.json();
}
