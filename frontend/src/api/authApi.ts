import { request } from './client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  timezone: string;
  aiPersona: 'GENTLE' | 'BALANCED' | 'STRICT';
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  timezone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdatePreferencesRequest {
  fullName?: string;
  timezone?: string;
  aiPersona?: 'GENTLE' | 'BALANCED' | 'STRICT';
}

export const authApi = {
  register: (data: RegisterRequest) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => request<User>('/users/me'),

  updatePreferences: (data: UpdatePreferencesRequest) =>
    request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
