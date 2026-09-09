import { request } from './client';

const API_HOST = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://aazdoh.onrender.com' : '')).trim();
const BASE_URL = `${API_HOST.replace(/\/$/, '')}/api/v1`;

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

export interface AgentStreamEvent {
  type: 'STEP' | 'DELTA' | 'DONE' | 'ERROR';
  message?: string;
  delta?: string;
  receipts?: AgentActionReceipt[];
  undoAvailable?: boolean;
  cognitiveWarning?: string;
}

export const agentApi = {
  chat: (data: AgentChatRequest) =>
    request<AgentChatResponse>('/agent/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  streamChat: async (
    data: AgentChatRequest,
    onStep: (step: string) => void,
    onDelta: (chunk: string) => void,
    onDone: (res: AgentChatResponse) => void,
    onError: (err: string) => void
  ) => {
    const token = localStorage.getItem('aazdoh_token');
    const url = `${BASE_URL}/agent/chat/stream`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Stream request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr) continue;
            try {
              const event: AgentStreamEvent = JSON.parse(jsonStr);
              if (event.type === 'STEP' && event.message) {
                onStep(event.message);
              } else if (event.type === 'DELTA' && event.delta) {
                onDelta(event.delta);
              } else if (event.type === 'DONE') {
                onDone({
                  reply: event.message || '',
                  executedActions: event.receipts || [],
                  undoAvailable: !!event.undoAvailable,
                  cognitiveWarning: event.cognitiveWarning,
                });
              } else if (event.type === 'ERROR') {
                onError(event.message || 'Error executing agent plan.');
              }
            } catch (e) {
              console.debug('Failed to parse SSE JSON:', jsonStr);
            }
          }
        }
      }
    } catch (err: any) {
      onError(err.message || 'Streaming failed');
    }
  },

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

