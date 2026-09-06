# @aazdoh/mcp (AazDoh MCP Server)

Official **Model Context Protocol (MCP)** server for [AazDoh](https://aazdoh.com) — the AI accountability copilot for daily commitments, cognitive telemetry, and peer execution.

---

## ⚡ Quick Start

### 1. In Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "aazdoh": {
      "command": "npx",
      "args": ["-y", "aazdoh-mcp"],
      "env": {
        "AAZDOH_API_KEY": "aazdoh_live_your_key_here",
        "AAZDOH_API_URL": "https://aazdoh-api.onrender.com"
      }
    }
  }
}
```

### 2. In Cursor (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "aazdoh": {
      "command": "npx",
      "args": ["-y", "aazdoh-mcp"],
      "env": {
        "AAZDOH_API_KEY": "aazdoh_live_your_key_here",
        "AAZDOH_API_URL": "https://aazdoh-api.onrender.com"
      }
    }
  }
}
```

---

## 🛠️ Available Agent Tools

- `get_today_plan`: Fetch daily commitment schedule, progress summary, and cognitive workload.
- `create_commitment`: Lock in a new focus task or routine errand with estimated duration and definition of done.
- `update_commitment`: Update details of an existing commitment.
- `complete_commitment`: Mark a commitment as kept and completed.
- `postpone_commitment`: Postpone/reschedule an active commitment to a future date with reason & lineage tracking.
- `stress_test_plan`: AI Chief of Staff 60-second plan feasibility stress-test with risk score.
- `get_telemetry_stats`: Retrieve cognitive telemetry, historical velocity, and streak metrics.
- `detect_excuse`: AI Anti-Self-Deception Mirror: Evaluate excuses against historical receipts.
- `get_discussion_thread`: Fetch peer accountability discussion messages.
- `send_partner_update`: Post an update or proof of completion to a commitment's thread.
