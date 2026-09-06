import { request } from './client';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt?: string;
  expiresAt?: string;
  revoked: boolean;
  createdAt: string;
}

export interface CreatedApiKey {
  id: string;
  name: string;
  rawKey: string;
  keyPrefix: string;
  expiresAt?: string;
  createdAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  expiresInDays?: number;
}

export const apiKeyApi = {
  list: () => request<ApiKey[]>('/api-keys'),
  create: (data: CreateApiKeyRequest) =>
    request<CreatedApiKey>('/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  revoke: (id: string) =>
    request<void>(`/api-keys/${id}`, {
      method: 'DELETE',
    }),
};
