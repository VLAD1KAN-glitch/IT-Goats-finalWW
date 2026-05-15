const API_URL = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    }
  });

  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  return res.json();
}
