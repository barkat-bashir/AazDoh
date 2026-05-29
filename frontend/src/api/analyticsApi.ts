import { request } from './client';
import { FailureReason } from './reviewApi';

export interface FailureReasonStats {
  reason: FailureReason;
  count: number;
  percentage: number;
}

export interface AccountabilityStats {
  daysAnalyzed: number;
  totalCommitments: number;
  completedCommitments: number;
  missedCommitments: number;
  postponedCommitments: number;
  completionRate: number;
  totalFocusHours: number;
  avgDailyFocusHours: number;
  failureBreakdown: FailureReasonStats[];
}

export const analyticsApi = {
  getSummary: (days: number = 30) =>
    request<AccountabilityStats>(`/analytics/summary?days=${days}`),
};
