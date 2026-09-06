# @aazdoh/mcp (AazDoh MCP Server)

Official **Model Context Protocol (MCP)** server for [AazDoh](https://aazdoh.com) — the AI-Powered Peer & Self Accountability Platform.

---

## ⚡ Quick Start

### 1. In Claude Desktop / Antigravity / Cursor
```json
{
  "mcpServers": {
    "aazdoh": {
      "command": "npx",
      "args": ["-y", "aazdoh-mcp@latest"],
      "env": {
        "AAZDOH_API_KEY": "aazdoh_live_your_key_here",
        "AAZDOH_API_URL": "https://aazdoh.onrender.com"
      }
    }
  }
}
```

---

## 🛠️ Complete Suite of Available Tools

### 1. Daily Commitment Execution
- `get_today_plan`: Fetch daily commitment schedule, progress summary, and cognitive workload.
- `create_commitment`: Lock in a new focus task, deep work sprint, or routine errand with duration and definition of done.
- `update_commitment`: Update details of an existing commitment (e.g. adjust title, duration, priority, or category).
- `complete_commitment`: Mark a commitment as kept and completed, updating velocity and streaks.
- `postpone_commitment`: Postpone/reschedule an active commitment to a future date with reason & cognitive debt tracking.
- `reopen_commitment`: Reopen a postponed commitment back to today's active pending list.
- `delete_commitment`: Delete or drop a commitment from your schedule.
- `get_commitments_range`: Fetch commitments scheduled across a multi-day or weekly date range.

### 2. AI Accountability & Behavioral Intelligence
- `stress_test_plan`: AI Chief of Staff 60-second plan feasibility stress-test with risk index and de-risking proposals.
- `apply_optimized_plan`: Apply 1-click AI-optimized task splits, trims, and adjustments directly to today's commitments.
- `get_ai_insights`: Fetch synthesized AI behavioral patterns, cognitive bottleneck diagnosis, and personalized tactical habits.
- `review_missed_commitment`: Run an instant AI post-mortem on a missed commitment to pinpoint friction and pivots.
- `detect_excuse`: AI Anti-Self-Deception Mirror: Evaluate excuses against historical receipts.
- `get_telemetry_stats`: Retrieve cognitive telemetry, historical velocity, streak metrics, and deep focus time stats.

### 3. Daily Reflection & Reviews
- `submit_review`: Submit end-of-day commitment review, retrospective reflection, and failure root-cause categorization.
- `get_commitment_review`: Inspect the submitted review and reflection record for a commitment.

### 4. Human Accountability Partners & Discussions
- `get_partnerships`: List active accountability partnerships and peer connection details.
- `get_partner_feed`: View an accountability partner's daily commitment feed, completion progress, and AI risk brief.
- `get_discussion_thread`: Fetch peer accountability discussion messages and proof-of-work updates for a commitment.
- `send_partner_update`: Post an update, proof of completion, or question to a commitment's accountability thread.
