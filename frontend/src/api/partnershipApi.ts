import { request } from './client';
import { Commitment } from './commitmentApi';

export interface Partnership {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'TERMINATED';
  createdAt: string;
}

export interface PartnerDailyOverview {
  partnerId: string;
  partnerName: string;
  date: string;
  sharedCommitments: Commitment[];
  totalCommitments: number;
  completedCommitments: number;
  completionRate: number;
}

export const partnershipApi = {
  getActive: () => request<Partnership[]>('/partnerships'),
  
  getIncomingInvites: () => request<Partnership[]>('/partnerships/invitations/incoming'),
  
  getOutgoingInvites: () => request<Partnership[]>('/partnerships/invitations/outgoing'),

  invite: (partnerEmail: string) =>
    request<Partnership>('/partnerships/invite', {
      method: 'POST',
      body: JSON.stringify({ partnerEmail }),
    }),

  accept: (id: string) =>
    request<Partnership>(`/partnerships/${id}/accept`, {
      method: 'POST',
    }),

  reject: (id: string) =>
    request<Partnership>(`/partnerships/${id}/reject`, {
      method: 'POST',
    }),

  terminate: (id: string) =>
    request<void>(`/partnerships/${id}`, {
      method: 'DELETE',
    }),

  getPartnerOverview: (partnerUserId: string, date?: string) =>
    request<PartnerDailyOverview>(`/partnerships/partner/${partnerUserId}/commitments${date ? `?date=${date}` : ''}`),
};
