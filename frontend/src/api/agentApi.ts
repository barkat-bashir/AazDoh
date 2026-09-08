import { request } from './client';

export interface AgentChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentActionReceipt {
  id: string;
  actionType: string;
  description: string;
  undone: boolean;
  createdAt: string;
}

export interface AgentChatRequest {
  message: string;
  history?: AgentChatMessage[];
}

export interface AgentChatResponse {
  reply: string;
  executedActions: AgentActionReceipt[];
  undoAvailable: boolean;
  cognitiveWarning?: string;
}

export const agentApi = {
  chat: (data: AgentChatRequest) =>
    request<AgentChatResponse>('/agent/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  undoLast: () =>
    request<AgentActionReceipt>('/agent/undo', {
      method: 'POST',
    }),

  undoById: (logId: string) =>
    request<AgentActionReceipt>(`/agent/undo/${logId}`, {
      method: 'POST',
    }),

  getLogs: () =>
    request<AgentActionReceipt[]>('/agent/logs'),
};
