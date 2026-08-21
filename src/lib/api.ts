// API utility for connecting to Spring Boot backend

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, requireAuth = false } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requireAuth) {
    const token = localStorage.getItem('vv_token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Make sure the backend is running on port 8081.');
  }

  // Safely parse JSON — backend may return empty body on some errors
  let data: Record<string, string> = {};
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const text = await response.text();
    if (text) {
      data = JSON.parse(text);
    }
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

// Auth-specific API calls
export const authApi = {
  signup: (email: string, password: string, displayName?: string) =>
    apiRequest<{ token: string; email: string; displayName: string; message: string }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: { email, password, displayName },
      }
    ),

  login: (email: string, password: string) =>
    apiRequest<{ token: string; email: string; displayName: string; message: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: { email, password },
      }
    ),

  googleLogin: (email: string, displayName: string) =>
    apiRequest<{ token: string; email: string; displayName: string; message: string }>(
      '/api/auth/google',
      {
        method: 'POST',
        body: { email, displayName },
      }
    ),

  me: () =>
    apiRequest<{ id: number; email: string; displayName: string; createdAt: string }>(
      '/api/auth/me',
      {
        requireAuth: true,
      }
    ),
};
