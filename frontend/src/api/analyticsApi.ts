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

export interface DayOfWeekStats {
  dayName: string;
  dayIndex: number;
  totalPlanned: number;
  completedCount: number;
  winRate: number;
  totalFocusMinutes: number;
  isPeakDay: boolean;
  isFrictionDay: boolean;
}

export interface HeatmapDay {
  date: string; // yyyy-MM-dd
  completedCount: number;
  totalCount: number;
  focusMinutes: number;
  intensityLevel: number; // 0..4
}

export interface PlannedVsExecuted {
  plannedHours: number;
  completedHours: number;
  optimismRatio: number;
  executionEfficiency: number;
}

export interface DurationBucketStats {
  bucketLabel: string;
  minMinutes: number;
  maxMinutes: number;
  totalCount: number;
  completedCount: number;
  winRate: number;
  isOptimal: boolean;
}

export interface ProcrastinationBottleneck {
  title: string;
  postponementCount: number;
  firstSeenDate: string;
  latestStatus: string;
}

export interface DailyPositionDropoff {
  positionLabel: string;
  positionIndex: number;
  totalCount: number;
  completedCount: number;
  winRate: number;
}

export interface PriorityBreakdown {
  priority: string;
  totalCount: number;
  completedCount: number;
  totalMinutes: number;
  percentageOfTime: number;
}

export interface ComprehensiveAnalytics {
  daysAnalyzed: number;
  dayOfWeekStats: DayOfWeekStats[];
  heatmap: HeatmapDay[];
  plannedVsExecuted: PlannedVsExecuted;
  durationBuckets: DurationBucketStats[];
  procrastinationBottlenecks: ProcrastinationBottleneck[];
  dailyDropoff: DailyPositionDropoff[];
  priorityBreakdown: PriorityBreakdown[];
}

export const analyticsApi = {
  getSummary: (days: number = 30) =>
    request<AccountabilityStats>(`/analytics/summary?days=${days}`),

  getComprehensive: (days: number = 30, heatmapDays: number = 180) =>
    request<ComprehensiveAnalytics>(`/analytics/comprehensive?days=${days}&heatmapDays=${heatmapDays}`),
};
