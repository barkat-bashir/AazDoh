import axios, { AxiosInstance, AxiosError } from "axios";
import { getConfig, AazDohCliConfig } from "./config.js";

export interface CommitmentDto {
  id: string;
  userId: string;
  userFullName: string;
  title: string;
  description?: string;
  expectedOutcome?: string;
  estimatedMinutes: number;
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
  category: "DEEP_WORK" | "ROUTINE" | "STRATEGIC_PLANNING" | "COMMUNICATION" | "FITNESS_HEALTH" | "LEARNING" | "ADMIN_MAINTENANCE" | "OTHER";
  dayPhase?: "MORNING" | "DAY" | "EVENING" | "ANYTIME" | null;
  commitmentDate: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "POSTPONED" | "CANCELLED" | "MISSED";
  visibility: "PRIVATE" | "SHARED_WITH_PARTNER" | "MUTUAL";
  targetPartnerId?: string;
  targetPartnerName?: string;
  postponementCount?: number;
  postponeReason?: string;
  completedAt?: string;
  createdAt: string;
}

export interface AgentActionReceiptDto {
  logId: string;
  actionType: string;
  description: string;
  undone: boolean;
  createdAt: string;
}

export interface AgentChatResponseDto {
  reply: string;
  receipts: AgentActionReceiptDto[];
  undoAvailable: boolean;
  cognitiveWarning?: string;
}

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  timezone: string;
  aiPersona: "GENTLE" | "BALANCED" | "STRICT";
}

export interface AnalyticsSummaryDto {
  daysAnalyzed: number;
  totalCommitments: number;
  completedCommitments: number;
  missedCommitments: number;
  postponedCommitments: number;
  completionRate: number;
  totalFocusHours: number;
  avgDailyFocusHours: number;
  failureBreakdown?: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
}

export interface PlanStressTestResponseDto {
  riskScore: number;
  riskLevel: string;
  diagnosticSummary: string;
  plannedHours: number;
  optimizedHours: number;
  historicalCapacityHours: number;
  proposedOptimizations?: Array<{
    originalCommitmentId: string;
    suggestedAction: string;
    proposedTitle?: string;
    proposedMinutes?: number;
    reasoning: string;
  }>;
  validated: boolean;
  defenseFeedback?: string;
  persona?: string;
}

export interface SseStreamCallbacks {
  onStep?: (step: string) => void;
  onDelta?: (delta: string) => void;
  onDone?: (data: AgentChatResponseDto) => void;
  onError?: (error: string) => void;
}

export class AazDohApiClient {
  private config: AazDohCliConfig;
  private http: AxiosInstance;

  constructor(customConfig?: AazDohCliConfig) {
    this.config = customConfig || getConfig();
    this.http = axios.create({
      baseURL: this.config.apiUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": this.config.apiKey,
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });
  }

  public async getCurrentUser(): Promise<UserProfileDto> {
    const res = await this.http.get<{ data: UserProfileDto }>("/api/v1/users/me");
    return res.data.data;
  }

  public async getTodayCommitments(date?: string): Promise<CommitmentDto[]> {
    const params = date ? { date } : {};
    const res = await this.http.get<{ data: CommitmentDto[] }>("/api/v1/commitments/today", { params });
    return res.data.data;
  }

  public async completeCommitment(id: string, payload?: { notes?: string }): Promise<CommitmentDto> {
    const res = await this.http.post<{ data: CommitmentDto }>(`/api/v1/commitments/${id}/complete`, payload || {});
    return res.data.data;
  }

  public async undoLastAction(): Promise<AgentActionReceiptDto> {
    const res = await this.http.post<{ data: AgentActionReceiptDto }>("/api/v1/agent/undo");
    return res.data.data;
  }

  public async getRecentLogs(): Promise<AgentActionReceiptDto[]> {
    const res = await this.http.get<{ data: AgentActionReceiptDto[] }>("/api/v1/agent/logs");
    return res.data.data;
  }

  public async getAnalyticsSummary(days: number = 7): Promise<AnalyticsSummaryDto> {
    const res = await this.http.get<{ data: AnalyticsSummaryDto }>("/api/v1/analytics/summary", { params: { days } });
    return res.data.data;
  }

  public async stressTestPlan(quickDefense?: string): Promise<PlanStressTestResponseDto> {
    const res = await this.http.post<{ data: PlanStressTestResponseDto }>("/api/v1/ai/stress-test", {
      quickDefense,
      date: new Date().toISOString().split("T")[0],
    });
    return res.data.data;
  }

  public async chatSync(message: string): Promise<AgentChatResponseDto> {
    const res = await this.http.post<{ data: AgentChatResponseDto }>("/api/v1/agent/chat", { message });
    return res.data.data;
  }

  public async streamChat(
    message: string,
    history: Array<{ role: string; content: string }> = [],
    callbacks: SseStreamCallbacks
  ): Promise<AgentChatResponseDto> {
    const url = `${this.config.apiUrl}/api/v1/agent/chat/stream`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "X-API-Key": this.config.apiKey,
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errMsg = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.message) errMsg = parsed.message;
        } catch {}
        throw new Error(errMsg);
      }

      if (!response.body) {
        throw new Error("No response body received for streaming.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let finalResult: AgentChatResponseDto | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.replace(/^event:\s*/, "");
          } else if (trimmed.startsWith("data:")) {
            const dataStr = trimmed.replace(/^data:\s*/, "");
            try {
              const data = JSON.parse(dataStr);
              const eventType = currentEvent || data.type;

              if (eventType === "STEP" && data.step) {
                callbacks.onStep?.(data.step);
              } else if (eventType === "DELTA" && data.delta) {
                callbacks.onDelta?.(data.delta);
              } else if (eventType === "DONE") {
                finalResult = {
                  reply: data.reply || "",
                  receipts: data.receipts || [],
                  undoAvailable: Boolean(data.undoAvailable),
                  cognitiveWarning: data.cognitiveWarning,
                };
                callbacks.onDone?.(finalResult);
              } else if (eventType === "ERROR") {
                callbacks.onError?.(data.error || "Agent execution error");
              }
            } catch {
              // Raw text chunk if not JSON
              if (currentEvent === "DELTA") {
                callbacks.onDelta?.(dataStr);
              }
            }
          }
        }
      }

      if (finalResult) {
        return finalResult;
      }

      return {
        reply: "Task executed.",
        receipts: [],
        undoAvailable: false,
      };
    } catch (err: any) {
      if (callbacks.onError) {
        callbacks.onError(err.message || String(err));
      }
      throw err;
    }
  }
}
