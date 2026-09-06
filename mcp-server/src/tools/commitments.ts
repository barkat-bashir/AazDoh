import { z } from "zod";
import { client } from "../client.js";

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
  commitmentDate: string;
  deadline?: string;
  status: "ACTIVE" | "COMPLETED" | "POSTPONED" | "CANCELLED";
  visibility: "PRIVATE" | "MUTUAL";
  targetPartnerId?: string;
  targetPartnerName?: string;
  postponementCount?: number;
  postponeReason?: string;
  completedAt?: string;
  createdAt: string;
}

export const getTodayPlanSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
    .optional()
    .describe("Target date to query (YYYY-MM-DD). Defaults to today."),
  filter: z
    .enum(["ALL", "ACTIVE", "COMPLETED", "POSTPONED", "CANCELLED"])
    .optional()
    .describe("Filter commitments by execution status. Defaults to ACTIVE."),
});

export async function handleGetTodayPlan(args: z.infer<typeof getTodayPlanSchema>) {
  const params: Record<string, string> = {};
  if (args.date) params.date = args.date;
  if (args.filter) params.filter = args.filter;

  const commitments = await client.get<CommitmentDto[]>("/api/v1/commitments", params);
  
  const totalMinutes = commitments.reduce((acc, c) => acc + (c.estimatedMinutes || 0), 0);
  const completed = commitments.filter((c) => c.status === "COMPLETED").length;
  const active = commitments.filter((c) => c.status === "ACTIVE").length;

  const lines = [
    `# Daily Commitment Plan (${args.date || "Today"})`,
    `**Summary**: ${commitments.length} total commitments | ${active} active | ${completed} completed | Total planned load: ${Math.round(totalMinutes / 60 * 10) / 10}h (${totalMinutes}m)\n`,
  ];

  if (commitments.length === 0) {
    lines.push("No commitments scheduled for this date. You can add one using `create_commitment`.");
  } else {
    for (const c of commitments) {
      const statusIcon = c.status === "COMPLETED" ? "✅" : c.status === "POSTPONED" ? "⏩" : "⭕";
      const prioBadge = `[${c.priority}]`;
      const catBadge = `[${c.category}]`;
      lines.push(`${statusIcon} **${c.title}** (${c.estimatedMinutes}m) ${prioBadge} ${catBadge}`);
      lines.push(`   - ID: \`${c.id}\` | Status: ${c.status} | Visibility: ${c.visibility}`);
      if (c.expectedOutcome) {
        lines.push(`   - Definition of Done: _"${c.expectedOutcome}"_`);
      }
      if (c.postponementCount && c.postponementCount > 0) {
        lines.push(`   - Postponed ${c.postponementCount}x${c.postponeReason ? ` (Reason: "${c.postponeReason}")` : ""}`);
      }
    }
  }

  return {
    content: [
      {
        type: "text" as const,
        text: lines.join("\n"),
      },
    ],
    structuredData: commitments,
  };
}

export const createCommitmentSchema = z.object({
  title: z.string().min(1, "Title is required").describe("Clear, action-oriented commitment title"),
  category: z
    .enum(["DEEP_WORK", "ROUTINE", "STRATEGIC_PLANNING", "COMMUNICATION", "FITNESS_HEALTH", "LEARNING", "ADMIN_MAINTENANCE", "OTHER"])
    .default("DEEP_WORK")
    .describe("Commitment category"),
  priority: z
    .enum(["URGENT", "HIGH", "MEDIUM", "LOW"])
    .default("HIGH")
    .describe("Task priority level"),
  estimatedMinutes: z
    .number()
    .int()
    .min(1)
    .max(720)
    .default(30)
    .describe("Estimated duration in minutes (e.g. 25, 45, 60, 90)"),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
    .optional()
    .describe("Date to schedule for (YYYY-MM-DD). Defaults to today."),
  expectedOutcome: z
    .string()
    .optional()
    .describe("Observable Definition of Done / Expected outcome to prevent ambiguity"),
  visibility: z
    .enum(["PRIVATE", "MUTUAL"])
    .default("PRIVATE")
    .describe("Whether this commitment is private or shared with peer partner"),
  partnerId: z
    .string()
    .uuid()
    .optional()
    .describe("Specific accountability partner UUID if visibility is MUTUAL"),
});

export async function handleCreateCommitment(args: z.infer<typeof createCommitmentSchema>) {
  const payload = {
    title: args.title,
    category: args.category || "DEEP_WORK",
    priority: args.priority || "HIGH",
    estimatedMinutes: args.estimatedMinutes || 30,
    targetDate: args.targetDate,
    expectedOutcome: args.expectedOutcome,
    visibility: args.visibility || "PRIVATE",
    partnerId: args.partnerId,
  };

  const created = await client.post<CommitmentDto>("/api/v1/commitments", payload);

  return {
    content: [
      {
        type: "text" as const,
        text: `🔒 **Commitment Locked In!**\n- **Title**: ${created.title}\n- **ID**: \`${created.id}\`\n- **Duration**: ${created.estimatedMinutes}m | Priority: ${created.priority} | Category: ${created.category}\n- **Status**: ${created.status}\n${created.expectedOutcome ? `- **Outcome**: _"${created.expectedOutcome}"_\n` : ""}`,
      },
    ],
    structuredData: created,
  };
}

export const updateCommitmentSchema = z.object({
  id: z.string().uuid("Invalid commitment UUID").describe("The UUID of the commitment to update"),
  title: z.string().optional().describe("Updated title"),
  category: z
    .enum(["DEEP_WORK", "ROUTINE", "STRATEGIC_PLANNING", "COMMUNICATION", "FITNESS_HEALTH", "LEARNING", "ADMIN_MAINTENANCE", "OTHER"])
    .optional()
    .describe("Updated category"),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]).optional().describe("Updated priority"),
  estimatedMinutes: z.number().int().min(1).max(720).optional().describe("Updated estimated duration in minutes"),
  expectedOutcome: z.string().optional().describe("Updated definition of done"),
  visibility: z.enum(["PRIVATE", "MUTUAL"]).optional().describe("Updated visibility"),
});

export async function handleUpdateCommitment(args: z.infer<typeof updateCommitmentSchema>) {
  const { id, ...updates } = args;
  const updated = await client.patch<CommitmentDto>(`/api/v1/commitments/${id}`, updates);

  return {
    content: [
      {
        type: "text" as const,
        text: `✏️ **Commitment Updated**\n- **Title**: ${updated.title}\n- **ID**: \`${updated.id}\`\n- **Duration**: ${updated.estimatedMinutes}m | Priority: ${updated.priority}\n- **Status**: ${updated.status}`,
      },
    ],
    structuredData: updated,
  };
}

export const completeCommitmentSchema = z.object({
  id: z.string().uuid("Invalid commitment UUID").describe("The UUID of the commitment to complete"),
});

export async function handleCompleteCommitment(args: z.infer<typeof completeCommitmentSchema>) {
  const completed = await client.patch<CommitmentDto>(`/api/v1/commitments/${args.id}/complete`);

  return {
    content: [
      {
        type: "text" as const,
        text: `🎉 **Commitment Kept!**\n- **Title**: ${completed.title}\n- **ID**: \`${completed.id}\`\n- **Status**: ${completed.status}\n- **Completed At**: ${completed.completedAt || new Date().toISOString()}`,
      },
    ],
    structuredData: completed,
  };
}

export const postponeCommitmentSchema = z.object({
  id: z.string().uuid("Invalid commitment UUID").describe("The UUID of the commitment to postpone"),
  newDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
    .describe("Target date to reschedule to (YYYY-MM-DD)"),
  reason: z
    .string()
    .optional()
    .describe("Reason for postponement (logged to cognitive debt ledger)"),
});

export async function handlePostponeCommitment(args: z.infer<typeof postponeCommitmentSchema>) {
  const result = await client.post<CommitmentDto>(`/api/v1/commitments/${args.id}/postpone`, {
    newDate: args.newDate,
    reason: args.reason,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: `⏩ **Commitment Postponed to ${args.newDate}**\n- **Title**: ${result.title}\n- **New ID**: \`${result.id}\`\n- **Postponement Count**: ${result.postponementCount || 1}x\n${args.reason ? `- **Reason Logged**: _"${args.reason}"_\n` : ""}`,
      },
    ],
    structuredData: result,
  };
}
