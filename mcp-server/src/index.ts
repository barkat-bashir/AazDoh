#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getConfig } from "./config.js";
import {
  getTodayPlanSchema,
  handleGetTodayPlan,
  createCommitmentSchema,
  handleCreateCommitment,
  updateCommitmentSchema,
  handleUpdateCommitment,
  completeCommitmentSchema,
  handleCompleteCommitment,
  postponeCommitmentSchema,
  handlePostponeCommitment,
  reopenCommitmentSchema,
  handleReopenCommitment,
  deleteCommitmentSchema,
  handleDeleteCommitment,
  getCommitmentsRangeSchema,
  handleGetCommitmentsRange,
} from "./tools/commitments.js";
import {
  stressTestPlanSchema,
  handleStressTestPlan,
  getTelemetryStatsSchema,
  handleGetTelemetryStats,
  detectExcuseSchema,
  handleDetectExcuse,
  getAiInsightsSchema,
  handleGetAiInsights,
  applyOptimizedPlanSchema,
  handleApplyOptimizedPlan,
  reviewMissedCommitmentSchema,
  handleReviewMissedCommitment,
} from "./tools/telemetry.js";
import {
  getDiscussionThreadSchema,
  handleGetDiscussionThread,
  sendPartnerUpdateSchema,
  handleSendPartnerUpdate,
} from "./tools/discussions.js";
import {
  submitReviewSchema,
  handleSubmitReview,
  getCommitmentReviewSchema,
  handleGetCommitmentReview,
} from "./tools/reviews.js";
import {
  getPartnershipsSchema,
  handleGetPartnerships,
  getPartnerFeedSchema,
  handleGetPartnerFeed,
} from "./tools/partnerships.js";

// Initialize Server Configuration
const config = getConfig();

// Create the MCP Server Instance
const server = new McpServer({
  name: "aazdoh-mcp",
  version: "1.0.1",
});

// 1. Tool: get_today_plan
server.tool(
  "get_today_plan",
  "Fetch daily commitment schedule, progress summary, and cognitive workload for today or a specific date.",
  getTodayPlanSchema.shape,
  async (args) => {
    try {
      return await handleGetTodayPlan(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error fetching plan: ${err.message}` }],
      };
    }
  }
);

// 2. Tool: create_commitment
server.tool(
  "create_commitment",
  "Lock in a new daily commitment (focus task, deep work sprint, or routine errand) with estimated duration and definition of done.",
  createCommitmentSchema.shape,
  async (args) => {
    try {
      return await handleCreateCommitment(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error creating commitment: ${err.message}` }],
      };
    }
  }
);

// 3. Tool: update_commitment
server.tool(
  "update_commitment",
  "Update details of an existing commitment (e.g. adjust title, duration estimate, priority, or category).",
  updateCommitmentSchema.shape,
  async (args) => {
    try {
      return await handleUpdateCommitment(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error updating commitment: ${err.message}` }],
      };
    }
  }
);

// 4. Tool: complete_commitment
server.tool(
  "complete_commitment",
  "Mark a commitment as kept and completed, updating streaks and daily completion metrics.",
  completeCommitmentSchema.shape,
  async (args) => {
    try {
      return await handleCompleteCommitment(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error completing commitment: ${err.message}` }],
      };
    }
  }
);

// 5. Tool: postpone_commitment
server.tool(
  "postpone_commitment",
  "Postpone/reschedule an active commitment to a future date, logging the reason and incrementing cognitive debt tracking.",
  postponeCommitmentSchema.shape,
  async (args) => {
    try {
      return await handlePostponeCommitment(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error postponing commitment: ${err.message}` }],
      };
    }
  }
);

// 6. Tool: reopen_commitment
server.tool(
  "reopen_commitment",
  "Reopen a postponed commitment back to today's active pending list.",
  reopenCommitmentSchema.shape,
  async (args) => {
    try {
      return await handleReopenCommitment(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error reopening commitment: ${err.message}` }],
      };
    }
  }
);

// 7. Tool: delete_commitment
server.tool(
  "delete_commitment",
  "Delete or drop a commitment from your schedule.",
  deleteCommitmentSchema.shape,
  async (args) => {
    try {
      return await handleDeleteCommitment(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error deleting commitment: ${err.message}` }],
      };
    }
  }
);

// 8. Tool: get_commitments_range
server.tool(
  "get_commitments_range",
  "Fetch commitments scheduled across a multi-day or weekly date range.",
  getCommitmentsRangeSchema.shape,
  async (args) => {
    try {
      return await handleGetCommitmentsRange(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error fetching commitments range: ${err.message}` }],
      };
    }
  }
);

// 9. Tool: stress_test_plan
server.tool(
  "stress_test_plan",
  "Run AI Chief of Staff 60-second plan feasibility stress-test. Calculates risk index and provides de-risked proposals.",
  stressTestPlanSchema.shape,
  async (args) => {
    try {
      return await handleStressTestPlan(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error during plan stress-test: ${err.message}` }],
      };
    }
  }
);

// 10. Tool: apply_optimized_plan
server.tool(
  "apply_optimized_plan",
  "Apply AI-optimized task splits, trims, and adjustments directly to today's commitments.",
  applyOptimizedPlanSchema.shape,
  async (args) => {
    try {
      return await handleApplyOptimizedPlan(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error applying optimized plan: ${err.message}` }],
      };
    }
  }
);

// 11. Tool: get_ai_insights
server.tool(
  "get_ai_insights",
  "Fetch synthesized AI behavioral patterns, cognitive bottleneck diagnosis, and personalized tactical habits.",
  getAiInsightsSchema.shape,
  async (args) => {
    try {
      return await handleGetAiInsights(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error fetching AI insights: ${err.message}` }],
      };
    }
  }
);

// 12. Tool: review_missed_commitment
server.tool(
  "review_missed_commitment",
  "Run an instant AI post-mortem on a missed or stalled commitment to pinpoint friction and pivots.",
  reviewMissedCommitmentSchema.shape,
  async (args) => {
    try {
      return await handleReviewMissedCommitment(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error reviewing missed commitment: ${err.message}` }],
      };
    }
  }
);

// 13. Tool: detect_excuse
server.tool(
  "detect_excuse",
  "AI Anti-Self-Deception Mirror: Evaluate an excuse or rationalization against historical receipts to detect avoidance patterns.",
  detectExcuseSchema.shape,
  async (args) => {
    try {
      return await handleDetectExcuse(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error analyzing excuse: ${err.message}` }],
      };
    }
  }
);

// 14. Tool: get_telemetry_stats
server.tool(
  "get_telemetry_stats",
  "Retrieve cognitive telemetry, historical velocity, streak metrics, and deep focus time stats.",
  getTelemetryStatsSchema.shape,
  async (args) => {
    try {
      return await handleGetTelemetryStats(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error fetching telemetry: ${err.message}` }],
      };
    }
  }
);

// 15. Tool: submit_review
server.tool(
  "submit_review",
  "Submit end-of-day commitment review, retrospective reflection, and failure root-cause categorization.",
  submitReviewSchema.shape,
  async (args) => {
    try {
      return await handleSubmitReview(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error submitting review: ${err.message}` }],
      };
    }
  }
);

// 16. Tool: get_commitment_review
server.tool(
  "get_commitment_review",
  "Inspect the submitted review and reflection record for a commitment.",
  getCommitmentReviewSchema.shape,
  async (args) => {
    try {
      return await handleGetCommitmentReview(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error fetching commitment review: ${err.message}` }],
      };
    }
  }
);

// 17. Tool: get_partnerships
server.tool(
  "get_partnerships",
  "List active accountability partnerships and peer connection details.",
  getPartnershipsSchema.shape,
  async (args) => {
    try {
      return await handleGetPartnerships(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error fetching partnerships: ${err.message}` }],
      };
    }
  }
);

// 18. Tool: get_partner_feed
server.tool(
  "get_partner_feed",
  "View an accountability partner's daily commitment feed, completion progress, and AI risk brief.",
  getPartnerFeedSchema.shape,
  async (args) => {
    try {
      return await handleGetPartnerFeed(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error fetching partner feed: ${err.message}` }],
      };
    }
  }
);

// 19. Tool: get_discussion_thread
server.tool(
  "get_discussion_thread",
  "Fetch peer accountability discussion messages and proof-of-work updates for a commitment.",
  getDiscussionThreadSchema.shape,
  async (args) => {
    try {
      return await handleGetDiscussionThread(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error fetching discussion thread: ${err.message}` }],
      };
    }
  }
);

// 20. Tool: send_partner_update
server.tool(
  "send_partner_update",
  "Post an update, proof of completion, or question to a commitment's accountability partner discussion thread.",
  sendPartnerUpdateSchema.shape,
  async (args) => {
    try {
      return await handleSendPartnerUpdate(args);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error sending partner update: ${err.message}` }],
      };
    }
  }
);

// MCP Prompts for External AI Clients
server.prompt(
  "aazdoh_agent_persona",
  "Tough-love, anti-sycophancy system prompt for AazDoh task execution and cognitive governance",
  {},
  () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are the AazDoh Executive Autonomous Agent.
Your job is ruthless daily execution and strict cognitive workload protection.
Rules:
1. Anti-Sycophancy: Never validate overambitious schedules (e.g. >7 hours deep work/day).
2. Autonomous Execution: Proactively execute actions (create, complete, postpone) using available tools.
3. Brevity: Keep responses punchy, direct, and under 120 words. No corporate fluff or fake cheer.
4. Kashmiri Walnut Aesthetic: Clear, grounded, focused output.`,
        },
      },
    ],
  })
);

server.prompt(
  "stress_test_audit",
  "Audit a user's daily commitment workload against cognitive capacity limits",
  {
    targetDate: z.string().describe("Date in YYYY-MM-DD format (defaults to today)"),
  },
  ({ targetDate }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please fetch the commitments for ${targetDate || "today"} using get_today_plan, run stress_test_plan, and give me an objective 80-word executive audit: Total minutes, cognitive capacity warning if >360m, and prioritized cuts if overloaded.`,
        },
      },
    ],
  })
);

server.prompt(
  "evening_reflection_debrief",
  "Conduct an honest end-of-day commitment retrospective, failure categorization, and momentum review",
  {},
  () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please fetch today's plan using get_today_plan, check completed vs missed commitments, and conduct an end-of-day reflection. If any commitments were missed, ask for the real reason, run detect_excuse, and submit the review with submit_review. Keep it strictly focused and under 100 words.`,
        },
      },
    ],
  })
);

server.prompt(
  "excuse_audit",
  "Evaluate a stated excuse for a missed commitment against behavioral patterns and provide ruthless feedback",
  {
    commitmentTitle: z.string().describe("The commitment that was missed or postponed"),
    statedReason: z.string().describe("The user's stated explanation or excuse"),
  },
  ({ commitmentTitle, statedReason }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `The user missed/postponed the commitment '${commitmentTitle}' with the stated reason: "${statedReason}". Call detect_excuse on this reason, categorize the validity, and deliver an objective, high-candor critique on whether this is an excuse or a genuine blocker.`,
        },
      },
    ],
  })
);

server.prompt(
  "generate_partner_digest",
  "Synthesize an objective progress overview and risk diagnostic for accountability partners",
  {},
  () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please fetch active partnerships using get_partnerships and view today's progress using get_partner_feed. Synthesize an objective, punchy 60-word accountability digest: partner name, completion rate, key wins, and any flagged cognitive risks.`,
        },
      },
    ],
  })
);

// Start the Stdio Server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[AazDoh MCP] Server running on stdio (Target Backend: ${config.apiUrl})`);
}

runServer().catch((error) => {
  console.error("[AazDoh MCP Fatal Error]:", error);
  process.exit(1);
});
