import { request } from './client';

export interface RecordFocusSprintPayload {
  commitmentId?: string;
  durationMinutes: number;
  actualSecondsSpent: number;
  mode: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
  status: 'COMPLETED' | 'ABANDONED' | 'EXTENDED';
  distractionsCount: number;
  distractionNotes?: string[];
  startedAt?: string;
  completedAt?: string;
}

export interface CadenceBreakdown {
  cadenceLabel: string;
  durationMinutes: number;
  totalAttempted: number;
  completedCount: number;
  successRate: number;
}

export interface SprintFatiguePosition {
  positionLabel: string;
  positionIndex: number;
  totalSprints: number;
  completedSprints: number;
  completionRate: number;
}

export interface FocusSprintAnalytics {
  daysAnalyzed: number;
  totalSprintsCompleted: number;
  totalSprintsAttempted: number;
  totalFocusMinutesLogged: number;
  sprintCompletionRate: number;
  avgDistractionsPerSprint: number;
  actualVsEstimatedRatio: number;
  cadenceStats: CadenceBreakdown[];
  fatigueCurve: SprintFatiguePosition[];
}

export const focusApi = {
  recordSprint: (payload: RecordFocusSprintPayload) =>
    request<any>('/focus/record', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAnalytics: (days: number = 30) =>
    request<FocusSprintAnalytics>(`/focus/analytics?days=${days}`),
};
