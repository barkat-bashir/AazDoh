import { request } from './client';

export interface AiFeedbackResponse {
  feedback: string;
  persona: string;
  timestamp: string;
}

export const aiApi = {
  reviewDailyPlan: (date?: string) =>
    request<AiFeedbackResponse>('/ai/review-plan', {
      method: 'POST',
      body: JSON.stringify(date ? { date } : {}),
    }),

  reviewMissed: (commitmentId: string) =>
    request<AiFeedbackResponse>('/ai/review-missed', {
      method: 'POST',
      body: JSON.stringify({ commitmentId }),
    }),

  getInsights: () => request<AiFeedbackResponse>('/ai/insights'),
};
