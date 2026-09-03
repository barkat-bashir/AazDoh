import { request } from './client';

export type CommitmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'MISSED' | 'POSTPONED' | 'CANCELLED';
export type CommitmentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type CommitmentVisibility = 'PRIVATE' | 'SHARED_WITH_PARTNER';

export interface Commitment {
  id: string;
  userId: string;
  userFullName: string;
  title: string;
  description?: string;
  expectedOutcome?: string;
  estimatedMinutes: number;
  priority: CommitmentPriority;
  commitmentDate: string; // YYYY-MM-DD
  deadline?: string;
  status: CommitmentStatus;
  visibility: CommitmentVisibility;
  targetPartnerId?: string;
  targetPartnerName?: string;
  discussionMessageCount?: number;
  hasUnreadDiscussion?: boolean;
  postponedFromId?: string;
  originCommitmentId?: string;
  postponementCount?: number;
  postponeReason?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCommitmentRequest {
  title: string;
  description?: string;
  expectedOutcome?: string;
  estimatedMinutes: number;
  priority: CommitmentPriority;
  commitmentDate: string;
  deadline?: string;
  visibility: CommitmentVisibility;
  targetPartnerId?: string;
}

export interface UpdateCommitmentRequest {
  title?: string;
  description?: string;
  expectedOutcome?: string;
  estimatedMinutes?: number;
  priority?: CommitmentPriority;
  commitmentDate?: string;
  deadline?: string;
  status?: CommitmentStatus;
  visibility?: CommitmentVisibility;
  targetPartnerId?: string;
}

export interface PostponeCommitmentRequest {
  newDate: string;
  reason?: string;
}

export const commitmentApi = {
  getToday: (date?: string) =>
    request<Commitment[]>(`/commitments/today${date ? `?date=${date}` : ''}`),

  getRange: (startDate: string, endDate: string) =>
    request<Commitment[]>(`/commitments/range?startDate=${startDate}&endDate=${endDate}`),

  getById: (id: string) =>
    request<Commitment>(`/commitments/${id}`),

  create: (data: CreateCommitmentRequest) =>
    request<Commitment>('/commitments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateCommitmentRequest) =>
    request<Commitment>(`/commitments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  complete: (id: string) =>
    request<Commitment>(`/commitments/${id}/complete`, {
      method: 'POST',
    }),

  postpone: (id: string, data: PostponeCommitmentRequest) =>
    request<Commitment>(`/commitments/${id}/postpone`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  reopen: (id: string) =>
    request<Commitment>(`/commitments/${id}/reopen`, {
      method: 'POST',
    }),

  delete: (id: string) =>
    request<void>(`/commitments/${id}`, {
      method: 'DELETE',
    }),
};
