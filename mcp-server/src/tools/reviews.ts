import { z } from "zod";
import { client } from "../client.js";

export interface ReviewResponseDto {
  id: string;
  commitmentId: string;
  status: "COMPLETED" | "MISSED" | "PARTIALLY_COMPLETED";
  failureReason?: "FORGOT" | "UNDERESTIMATED" | "DISTRACTED" | "BLOCKED" | "DID_NOT_PRIORITIZE" | "UNEXPECTED_SITUATION" | "OTHER";
  reflection?: string;
  nextAction?: "MOVE_TO_TOMORROW" | "RESCHEDULE" | "BREAK_DOWN" | "DROP";
  rescheduleDate?: string;
  createdAt?: string;
}

export const submitReviewSchema = z.object({
  commitmentId: z.string().uuid("Invalid commitment UUID").describe("UUID of the commitment being reviewed"),
  status: z
    .enum(["COMPLETED", "MISSED", "PARTIALLY_COMPLETED"])
    .describe("Execution outcome of the commitment"),
  failureReason: z
    .enum(["FORGOT", "UNDERESTIMATED", "DISTRACTED", "BLOCKED", "DID_NOT_PRIORITIZE", "UNEXPECTED_SITUATION", "OTHER"])
    .optional()
    .describe("Primary root-cause reason if missed or partially completed"),
  reflection: z
    .string()
    .max(500, "Reflection must not exceed 500 characters")
    .optional()
    .describe("Honest retrospective or notes on what happened and what to change next time"),
  nextAction: z
    .enum(["MOVE_TO_TOMORROW", "RESCHEDULE", "BREAK_DOWN", "DROP"])
    .optional()
    .describe("Next corrective step for missed commitment"),
  rescheduleDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD")
    .optional()
    .describe("Target date if nextAction is RESCHEDULE"),
});

export async function handleSubmitReview(args: z.infer<typeof submitReviewSchema>) {
  const { commitmentId, ...body } = args;
  const review = await client.post<ReviewResponseDto>(
    `/api/v1/commitments/${commitmentId}/review`,
    body
  );

  const lines = [
    `# 🪞 Daily Review Submitted`,
    `- **Commitment ID**: \`${review.commitmentId}\``,
    `- **Outcome**: \`${review.status}\``,
  ];

  if (review.failureReason) {
    lines.push(`- **Failure Factor**: \`${review.failureReason}\``);
  }
  if (review.nextAction) {
    lines.push(`- **Next Action**: \`${review.nextAction}\`${review.rescheduleDate ? ` -> ${review.rescheduleDate}` : ""}`);
  }
  if (review.reflection) {
    lines.push(`\n**Reflection Notes**:`);
    lines.push(`> "${review.reflection}"`);
  }

  return {
    content: [
      {
        type: "text" as const,
        text: lines.join("\n"),
      },
    ],
    structuredData: review,
  };
}

export const getCommitmentReviewSchema = z.object({
  commitmentId: z.string().uuid("Invalid commitment UUID").describe("UUID of the commitment to inspect review for"),
});

export async function handleGetCommitmentReview(args: z.infer<typeof getCommitmentReviewSchema>) {
  const review = await client.get<ReviewResponseDto>(
    `/api/v1/commitments/${args.commitmentId}/review`
  );

  const lines = [
    `# 🪞 Commitment Review Record`,
    `- **Commitment ID**: \`${review.commitmentId}\``,
    `- **Outcome**: \`${review.status}\``,
  ];

  if (review.failureReason) {
    lines.push(`- **Failure Factor**: \`${review.failureReason}\``);
  }
  if (review.nextAction) {
    lines.push(`- **Next Action**: \`${review.nextAction}\`${review.rescheduleDate ? ` -> ${review.rescheduleDate}` : ""}`);
  }
  if (review.reflection) {
    lines.push(`\n**Reflection Notes**:`);
    lines.push(`> "${review.reflection}"`);
  }

  return {
    content: [
      {
        type: "text" as const,
        text: lines.join("\n"),
      },
    ],
    structuredData: review,
  };
}
