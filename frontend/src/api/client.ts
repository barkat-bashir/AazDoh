const BASE_URL = '/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export class ApiError extends Error {
  constructor(public message: string, public status?: number, public errors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('aazdoh_token');
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('aazdoh_token');
      localStorage.removeItem('aazdoh_user');
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/';
      }
      throw new ApiError('Session expired. Please log in again.', 401);
    }

    const data: ApiResponse<T> = await response.json().catch(() => ({
      success: response.ok,
      message: response.statusText,
      data: null as any,
      timestamp: new Date().toISOString()
    }));

    if (!response.ok || data.success === false) {
      throw new ApiError(data.message || 'An error occurred', response.status);
    }

    return data.data;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network error occurred. Please check your connection.');
  }
}
