import { z } from "zod";
import { client } from "../client.js";
import { CommitmentDto } from "./commitments.js";

export interface PartnershipResponseDto {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "TERMINATED";
  partnershipType: "MUTUAL" | "ONE_WAY_SPONSOR";
  sharePartnerCommitments: boolean;
  shareRequesterCommitments: boolean;
  createdAt: string;
}

export interface PartnerDailyOverviewDto {
  partnerId: string;
  partnerName: string;
  date: string;
  sharedCommitments: CommitmentDto[];
  totalCommitments: number;
  completedCommitments: number;
  completionRate: number;
  aiRiskScore?: number;
  aiRiskLevel?: string;
  aiDiagnosticSummary?: string;
  plannedHours?: number;
  capacityHours?: number;
  isOneWaySponsor?: boolean;
}

export const getPartnershipsSchema = z.object({});

export async function handleGetPartnerships(_args: z.infer<typeof getPartnershipsSchema>) {
  const list = await client.get<PartnershipResponseDto[]>("/api/v1/partnerships");

  const lines = [`# 👥 Active Accountability Partnerships`];

  if (!list || list.length === 0) {
    lines.push("No active peer partnerships yet.");
  } else {
    for (const p of list) {
      lines.push(`- **${p.partnerName}** (${p.partnerEmail}) | Status: \`${p.status}\` | Type: \`${p.partnershipType}\``);
      lines.push(`  Partner User ID: \`${p.partnerId}\` | Partnership ID: \`${p.id}\``);
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

export const getPartnerFeedSchema = z.object({
  partnerUserId: z.string().uuid("Invalid partner UUID").describe("UUID of the partner user"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
    .optional()
    .describe("Target date to view partner schedule for (YYYY-MM-DD). Defaults to today."),
});

export async function handleGetPartnerFeed(args: z.infer<typeof getPartnerFeedSchema>) {
  const params: Record<string, string> = {};
  if (args.date) params.date = args.date;

  const overview = await client.get<PartnerDailyOverviewDto>(
    `/api/v1/partnerships/partner/${args.partnerUserId}/commitments`,
    params
  );

  const completionPct = Math.round(overview.completionRate || 0);
  const lines = [
    `# 👥 Peer Commitment Feed: **${overview.partnerName}** (${overview.date})`,
    `**Progress**: ${overview.completedCommitments} / ${overview.totalCommitments} kept (${completionPct}% completion rate)\n`,
  ];

  if (overview.aiRiskLevel) {
    lines.push(`**Partner AI Risk Brief**: \`${overview.aiRiskLevel}\` (${overview.aiRiskScore || 0}/100 Risk Index)`);
    if (overview.aiDiagnosticSummary) {
      lines.push(`_${overview.aiDiagnosticSummary}_\n`);
    }
  }

  if (!overview.sharedCommitments || overview.sharedCommitments.length === 0) {
    lines.push("No shared commitments visible for this date.");
  } else {
    lines.push("### Shared Commitments:");
    for (const c of overview.sharedCommitments) {
      const statusIcon = c.status === "COMPLETED" ? "✅" : c.status === "POSTPONED" ? "⏩" : "⭕";
      lines.push(`${statusIcon} **${c.title}** (${c.estimatedMinutes}m) [${c.priority}] - ID: \`${c.id}\``);
      if (c.expectedOutcome) {
        lines.push(`   Definition of Done: _"${c.expectedOutcome}"_`);
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
    structuredData: overview,
  };
}
