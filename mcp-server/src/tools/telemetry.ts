import { z } from "zod";
import { client } from "../client.js";

export interface PlanStressTestResponseDto {
  riskScore: number;
  riskLevel: string;
  diagnosticSummary: string;
  plannedHours: number;
  optimizedHours: number;
  historicalCapacityHours: number;
  proposedOptimizations?: Array<{
    commitmentId: string;
    action: "KEEP" | "TRIM_DURATION" | "SPLIT" | "POSTPONE" | "DROP";
    suggestedMinutes: number;
    reasoning: string;
  }>;
  validated: boolean;
  defenseFeedback?: string;
  persona?: string;
  timestamp: string;
}

export interface AccountabilityStatsResponseDto {
  completionRate: number;
  totalCommitments: number;
  completedCommitments: number;
  postponedCommitments: number;
  failedCommitments: number;
  currentStreak: number;
  longestStreak: number;
  totalFocusMinutes: number;
  averageFocusPerDay: number;
  estimationAccuracyPercent: number;
}

export interface ExcuseAnalysisResponseDto {
  validityScore: number;
  verdict: string;
  historicalPatternDetected: boolean;
  patternName?: string;
  realityCheck: string;
  constructiveAlternative: string;
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
      lines.push(`- **Action: \`${p.action}\`** (Target: ${p.suggestedMinutes}m) -> Commitment ID: \`${p.commitmentId}\``);
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

  const completionPct = Math.round(stats.completionRate * 100);
  const accuracyPct = Math.round(stats.estimationAccuracyPercent || 0);

  const lines = [
    `# 📊 AazDoh Cognitive Telemetry & Execution Velocity (${days}-Day Window)`,
    `- **Commitment Completion Rate**: **${completionPct}%** (${stats.completedCommitments} of ${stats.totalCommitments} kept)`,
    `- **Postponement Ratio**: **${stats.postponedCommitments}** tasks rescheduled to future dates`,
    `- **Active Accountability Streak**: **${stats.currentStreak} days** 🔥 (Personal Record: ${stats.longestStreak} days)`,
    `- **Total Deep Focus Time**: **${Math.round(stats.totalFocusMinutes / 60 * 10) / 10} hours** (~${stats.averageFocusPerDay}m/day average)`,
    `- **Time Estimation Accuracy**: **${accuracyPct}%** (Ratio of estimated vs actual time spent)`,
  ];

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
    `**Verdict**: ${result.verdict} (Validity Score: ${result.validityScore}/100)`,
    result.historicalPatternDetected ? `⚠️ **Historical Habit Pattern Identified**: _${result.patternName || "Recurring avoidance"}_` : "",
    `\n**Receipt Analysis**:`,
    result.realityCheck,
    `\n**Constructive Path Forward**:`,
    result.constructiveAlternative,
  ].filter(Boolean);

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
