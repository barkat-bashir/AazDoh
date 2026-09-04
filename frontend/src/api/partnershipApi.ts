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
  partnershipType?: 'MUTUAL' | 'ONE_WAY_SPONSOR';
  sharePartnerCommitments?: boolean;
  shareRequesterCommitments?: boolean;
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
  isOneWaySponsor?: boolean;
  // Partner AI Accountability Brief
  aiRiskScore?: number;
  aiRiskLevel?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  aiDiagnosticSummary?: string;
  plannedHours?: number;
  capacityHours?: number;
}

export const partnershipApi = {
  getActive: () => request<Partnership[]>('/partnerships'),
  
  getIncomingInvites: () => request<Partnership[]>('/partnerships/invitations/incoming'),
  
  getOutgoingInvites: () => request<Partnership[]>('/partnerships/invitations/outgoing'),

  invite: (partnerEmail: string, partnershipType: 'MUTUAL' | 'ONE_WAY_SPONSOR' = 'MUTUAL') =>
    request<Partnership>('/partnerships/invite', {
      method: 'POST',
      body: JSON.stringify({ partnerEmail, partnershipType }),
    }),

  accept: (id: string, shareMyCommitments?: boolean) =>
    request<Partnership>(`/partnerships/${id}/accept`, {
      method: 'POST',
      body: shareMyCommitments !== undefined ? JSON.stringify({ shareMyCommitments }) : undefined,
    }),

  reject: (id: string) =>
    request<Partnership>(`/partnerships/${id}/reject`, {
      method: 'POST',
    }),

  terminate: (id: string) =>
    request<void>(`/partnerships/${id}`, {
      method: 'DELETE',
    }),

  update: (id: string, data: { shareMyCommitments?: boolean; partnershipType?: 'MUTUAL' | 'ONE_WAY_SPONSOR' }) =>
    request<Partnership>(`/partnerships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getPartnerOverview: (partnerUserId: string, date?: string) =>
    request<PartnerDailyOverview>(`/partnerships/partner/${partnerUserId}/commitments${date ? `?date=${date}` : ''}`),
};
