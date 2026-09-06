import { z } from "zod";
import { client } from "../client.js";

export interface OptimizedTaskProposalDto {
  originalCommitmentId: string;
  currentTitle?: string;
  currentMinutes?: number;
  suggestedAction: "KEEP" | "TRIM" | "SPLIT" | "SHIFT_TO_TOMORROW" | string;
  proposedTitle?: string;
  proposedMinutes?: number;
  reasoning: string;
}

export interface PlanStressTestResponseDto {
  riskScore: number;
  riskLevel: string;
  diagnosticSummary: string;
  plannedHours: number;
  optimizedHours: number;
  historicalCapacityHours: number;
  proposedOptimizations?: OptimizedTaskProposalDto[];
  validated: boolean;
  defenseFeedback?: string;
  persona?: string;
  timestamp?: string;
}

export interface AccountabilityStatsResponseDto {
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

export interface HistoricalExcuseReceiptDto {
  date: string;
  taskTitle: string;
  pastExcuse: string;
  eventualOutcome: string;
}

export interface ExcuseAnalysisResponseDto {
  patternDetected: boolean;
  patternType?: string;
  repetitionCount?: number;
  similarityScore?: number;
  mirrorCallout: string;
  receipts?: HistoricalExcuseReceiptDto[];
  suggestedMicroMinutes?: number;
  microActionTitle?: string;
  persona?: string;
  timestamp?: string;
}

export const stressTestPlanSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
    .optional()
    .describe("Date to stress-test. Defaults to today."),
  quickDefense: z
    .string()
    .optional()
    .describe("Optional defense note if you want the AI to evaluate your rationale for heavy workloads"),
});

export async function handleStressTestPlan(args: z.infer<typeof stressTestPlanSchema>) {
  const payload = {
    date: args.date,
    quickDefense: args.quickDefense,
  };

  const test = await client.post<PlanStressTestResponseDto>("/api/v1/ai/stress-test", payload);

  const riskBadge =
    test.riskLevel === "LOW"
      ? "🟢 LOW RISK"
      : test.riskLevel === "MODERATE"
      ? "🟡 MODERATE RISK"
      : test.riskLevel === "HIGH"
      ? "🟠 HIGH RISK"
      : "🔴 CRITICAL OVERLOAD";

  const lines = [
    `# 🧠 AI Chief of Staff: Plan Feasibility Stress-Test`,
    `**Risk Assessment**: ${riskBadge} (${test.riskScore}/100 Risk Index)`,
    `**Capacity Breakdown**:`,
    `- Planned Load: **${test.plannedHours}h** | Historical Safe Capacity: **${test.historicalCapacityHours}h** | Recommended: **${test.optimizedHours}h**\n`,
    `### 📋 Diagnostic Summary`,
    `${test.diagnosticSummary}\n`,
  ];

  if (test.proposedOptimizations && test.proposedOptimizations.length > 0) {
    lines.push(`### 🛡️ Recommended De-Risking Proposals:`);
    for (const p of test.proposedOptimizations) {
      const title = p.proposedTitle || p.currentTitle || "Task";
      const minutes = p.proposedMinutes !== undefined ? p.proposedMinutes : p.currentMinutes;
      lines.push(`- **Action: \`${p.suggestedAction}\`** (${title} -> ${minutes}m) [ID: \`${p.originalCommitmentId}\`]`);
      lines.push(`  _Rationale: ${p.reasoning}_`);
    }
  }

  if (test.defenseFeedback) {
    lines.push(`\n**Defense Critique**: ${test.defenseFeedback}`);
  }

  return {
    content: [
      {
        type: "text" as const,
        text: lines.join("\n"),
      },
    ],
    structuredData: test,
  };
}

export const getTelemetryStatsSchema = z.object({
  days: z
    .number()
    .int()
    .min(1)
    .max(365)
    .default(30)
    .describe("Lookback window in days (e.g. 7, 14, 30, 90). Defaults to 30."),
});

export async function handleGetTelemetryStats(args: z.infer<typeof getTelemetryStatsSchema>) {
  const days = args.days || 30;
  const stats = await client.get<AccountabilityStatsResponseDto>("/api/v1/analytics/summary", { days });

  const completionPct = typeof stats.completionRate === "number" ? Math.round(stats.completionRate) : 0;
  const focusHours = typeof stats.totalFocusHours === "number" ? Math.round(stats.totalFocusHours * 10) / 10 : 0;
  const avgHours = typeof stats.avgDailyFocusHours === "number" ? Math.round(stats.avgDailyFocusHours * 10) / 10 : 0;

  const lines = [
    `# 📊 AazDoh Cognitive Telemetry & Execution Velocity (${days}-Day Window)`,
    `- **Commitment Completion Rate**: **${completionPct}%** (${stats.completedCommitments} of ${stats.totalCommitments} kept)`,
    `- **Postponements Logged**: **${stats.postponedCommitments}** tasks rescheduled`,
    `- **Missed / Dropped**: **${stats.missedCommitments || 0}** commitments`,
    `- **Total Deep Focus Time**: **${focusHours} hours** (~${avgHours}h/day average)`,
  ];

  if (stats.failureBreakdown && stats.failureBreakdown.length > 0) {
    lines.push(`\n### ⚠️ Top Behavioral Failure Friction:`);
    for (const f of stats.failureBreakdown) {
      lines.push(`- **${f.reason}**: ${f.count} instances (${f.percentage}%)`);
    }
  }

  return {
    content: [
      {
        type: "text" as const,
        text: lines.join("\n"),
      },
    ],
    structuredData: stats,
  };
}

export const detectExcuseSchema = z.object({
  excuseText: z.string().min(3).describe("The user's excuse or rationalization for missing or delaying a commitment"),
  commitmentId: z.string().uuid().optional().describe("Optional UUID of the specific commitment being delayed"),
});

export async function handleDetectExcuse(args: z.infer<typeof detectExcuseSchema>) {
  const result = await client.post<ExcuseAnalysisResponseDto>("/api/v1/ai/detect-excuse", {
    excuseText: args.excuseText,
    commitmentId: args.commitmentId,
  });

  const lines = [
    `# 🪞 AI Anti-Self-Deception Reality Check`,
    result.patternDetected
      ? `⚠️ **Pattern Detected**: _${result.patternType || "Recurring Avoidance"}_ (Repeated ${result.repetitionCount || 1}x, Similarity: ${result.similarityScore || 0}%)`
      : `✅ **No Chronic Deception Pattern Detected**`,
    `\n**Mirror Feedback**:`,
    result.mirrorCallout || "No feedback generated.",
  ];

  if (result.microActionTitle) {
    lines.push(`\n**Suggested Micro-Action**:`);
    lines.push(`> "${result.microActionTitle}" (${result.suggestedMicroMinutes || 15}m commitment)`);
  }

  if (result.receipts && result.receipts.length > 0) {
    lines.push(`\n### 📜 Past Receipts:`);
    for (const r of result.receipts) {
      lines.push(`- **${r.date}** on "${r.taskTitle}": _"${r.pastExcuse}"_ -> Outcome: \`${r.eventualOutcome}\``);
    }
  }

  return {
    content: [
      {
        type: "text" as const,
        text: lines.join("\n"),
      },
    ],
    structuredData: result,
  };
}

export interface BehavioralSynthesisDto {
  summary: string;
  keyObservations: string[];
  quickTweak: string;
  rootCauseDeconstruction?: string;
  tacticalHabits?: string[];
  persona: string;
}

export const getAiInsightsSchema = z.object({});

export async function handleGetAiInsights(_args: z.infer<typeof getAiInsightsSchema>) {
  const insights = await client.get<BehavioralSynthesisDto>("/api/v1/ai/insights");

  const lines = [
    `# 🧠 AI Behavioral Synthesis & Growth Diagnostics`,
    `**Executive Summary**: ${insights.summary}\n`,
    `### 🔍 Key Observations:`,
    ...insights.keyObservations.map((obs) => `- ${obs}`),
    `\n### ⚡ Quick Tweak:`,
    `> ${insights.quickTweak}`,
  ];

  if (insights.rootCauseDeconstruction) {
    lines.push(`\n### 🔬 Root Cause Deconstruction:`);
    lines.push(insights.rootCauseDeconstruction);
  }

  if (insights.tacticalHabits && insights.tacticalHabits.length > 0) {
    lines.push(`\n### 🛠️ Tactical Habits to Adopt:`);
    lines.push(...insights.tacticalHabits.map((h) => `- ${h}`));
  }

  return {
    content: [
      {
        type: "text" as const,
        text: lines.join("\n"),
      },
    ],
    structuredData: insights,
  };
}

export const applyOptimizedPlanSchema = z.object({
  proposals: z
    .array(
      z.object({
        originalCommitmentId: z.string().uuid("Invalid commitment UUID"),
        suggestedAction: z.enum(["KEEP", "TRIM", "SPLIT", "SHIFT_TO_TOMORROW"]).default("TRIM"),
        proposedTitle: z.string().optional(),
        proposedMinutes: z.number().int().optional(),
        reasoning: z.string().default("Optimized by AI stress test"),
      })
    )
    .describe("List of accepted de-risking proposals from stress_test_plan"),
});

export async function handleApplyOptimizedPlan(args: z.infer<typeof applyOptimizedPlanSchema>) {
  const result = await client.post<any[]>("/api/v1/ai/apply-optimized-plan", {
    acceptedProposals: args.proposals,
  });

  const lines = [
    `# ⚡ AI Optimized Plan Applied!`,
    `Successfully rebalanced **${result.length}** commitments for today.\n`,
  ];

  for (const c of result) {
    lines.push(`- **${c.title}** (${c.estimatedMinutes}m) [${c.priority}] - Status: \`${c.status}\``);
  }

  return {
    content: [
      {
        type: "text" as const,
        text: lines.join("\n"),
      },
    ],
    structuredData: result,
  };
}

export const reviewMissedCommitmentSchema = z.object({
  commitmentId: z.string().uuid("Invalid commitment UUID").describe("UUID of the missed commitment to deconstruct"),
});

export async function handleReviewMissedCommitment(args: z.infer<typeof reviewMissedCommitmentSchema>) {
  const feedback = await client.post<{ feedback: string; persona: string; timestamp: string }>(
    "/api/v1/ai/review-missed",
    { commitmentId: args.commitmentId }
  );

  const lines = [
    `# 🔬 AI Post-Mortem: Missed Commitment Analysis`,
    feedback.feedback,
  ];

  return {
    content: [
      {
        type: "text" as const,
        text: lines.join("\n"),
      },
    ],
    structuredData: feedback,
  };
}

