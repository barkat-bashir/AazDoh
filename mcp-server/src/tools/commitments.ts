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
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "POSTPONED" | "CANCELLED";
  visibility: "PRIVATE" | "SHARED_WITH_PARTNER" | "MUTUAL";
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

  let commitments = await client.get<CommitmentDto[]>("/api/v1/commitments/today", params);

  if (args.filter && args.filter !== "ALL") {
    commitments = commitments.filter((c) => c.status === args.filter);
  }
  
  const totalMinutes = commitments.reduce((acc, c) => acc + (c.estimatedMinutes || 0), 0);
  const completed = commitments.filter((c) => c.status === "COMPLETED").length;
  const active = commitments.filter((c) => c.status === "PENDING" || c.status === "ACTIVE").length;

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
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must not exceed 255 characters")
    .describe("Clear, action-oriented commitment title"),
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
  commitmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
    .optional()
    .describe("Date to schedule for (YYYY-MM-DD). Alias for targetDate."),
  expectedOutcome: z
    .string()
    .max(500, "Expected outcome must not exceed 500 characters")
    .optional()
    .describe("Observable Definition of Done / Expected outcome to prevent ambiguity"),
  visibility: z
    .enum(["PRIVATE", "SHARED_WITH_PARTNER", "MUTUAL"])
    .default("PRIVATE")
    .describe("Whether this commitment is private or shared with peer partner"),
  partnerId: z
    .string()
    .uuid()
    .optional()
    .describe("Specific accountability partner UUID if visibility is shared"),
  targetPartnerId: z
    .string()
    .uuid()
    .optional()
    .describe("Specific accountability partner UUID. Alias for partnerId"),
});

export async function handleCreateCommitment(args: z.infer<typeof createCommitmentSchema>) {
  const targetDate = args.commitmentDate || args.targetDate || new Date().toISOString().split("T")[0];
  const visibility = args.visibility === "MUTUAL" ? "SHARED_WITH_PARTNER" : (args.visibility || "PRIVATE");
  const targetPartnerId = args.targetPartnerId || args.partnerId;

  const payload = {
    title: args.title,
    category: args.category || "DEEP_WORK",
    priority: args.priority || "HIGH",
    estimatedMinutes: args.estimatedMinutes || 30,
    commitmentDate: targetDate,
    expectedOutcome: args.expectedOutcome,
    visibility,
    targetPartnerId,
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
  title: z.string().max(255, "Title must not exceed 255 characters").optional().describe("Updated title"),
  category: z
    .enum(["DEEP_WORK", "ROUTINE", "STRATEGIC_PLANNING", "COMMUNICATION", "FITNESS_HEALTH", "LEARNING", "ADMIN_MAINTENANCE", "OTHER"])
    .optional()
    .describe("Updated category"),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]).optional().describe("Updated priority"),
  estimatedMinutes: z.number().int().min(1).max(720).optional().describe("Updated estimated duration in minutes"),
  expectedOutcome: z.string().max(500, "Expected outcome must not exceed 500 characters").optional().describe("Updated definition of done"),
  visibility: z.enum(["PRIVATE", "SHARED_WITH_PARTNER", "MUTUAL"]).optional().describe("Updated visibility"),
  commitmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD").optional().describe("Updated date (YYYY-MM-DD)"),
});

export async function handleUpdateCommitment(args: z.infer<typeof updateCommitmentSchema>) {
  const { id, visibility, ...updates } = args;
  const payload: Record<string, unknown> = { ...updates };
  if (visibility) {
    payload.visibility = visibility === "MUTUAL" ? "SHARED_WITH_PARTNER" : visibility;
  }
  const updated = await client.patch<CommitmentDto>(`/api/v1/commitments/${id}`, payload);

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
  const completed = await client.post<CommitmentDto>(`/api/v1/commitments/${args.id}/complete`);

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
    .max(500, "Reason must not exceed 500 characters")
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

export const reopenCommitmentSchema = z.object({
  id: z.string().uuid("Invalid commitment UUID").describe("The UUID of the postponed commitment to reopen for today"),
});

export async function handleReopenCommitment(args: z.infer<typeof reopenCommitmentSchema>) {
  const reopened = await client.post<CommitmentDto>(`/api/v1/commitments/${args.id}/reopen`);

  return {
    content: [
      {
        type: "text" as const,
        text: `🔄 **Commitment Reopened for Today!**\n- **Title**: ${reopened.title}\n- **ID**: \`${reopened.id}\`\n- **Status**: ${reopened.status}\n- **Duration**: ${reopened.estimatedMinutes}m | Priority: ${reopened.priority}`,
      },
    ],
    structuredData: reopened,
  };
}

export const deleteCommitmentSchema = z.object({
  id: z.string().uuid("Invalid commitment UUID").describe("The UUID of the commitment to delete/drop"),
});

export async function handleDeleteCommitment(args: z.infer<typeof deleteCommitmentSchema>) {
  await client.delete<void>(`/api/v1/commitments/${args.id}`);

  return {
    content: [
      {
        type: "text" as const,
        text: `🗑️ **Commitment Deleted**\n- **ID**: \`${args.id}\``,
      },
    ],
    structuredData: { id: args.id, deleted: true },
  };
}

export const getCommitmentsRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD").describe("Start date (YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD").describe("End date (YYYY-MM-DD)"),
});

export async function handleGetCommitmentsRange(args: z.infer<typeof getCommitmentsRangeSchema>) {
  const list = await client.get<CommitmentDto[]>("/api/v1/commitments/range", {
    startDate: args.startDate,
    endDate: args.endDate,
  });

  const lines = [
    `# 📅 Commitments Schedule (${args.startDate} to ${args.endDate})`,
    `**Total Scheduled**: ${list.length} commitments\n`,
  ];

  if (list.length === 0) {
    lines.push("No commitments scheduled across this date range.");
  } else {
    for (const c of list) {
      const statusIcon = c.status === "COMPLETED" ? "✅" : c.status === "POSTPONED" ? "⏩" : "⭕";
      lines.push(`${statusIcon} **${c.commitmentDate}**: **${c.title}** (${c.estimatedMinutes}m) [${c.priority}] - ID: \`${c.id}\` (${c.status})`);
    }
  }

  return {
    content: [
      {
        type: "text" as const,
        text: lines.join("\n"),
      },
    ],
    structuredData: list,
  };
}

