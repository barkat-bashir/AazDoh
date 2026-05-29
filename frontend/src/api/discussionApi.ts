import { request } from './client';

export interface DiscussionMessage {
  id: string;
  authorId: string;
  authorFullName: string;
  message: string;
  createdAt: string;
}

export interface DiscussionResponse {
  id: string;
  commitmentId: string;
  messages: DiscussionMessage[];
}

export interface AddMessageRequest {
  message: string;
}

export const discussionApi = {
  getDiscussion: (commitmentId: string) =>
    request<DiscussionResponse>(`/commitments/${commitmentId}/discussion`),

  postMessage: (commitmentId: string, message: string) =>
    request<DiscussionMessage>(`/commitments/${commitmentId}/discussion/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};
