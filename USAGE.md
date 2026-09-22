# 📖 Complete User Guide: AazDoh CLI & MCP

> **Empirical Behavioral Operating System for High-Agency Builders**  
> *Commit • Do • Report • Reflect — Zero Dopamine Streaks, Pure Operational Integrity.*

---

## 📑 Table of Contents

1. [🔑 Obtaining Your API Key](#-obtaining-your-api-key)
2. [💻 Part 1: AazDoh CLI Agent (`aazdoh-cli` / `az`)](#-part-1-aazdoh-cli-agent-aazdoh-cli--az)
   - [Installation & Setup](#1-installation--setup)
   - [Zero-Friction Terminal Cockpit (`az`)](#2-zero-friction-terminal-cockpit-az)
   - [Interactive Slash Commands Reference](#3-interactive-slash-commands-reference)
   - [Natural Language Task Execution](#4-natural-language-task-execution)
   - [Fast Interactive Task Check-off (`az done` / `az check`)](#5-fast-interactive-task-check-off-az-done--az-check)
   - [One-Shot Scriptable Commands](#6-one-shot-scriptable-commands)
   - [Configuration & Credential Hierarchy](#7-configuration--credential-hierarchy)
3. [🤖 Part 2: Model Context Protocol (`aazdoh-mcp`)](#-part-2-model-context-protocol-aazdoh-mcp)
   - [Supported AI Environments](#1-supported-ai-environments)
   - [IDE Configuration Snippets](#2-ide-configuration-snippets)
   - [Complete Suite of 18 Native MCP Tools](#3-complete-suite-of-18-native-mcp-tools)
   - [AI Prompting Recipes & Workflows](#4-ai-prompting-recipes--workflows)
4. [⚡ Part 3: Daily Developer Operational Playbook](#-part-3-daily-developer-operational-playbook)
5. [❓ Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🔑 Obtaining Your API Key

Both the **CLI** and the **MCP Server** authenticate via your personal AazDoh API key (`aazdoh_live_...`).

1. Log into your AazDoh instance at [https://aazdoh.zblslabs.online/](https://aazdoh.zblslabs.online/) (or your local `http://localhost:3000`).
2. Navigate to **Settings** (or user profile).
3. Under **Developer API Keys**, click **Generate New API Key**.
4. Copy the secret key (`aazdoh_live_...`). Keep it safe.

---

## 💻 Part 1: AazDoh CLI Agent (`aazdoh-cli` / `az`)

The CLI brings the entire AazDoh cognitive engine directly to your command line.

### 1. Installation & Setup

```bash
# Install globally from npm (gives you both 'aazdoh' and 'az' commands)
npm install -g aazdoh-cli

# Authenticate once with your API key
az login -k aazdoh_live_your_api_key_here

# (Optional) Direct execution without installing:
npx aazdoh-cli
```

---

### 2. Zero-Friction Terminal Cockpit (`az`)

To eliminate the friction of getting kicked back to bash/PowerShell after every single command, simply type **`az`** (or **`aazdoh`**) with no arguments:

```bash
az
```

**What happens:**
1. Renders the ASCII Harud banner and authenticated user persona.
2. Automatically pre-fetches and renders **today's commitments table** with scheduled load stats.
3. Keeps the interactive prompt **`az>`** open so you can execute back-to-back actions without restarting the CLI.

```text
   ⚡ AAZDOH COGNITIVE ACCOUNTABILITY CLI
   Commit. Do. Report. Reflect. (Zero BS)

   Plan for: 2026-09-14 | User: Barkat [Persona: BALANCED]

┌──────────┬────────────────────────────────┬────────────┬──────────┬────────────────┬────────────────────────────┐
│ Status   │ Commitment Title               │ Duration   │ Priority │ Category       │ Expected Outcome           │
├──────────┼────────────────────────────────┼────────────┼──────────┼────────────────┼────────────────────────────┤
│ ⭕ PEND  │ Java Architecture Review       │ 60m        │ [HIGH]   │ 🎯 DEEP FOCUS  │ Core design approved       │
│ ⭕ PEND  │ Spring AI Token Streaming      │ 45m        │ [MED]    │ 🎯 DEEP FOCUS  │ SSE tests passing          │
│ ✅ DONE  │ Morning Routine & Planning     │ 30m        │ [HIGH]   │ ⚡ ROUTINE     │ Ready for deep work        │
└──────────┴────────────────────────────────┴────────────┴──────────┴────────────────┴────────────────────────────┘

   Summary: 1 Done | 2 Pending | 2.2h total scheduled (135m) • OPTIMAL

   Type instructions or commands (/today, /stress-test, /stats, /undo, /help, /exit):

az> 
```

---

### 3. Interactive Slash Commands Reference

Inside the interactive shell (`az>`), use these commands for instant actions:

| Slash Command | Alias | Description |
| :--- | :--- | :--- |
| `/today` | `/list` | Refreshes and renders today's commitments table and cognitive load summary. |
| `/stress-test` | `/stresstest` | Runs the 60-second plan feasibility diagnostic against your 7-day velocity baseline. |
| `/stats` | `/velocity` | Renders 7-day velocity metrics, consistency score, and focus hour distributions. |
| `/undo` | — | Instantly reverts the last AI agent mutation or state change. |
| `/help` | `/?` | Displays the command cheatsheet and natural language examples. |
| `/clear` | — | Clears the terminal screen and reprints the active daily cockpit. |
| `/exit` | `/quit`, `:q` | Exits the interactive session cleanly back to your system shell. |

---

### 4. Natural Language Task Execution

In the cockpit prompt (`az>`), simply speak naturally:

```text
az> finished Java Architecture Review with approved specs
   ⚡ Executed Actions:
   ✓ Completed Commitment: "Java Architecture Review"
   (Run '/undo' to revert)

az> add 45m deep focus on PostgreSQL connection pool tuning
   ⚡ Executed Actions:
   ✓ Created Commitment: "PostgreSQL connection pool tuning" (45m, DEEP_WORK)

az> postpone team sync prep to tomorrow morning
   ⚡ Executed Actions:
   ✓ Postponed Commitment: "team sync prep" -> 2026-09-15
```

---

### 5. Fast Interactive Task Check-off (`az done` / `az check`)

Mark commitments as completed with **zero LLM latency** via direct REST API execution:

```bash
# Interactive multi-select checkbox mode (Space to toggle, Enter to confirm)
az done
# (or aliases: az check, az complete)

# Quick direct keyword match (marks matching task completed immediately)
az done DSA
az check redis
```

---

### 6. One-Shot Scriptable Commands

For CI/CD pipelines, shell aliases, terminal multiplexers (tmux), or quick single-line executions:

```bash
# View today's plan and immediately return to shell
az today

# View today's plan and launch interactive checkboxes
az today -i

# View plan for a specific date
az today --date 2026-09-15

# One-shot natural language prompt
az "completed DSA trees with 4 problems solved"

# Run standalone 60-second plan stress test
az stress-test

# Run stress test with cognitive defense
az stress-test -d "Shipping critical hotfix before 2pm sync"

# Offline background focus timer (desktop toast notification on completion)
az focus 45m "PostgreSQL connection pool optimization"

# Inspect 7-day velocity
az stats
```

---

### 7. Configuration & Credential Hierarchy

AazDoh resolves credentials in the following priority:
1. CLI runtime flag: `-k <key>` / `-u <url>`
2. Environment variables: `AAZDOH_API_KEY` and `AAZDOH_API_URL`
3. Current working directory `.env` file
4. Global user config file: `~/.aazdoh/config.json` (created automatically by `az login`)

---

## 🤖 Part 2: Model Context Protocol (`aazdoh-mcp`)

The AazDoh MCP Server connects AI coding agents directly to your accountability system, transforming your IDE assistant into a proactive **AI Chief of Staff**.

### 1. Supported AI Environments

* **Antigravity IDE**
* **Cursor IDE**
* **Claude Desktop**
* **Windsurf / Cascade**
* **VS Code (Cline, Roo Code, Claude Dev)**

---

### 2. IDE Configuration Snippets

#### A. Antigravity IDE & Cursor (`.cursor/mcp.json` or `mcp_config.json`)

```json
{
  "mcpServers": {
    "aazdoh": {
      "command": "npx",
      "args": ["-y", "aazdoh-mcp@latest"],
      "env": {
        "AAZDOH_API_KEY": "aazdoh_live_your_api_key_here",
        "AAZDOH_API_URL": "https://aazdoh.onrender.com"
      }
    }
  }
}
```

#### B. Claude Desktop (`claude_desktop_config.json`)
* **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "aazdoh": {
      "command": "npx",
      "args": ["-y", "aazdoh-mcp@latest"],
      "env": {
        "AAZDOH_API_KEY": "aazdoh_live_your_api_key_here",
        "AAZDOH_API_URL": "https://aazdoh.onrender.com"
      }
    }
  }
}
```

---

### 3. Complete Suite of 18 Native MCP Tools

The MCP server exposes 18 specialized tools categorized by operational role:

```
                      ┌─────────────────────────────────────────┐
                      │            AazDoh MCP Server            │
                      └────────────────────┬────────────────────┘
                                           │
         ┌──────────────────┬──────────────┴─────┬──────────────────┐
         │                  │                    │                  │
┌────────▼────────┐ ┌───────▼────────┐ ┌─────────▼────────┐ ┌───────▼────────┐
│ Plan & Commit   │ │ AI Intelligence│ │ Daily Reflection │ │ Partner Feeds  │
│ 8 Tools         │ │ 6 Tools        │ │ 2 Tools          │ │ 4 Tools        │
└─────────────────┘ └────────────────┘ └──────────────────┘ └────────────────┘
```

#### 🎯 Category 1: Plan & Commitments (8 Tools)
1. **`get_today_plan`**: Fetches today's commitment list, progress metrics, and cognitive load summary.
2. **`create_commitment`**: Locks in a new commitment (`title`, `durationMinutes`, `category`, `priority`, `expectedOutcome`).
3. **`update_commitment`**: Modifies an existing commitment's details.
4. **`complete_commitment`**: Marks a commitment as kept and completed, updating velocity metrics.
5. **`postpone_commitment`**: Reschedules a commitment to a future date with reason and excuse tracking.
6. **`reopen_commitment`**: Moves a postponed commitment back into today's active pending list.
7. **`delete_commitment`**: Deletes or drops an unneeded commitment.
8. **`get_commitments_range`**: Retrieves commitments across a date range (`startDate` to `endDate`).

#### 🛡️ Category 2: AI Intelligence & Stress-Testing (6 Tools)
9. **`stress_test_plan`**: Runs the 60-second feasibility audit against historical capacity, returning overload risk index and rebalancing proposals.
10. **`apply_optimized_plan`**: Applies 1-click AI-suggested task splits, duration trims, and reschedules.
11. **`get_ai_insights`**: Retrieves synthesized behavioral patterns, friction bottlenecks, and tactical habits.
12. **`review_missed_commitment`**: Runs a post-mortem on missed commitments to diagnose initiation friction.
13. **`detect_excuse`**: Evaluates postponement rationalizations against historical excuse receipts.
14. **`get_telemetry_stats`**: Retrieves 7-day velocity, streak health, and focus duration distributions.

#### 🪞 Category 3: Daily Reflection & Reviews (2 Tools)
15. **`submit_review`**: Submits the daily evening reflection, score, and root-cause categorization.
16. **`get_commitment_review`**: Inspects the reflection review submitted for a specific commitment.

#### 🤝 Category 4: Peer Accountability & Discussion (4 Tools)
17. **`get_partnerships`**: Lists connected 1-to-1 accountability partners.
18. **`get_partner_feed`**: Fetches your partner's live daily commitments, completion status, and AI risk brief.
19. **`get_discussion_thread`**: Retrieves the in-context proof-of-work discussion thread on a commitment.
20. **`send_partner_update`**: Posts an update, Git commit proof, or blocker note to a commitment thread.

---

### 4. AI Prompting Recipes & Workflows

Once `aazdoh-mcp` is configured in your AI coding assistant, use these prompts to integrate accountability into your daily coding flow:

#### 🌅 Recipe 1: Morning Standup & Sanity Check
> *"Check my AazDoh today's plan using `get_today_plan`. If my scheduled cognitive load exceeds 4.5 hours, run `stress_test_plan` and help me prioritize the 2 highest-leverage deep focus tasks for our coding session."*

#### ⏱️ Recipe 2: Deep Focus Sprint Lock-In
> *"We're about to refactor the database connection pool. Lock in a 45m DEEP_WORK commitment in AazDoh titled 'PostgreSQL Pool Tuning' with high priority and an expected outcome of passing concurrency stress tests."*

#### ✅ Recipe 3: Task Completion & Partner Proof-of-Work
> *"We just fixed the token refresh race condition and all unit tests passed. Mark the authentication commitment complete in AazDoh and post a partner update to the thread with a summary of what we changed."*

#### 🪞 Recipe 4: Evening Retrospective
> *"Review today's completed vs missed commitments in AazDoh. Summarize our velocity and submit our daily reflection with insights on what caused friction during the afternoon block."*

---

## ⚡ Part 3: Daily Developer Operational Playbook

| Phase | Time | CLI Action (`az`) | AI IDE Action (MCP) |
| :--- | :--- | :--- | :--- |
| **Kick-off** | 08:30 AM | Run `az` $\rightarrow$ inspect load $\rightarrow$ `/stress-test` | Prompt: *"Inspect today's plan and review focus load."* |
| **Deep Work** | 09:30 AM | `az "started PostgreSQL indexing"` | Prompt: *"Lock in 45m deep focus commitment."* |
| **In Flow** | 02:00 PM | `az "completed indexing, add 30m API review"` | Prompt: *"Mark task done and log next focus sprint."* |
| **Reflection**| 06:00 PM | `az /stats` $\rightarrow$ inspect 7-day velocity curve | Prompt: *"Run evening review and summarize friction."* |

---

## ❓ Troubleshooting & FAQ

### 1. `Authentication error: Invalid or expired API key`
* **Fix**: Ensure your API key starts with `aazdoh_live_`. Re-run `az login -k <your_key>` or check your `AAZDOH_API_KEY` environment variable.

### 2. `CLI: Cannot execute scripts on Windows (PSSecurityException)`
* **Fix**: Run via `npx aazdoh-cli` or use `cmd.exe` / configure PowerShell execution policy: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

### 3. `MCP tools are not showing in Cursor / Claude Desktop`
* **Fix**: Ensure you have Node.js 18+ installed. Verify your `mcpServers` JSON syntax has valid quotes and no trailing commas. Restart the IDE.

### 4. `How do I undo an accidental AI command?`
* **In CLI**: Type `/undo` inside the `az>` prompt, or run `az undo`.
* **In MCP**: Prompt your assistant: *"Reopen the commitment we just postponed"* or use `reopen_commitment`.

---

**Commit. Do. Report. Reflect. (Zero BS)**  
For bug reports and feedback, visit [AazDoh GitHub Repository](https://github.com/aazdoh/aazdoh).
