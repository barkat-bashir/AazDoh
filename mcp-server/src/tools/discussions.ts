import { z } from "zod";
import { client } from "../client.js";

export interface DiscussionMessageDto {
  id: string;
  authorId: string;
  authorFullName: string;
  message: string;
  createdAt: string;
}

export interface DiscussionResponseDto {
  id: string;
  commitmentId: string;
  commitmentTitle?: string;
  ownerId?: string;
  ownerFullName?: string;
  messages: DiscussionMessageDto[];
}

export const getDiscussionThreadSchema = z.object({
  commitmentId: z.string().uuid().describe("UUID of the commitment"),
});

export async function handleGetDiscussionThread(args: z.infer<typeof getDiscussionThreadSchema>) {
  const discussion = await client.get<DiscussionResponseDto>(
    `/api/v1/commitments/${args.commitmentId}/discussion`
  );

  const lines = [
    `# 💬 Partner Discussion: "${discussion.commitmentTitle || "Commitment"}"`,
    `**Commitment ID**: \`${discussion.commitmentId}\`\n`,
  ];

  if (!discussion.messages || discussion.messages.length === 0) {
    lines.push("No messages exchanged yet in this thread.");
  } else {
    for (const msg of discussion.messages) {
      const sender = msg.authorFullName || "Partner";
      const body = msg.message || "";
      const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : "";
      lines.push(`**${sender}** (${timeStr}):`);
      lines.push(`> ${body}\n`);
    }
  }

  return {
    content: [
      {
        type: "text" as const,
        text: lines.join("\n"),
      },
    ],
    structuredData: discussion,
  };
}

export const sendPartnerUpdateSchema = z.object({
  commitmentId: z.string().uuid().describe("UUID of the commitment to discuss"),
  message: z
    .string()
    .min(1)
    .max(500, "Message must not exceed 500 characters")
    .describe("The message or proof-of-work update to post to the thread"),
});

export async function handleSendPartnerUpdate(args: z.infer<typeof sendPartnerUpdateSchema>) {
  const msg = await client.post<DiscussionMessageDto>(
    `/api/v1/commitments/${args.commitmentId}/discussion/messages`,
    { message: args.message }
  );

  const sender = msg.authorFullName || "You";
  const body = msg.message || args.message;

  return {
    content: [
      {
        type: "text" as const,
        text: `📤 **Message Posted to Commitment Thread**\n- **Sender**: ${sender}\n- **Time**: ${msg.createdAt || new Date().toISOString()}\n- **Message**: "${body}"`,
      },
    ],
    structuredData: msg,
  };
}
