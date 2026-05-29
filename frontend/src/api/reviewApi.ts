import { request } from './client';
import { CommitmentStatus } from './commitmentApi';

export type FailureReason = 
  | 'FORGOT' 
  | 'UNDERESTIMATED' 
  | 'DISTRACTED' 
  | 'BLOCKED' 
  | 'DID_NOT_PRIORITIZE' 
  | 'UNEXPECTED_SITUATION' 
  | 'OTHER';

export type NextAction = 
  | 'MOVE_TO_TOMORROW' 
  | 'RESCHEDULE' 
  | 'BREAK_DOWN' 
  | 'DROP';

export interface ReviewResponse {
  id: string;
  commitmentId: string;
  status: CommitmentStatus;
  failureReason?: FailureReason;
  reflection?: string;
  nextAction?: NextAction;
  reviewedAt: string;
}

export interface ReviewCommitmentRequest {
  status: CommitmentStatus;
  failureReason?: FailureReason;
  reflection?: string;
  nextAction?: NextAction;
  rescheduleDate?: string;
}

export const reviewApi = {
  submitReview: (commitmentId: string, data: ReviewCommitmentRequest) =>
    request<ReviewResponse>(`/commitments/${commitmentId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getReview: (commitmentId: string) =>
    request<ReviewResponse>(`/commitments/${commitmentId}/review`),
};
