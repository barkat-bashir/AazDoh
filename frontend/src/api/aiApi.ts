import { request } from './client';
import { Commitment } from './commitmentApi';

export interface AiFeedbackResponse {
  feedback: string;
  persona: string;
  timestamp: string;
}

export interface SplitBlockDetail {
  blockIndex: number;
  title: string;
  minutes: number;
  scheduleTomorrow: boolean;
}

export interface OptimizedTaskProposal {
  originalCommitmentId: string;
  currentTitle: string;
  currentMinutes: number;
  suggestedAction: 'KEEP' | 'TRIM' | 'SPLIT' | 'SHIFT_TO_TOMORROW';
  proposedTitle: string;
  proposedMinutes: number;
  reasoning: string;
  splitBlocks?: SplitBlockDetail[];
}

export interface PlanStressTestResponse {
  riskScore: number; // 0 to 100
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  diagnosticSummary: string;
  plannedHours: number;
  optimizedHours: number;
  historicalCapacityHours: number;
  proposedOptimizations: OptimizedTaskProposal[];
  validated: boolean;
  defenseFeedback?: string;
  persona: string;
  timestamp: string;
}

export interface PlanStressTestRequest {
  date?: string;
  quickDefense?: string;
  overrideSprint?: boolean;
}

export interface ApplyOptimizedPlanRequest {
  acceptedProposals: OptimizedTaskProposal[];
}

export interface HistoricalExcuseReceipt {
  date: string;
  taskTitle: string;
  pastExcuse: string;
  eventualOutcome: string;
}

export interface ExcuseAnalysisResponse {
  patternDetected: boolean;
  patternType: string;
  repetitionCount: number;
  similarityScore: number;
  mirrorCallout: string;
  receipts: HistoricalExcuseReceipt[];
  suggestedMicroMinutes: number;
  microActionTitle: string;
  persona: string;
  timestamp: string;
}

export interface ExcuseAnalysisRequest {
  commitmentId?: string;
  excuseText: string;
  type?: 'POSTPONE' | 'REVIEW';
}

export const aiApi = {
  reviewDailyPlan: (date?: string) =>
    request<AiFeedbackResponse>('/ai/review-plan', {
      method: 'POST',
      body: JSON.stringify(date ? { date } : {}),
    }),

  stressTestPlan: (req?: PlanStressTestRequest) =>
    request<PlanStressTestResponse>('/ai/stress-test', {
      method: 'POST',
      body: JSON.stringify(req || {}),
    }),

  applyOptimizedPlan: (req: ApplyOptimizedPlanRequest) =>
    request<Commitment[]>('/ai/apply-optimized-plan', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  detectExcuse: (req: ExcuseAnalysisRequest) =>
    request<ExcuseAnalysisResponse>('/ai/detect-excuse', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  reviewMissed: (commitmentId: string) =>
    request<AiFeedbackResponse>('/ai/review-missed', {
      method: 'POST',
      body: JSON.stringify({ commitmentId }),
    }),

  getInsights: () => request<AiFeedbackResponse>('/ai/insights'),
};
