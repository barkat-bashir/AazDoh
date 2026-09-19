# AazDoh (آزدوہ)

> **Keep the promises you make to yourself.**  
> *Commit • Do • Report • Reflect — Zero Dopamine Streaks, Pure Operational Integrity.*

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg?style=flat-square)](https://www.oracle.com/java/)
[![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3+-brightgreen.svg?style=flat-square)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-blue.svg?style=flat-square)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue.svg?style=flat-square)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg?style=flat-square)](https://vitejs.dev/)
[![CLI on npm](https://img.shields.io/npm/v/aazdoh-cli.svg?style=flat-square&color=E2953B&label=aazdoh-cli)](https://www.npmjs.com/package/aazdoh-cli)
[![MCP on npm](https://img.shields.io/npm/v/aazdoh-mcp.svg?style=flat-square&color=2E7D52&label=aazdoh-mcp)](https://www.npmjs.com/package/aazdoh-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 📑 Table of Contents

1. [📖 Overview & Philosophy](#-overview--philosophy)
2. [⚡ Core Capabilities](#-core-capabilities)
3. [🏗️ Monorepo Architecture](#️-monorepo-architecture)
4. [💻 Terminal CLI Agent (`aazdoh-cli`)](#-terminal-cli-agent-aazdoh-cli)
   - [CLI Core Highlights](#cli-core-highlights)
   - [Installation & Setup](#installation--setup)
   - [Zero-Friction Terminal Cockpit (`az`)](#zero-friction-terminal-cockpit-az)
   - [Complete CLI Command Reference](#complete-cli-command-reference)
   - [Interactive REPL Slash Commands](#interactive-repl-slash-commands)
   - [Configuration & Credential Hierarchy](#configuration--credential-hierarchy)
   - [Security & Input Guardrails](#security--input-guardrails)
5. [🤖 Model Context Protocol (`aazdoh-mcp`)](#-model-context-protocol-aazdoh-mcp)
   - [Supported AI Environments](#supported-ai-environments)
   - [IDE Configuration Snippets](#ide-configuration-snippets)
   - [Complete Suite of 18 Native MCP Tools](#complete-suite-of-18-native-mcp-tools)
   - [AI Prompting Recipes & Workflows](#ai-prompting-recipes--workflows)
   - [Daily Developer Operational Playbook](#daily-developer-operational-playbook)
6. [🚀 Quickstart & Installation](#-quickstart--installation)
   - [Prerequisites](#prerequisites)
   - [1. Database Setup](#1-database-setup)
   - [2. Backend Configuration](#2-backend-configuration)
   - [3. Frontend Setup](#3-frontend-setup)
   - [4. CLI Setup](#4-cli-setup)
   - [5. MCP Server Setup](#5-mcp-server-setup)
7. [🧪 Testing & Build Verification](#-testing--build-verification)
8. [🎨 Design System (Kashmir Harud Aesthetic)](#-design-system-kashmir-harud-aesthetic)
9. [📄 License](#-license)

---

## 📖 Overview & Philosophy

Standard to-do apps reward dopamine checkmarks, artificial streaks, and passive backlog hoarding. **AazDoh** (*Kashmiri*: *"Do it today"*) is an **Empirical Behavioral Operating System** engineered for software engineers, founders, and focused operators.

### Why AazDoh?
- **No Dopamine Streaks**: Streaks create fragile all-or-nothing psychology. AazDoh measures *52-week compounding consistency* and *cognitive stamina thresholds*.
- **Pre-Flight Overload Defense**: Stop planning fallacy *before* your day begins by stress-testing proposed commitments against your empirical 7-day velocity.
- **Confronting Rationalizations**: When you postpone a commitment, AazDoh matches your justification against your historical excuse receipts.
- **Developer Ecosystem Native**: Work seamlessly across Web UI, autonomous Terminal CLI (`aazdoh`), or directly inside AI Coding IDEs (Claude Desktop, Cursor, Antigravity) via native MCP tools.

---

## ⚡ Core Capabilities

### 1. 🎯 Daily Commitments & Optional Day Phasing
- **Active Focus First**: Default views prioritize actionable commitments (`Active Focus → Kept → All`).
- **🌅 Day Phasing (Morning / Day / Evening / Anytime)**: Organize tasks into natural daily cognitive rhythms without brittle, anxiety-inducing hourly time-blocking.
- **✋ Drag & Drop Reordering**: Seamlessly move commitment cards between day phases on the web UI with instant optimistic UI updates.
- **Bounded Capacity**: Encourages sustainable limits (2–4 high-leverage promises) rather than endless backlog anxiety.
- **Dynamic Victory State**: Visual celebration and telemetry locking once daily active promises are cleared.

### 2. 🛡️ 60-Second Plan Feasibility Check (Stress-Testing)
- **Velocity Defense**: Cross-references proposed commitment hours against your historical 7-day focus baseline.
- **1-Click Rebalanced Proposals**: Automatically calculates split, trim, or reschedule options when cognitive overload is detected.
- **Sovereign Override**: Proceed intentionally after explicitly acknowledging overload risk.

### 3. ⏱️ Focus Sprint Cockpit & Sleep-Immune Telemetry
- **Drift & Sleep Immunity**: Uses real-world epoch timestamp delta calculation (`Date.now() + remainingMs`) with `visibilitychange` listeners. Never lags when your laptop sleeps, screen locks, or tabs background.
- **Flanked Sprint Presets**: 25m Sprint, 45m Deep Work, 60m Block, and 5m Recharge break options.
- **Distraction Harvest Pipeline**: Park fleeting thoughts during deep work and convert them with **1-click into tomorrow's commitments**.
- **Harmonic Web Audio Chime**: Procedurally synthesizes a warm harmonic chord (C5-E5-G5-C6) upon completion without external MP3 dependencies.

### 4. 🪞 Cognitive Excuse Mirror & Receipts
- **Avoidance Classifier**: Analyzes postponement rationalizations to detect repeating traps (*Morning Illusion*, *Perfectionist Stalling*, *Underestimation*).
- **Historical Receipts**: Surfaces past occurrences of identical justifications.
- **15-Minute Micro-Starts**: Low-friction inertia-breaker sessions to overcome task initiation resistance.

### 5. 🤝 1-to-1 Timezone-Aware Peer Accountability
- **Timezone-Aligned Midnight Resets**: Partner daily feeds calibrate accurately across international boundaries.
- **In-Context Discussion Threads**: Discuss blockers, share proof-of-work, and unblock partners directly on individual commitment cards.
- **Background Sync**: TanStack Query polling for unread message indicators without UI interruption.

### 6. 📊 Deterministic Behavioral Analytics
- **52-Week Consistency Heatmap**: Multi-level green/amber matrix focusing on long-term compounding output.
- **Capacity Execution Efficiency**: Tracks planned vs. actual hours delivered to compute your empirical **Planning Optimism Ratio**.
- **Sprint Duration Sweet-Spot Curve**: Highlights task completion win-rates across 25m, 45m, and 90m+ duration buckets.

---

## 🏗️ Monorepo Architecture

```
AazDoh/
├── backend/                  # Java 21 & Spring Boot 3.3+ REST API
│   ├── src/main/java/com/aazdoh/
│   │   ├── ai/              # Spring AI clients, SSE streaming & Feasibility evaluators
│   │   ├── analytics/       # Velocity metrics, Focus Telemetry & Heatmap aggregations
│   │   ├── auth/            # JWT authentication, API key generation & User sessions
│   │   ├── commitment/      # Daily commitments & status lifecycle
│   │   ├── discussion/      # Peer comments & unread notification sync
│   │   ├── partner/         # 1-to-1 partner pairing & invitation tokens
│   │   ├── review/          # Daily reflection & excuse classifier
│   │   └── user/            # User profiles & execution personas
│   └── src/main/resources/db/migration/  # Versioned Flyway SQL migrations (V1..V19)
│
├── frontend/                 # React 18, TypeScript & Vite SPA
│   ├── src/
│   │   ├── api/             # Typed API client services
│   │   ├── components/
│   │   │   ├── analytics/   # Heatmap, Duration Curve, Friction Matrix
│   │   │   ├── commitments/ # Commitment cards, Modals, Drag & Drop Day Phases, Stress-test UI
│   │   │   ├── common/      # Chinar leaf canvas, BrandLogo, Header, Nav
│   │   │   ├── focus/       # FocusSprintModal, FloatingFocusBar, Web Audio Telemetry
│   │   │   ├── partners/    # 1:1 partner dashboard & discussion drawers
│   │   │   └── review/      # Reflection & cognitive excuse mirror modals
│   │   ├── context/         # AuthContext, ToastContext, FocusTimerContext
│   │   └── pages/           # LandingPage, TodayPage, PartnersPage, AnalyticsPage
│   └── public/              # Static assets & Brand favicons
│
├── cli/                      # Autonomous TypeScript Terminal CLI Agent (`aazdoh-cli`)
│   ├── src/
│   │   ├── commands/        # `today`, `done`, `run`, `chat`, `stress-test`, `focus`, `undo`, `stats`
│   │   ├── services/        # Terminal API client & SSE token streamer
│   │   └── utils/           # ASCII tables, config storage, prompt sanitization
│   └── bin/                 # Executable binaries: `aazdoh`, `az`
│
└── mcp-server/               # Official Model Context Protocol Server (`aazdoh-mcp`)
    └── src/
        ├── index.ts         # Stdio MCP Server entrypoint & Tool handlers
        └── api/             # HTTP Client connecting to AazDoh REST backend
```

---

## 💻 Terminal CLI Agent (`aazdoh-cli`)

[![npm version](https://img.shields.io/npm/v/aazdoh-cli.svg?style=flat-square&color=E2953B)](https://www.npmjs.com/package/aazdoh-cli)
[![npm downloads](https://img.shields.io/npm/dm/aazdoh-cli.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/aazdoh-cli)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org)

The **AazDoh CLI** (`aazdoh-cli`, providing both `aazdoh` and `az` commands) brings the complete AazDoh cognitive engine directly to your command line. Engineered for terminal-first developers, it enables natural language task planning, zero-latency direct check-offs, 60-second capacity stress-testing, offline sleep-immune Pomodoro sprints, and instant 1-tap undo rollbacks.

> 📖 **Full Guide & Recipes:** See the root [USAGE.md](USAGE.md) and [cli/README.md](cli/README.md).

### CLI Core Highlights
- ⚡ **Zero-Friction Cockpit (`az`)**: Typing `az` pre-renders today's commitments table and leaves the `az>` prompt open for continuous commands.
- ✅ **Instant Interactive Check-off (`az done`)**: Interactive checkboxes or fast keyword matching with **0 AI/LLM overhead**.
- 🌅 **Day Phasing Support**: View and categorize tasks into 🌅 Morning, ☀️ Day, 🌙 Evening, or 📋 Anytime blocks.
- 🛡️ **60-Second Plan Feasibility Audit (`az stress-test`)**: Audits cognitive load against historical 7-day capacity before planning fallacy sets in.
- ⏱️ **Offline Sleep-Immune Focus Timer (`az focus`)**: Runs in the background by default with OS desktop toast alerts, live Big ASCII digital countdown (`--live`), or standalone borderless popup window (`--popup`).
- ⏪ **1-Tap Rollbacks (`az undo`)**: Immediately revert accidental AI agent mutations or reschedules.
- 💬 **Interactive AI Chief of Staff (`az chat`)**: Multi-turn conversational REPL with live token streaming and instant slash commands.

---

### Installation & Setup

```bash
# Install globally from npm (exposes both 'aazdoh' and 'az' commands)
npm install -g aazdoh-cli

# Authenticate once with your API key
az login -k aazdoh_live_your_api_key_here

# (Optional) Verify version and connectivity
az --version
```

Credentials are saved securely to `~/.aazdoh/config.json`.

---

### Zero-Friction Terminal Cockpit (`az`)

To eliminate the friction of exiting back to bash/zsh after each command, run `az` with no arguments:

```bash
az
```

**What happens:**
1. Renders the ASCII Harud banner and authenticated user persona.
2. Automatically pre-fetches and renders **today's commitments table** with scheduled load stats.
3. Keeps the interactive prompt **`az>`** open for continuous execution.

```text
   ⚡ AAZDOH COGNITIVE ACCOUNTABILITY CLI
   Commit. Do. Report. Reflect. (Zero BS)

   Plan for: 2026-09-19 | User: Barkat [Persona: BALANCED]

┌──────────┬────────────────────────────────┬────────────┬──────────┬──────────────┬────────────────┬────────────────────────────┐
│ Status   │ Commitment Title               │ Duration   │ Priority │ Phase        │ Category       │ Expected Outcome           │
├──────────┼────────────────────────────────┼────────────┼──────────┼──────────────┼────────────────┼────────────────────────────┤
│ ⭕ PEND  │ PostgreSQL Connection Pooling  │ 45m        │ [HIGH]   │ 🌅 Morning   │ 🎯 DEEP FOCUS  │ HikariCP tuned & verified  │
│ ⭕ PEND  │ Spring AI Stream Integration   │ 60m        │ [MED]    │ ☀️ Day       │ 🎯 DEEP FOCUS  │ SSE stream tests passing   │
│ ✅ DONE  │ Architecture Standup & Sync    │ 30m        │ [HIGH]   │ 🌅 Morning   │ ⚡ ROUTINE     │ Roadmap aligned            │
└──────────┴────────────────────────────────┴────────────┴──────────┴──────────────┴────────────────┴────────────────────────────┘

   Summary: 1 Done | 2 Pending | 2.2h total scheduled (135m) •  OPTIMAL 

   Type instructions or commands (/today, /stress-test, /stats, /undo, /help, /exit):

az> 
```

---

### Complete CLI Command Reference

#### 1. `aazdoh today` | `az list` — Daily Workload & Day Phasing
Inspect today's scheduled commitments, completion statuses, day phases, priorities, categories, and scheduled cognitive load.

```bash
# Print today's schedule table
az today

# View today's schedule and immediately open interactive check-off mode:
az today -i
# or: az today --interactive

# Inspect schedule for a specific date:
az today --date 2026-09-20
```

#### 2. `aazdoh done` | `az check` | `az complete` — Zero-Latency Task Check-Off
Fast, interactive terminal task completion with **0 AI overhead**. Directly hits the REST API for instant execution.

```bash
# Interactive multi-select mode ([Space] to toggle, [Enter] to confirm):
az done

# Quick direct keyword matching (marks matching pending task done immediately):
az done "PostgreSQL"
az check redis
```

#### 3. `aazdoh "<instruction>"` | `az run "<instruction>"` — Natural Language Execution
Execute natural language instructions with automatic intent parsing, live SSE reasoning indicators, and action receipts.

```bash
# Mark tasks completed
az "finished PostgreSQL connection pool tuning with HikariCP benchmarked"

# Add new high-impact deep focus blocks with day phases
az "add 60m deep focus on Spring AI token streaming for afternoon"

# Reschedule or postpone
az "postpone security audit to tomorrow morning"
```

#### 4. `aazdoh chat` — Interactive Multi-Turn AI Chief of Staff
Launch a persistent conversational REPL with sliding context window, live SSE token streaming, and slash commands.

```bash
az chat
```

#### 5. `aazdoh stress-test` — 60-Second Plan Feasibility Audit
Audits your daily workload against your historical 7-day velocity baseline to flag cognitive overload, task fragmentation, and planning fallacy.

```bash
# Run standard audit
az stress-test

# Pass a defense justification to re-evaluate:
az stress-test --defense "No meetings today, dedicated uninterrupted focus block"
```

#### 6. `aazdoh focus` | `az timer` — Offline Pomodoro, Big ASCII Clock & Popout Window
Run a 100% offline, zero-network focus timer. **Runs in the background by default**, freeing your terminal immediately, and triggers native OS desktop toast notifications upon completion.

```bash
# 25-minute Pomodoro in background (frees terminal immediately)
az focus

# Custom duration & task in background
az focus 45m "PostgreSQL pool optimization"
az focus 1.5h "Drafting system architecture"

# Check active timer status & ASCII progress bar
az focus status

# Stop / cancel active background timer
az focus stop

# Interactive live full-screen countdown with Big ASCII Digital Clock & hotkeys:
# ([Space] Pause/Resume, [+] +5m, [-] -5m, [w/p] Popout Window, [q] Exit)
az focus 25m --live

# Launch a sleek floating desktop popup clock window (borderless app mode)
az focus 45m "Core Engine Architecture" --popup
```

#### 7. `aazdoh undo` — Instant Mutation Rollback
Instantly rollback the most recent action executed by the AI Agent (task creation, status change, or rescheduling).

```bash
az undo
```

#### 8. `aazdoh stats` | `az velocity` — 7-Day Telemetry & Velocity
Displays 7-day compounding consistency, total focus hours, planning optimism ratio, and completion breakdown.

```bash
az stats
az stats --days 14
```

---

### Interactive REPL Slash Commands

Inside the interactive cockpit (`az>`) or `az chat`, use the following slash commands:

| Slash Command | Alias | Description |
| :--- | :--- | :--- |
| `/today` | `/list` | Refreshes and renders today's commitments table and load breakdown |
| `/stress-test` | `/stresstest` | Runs the 60-second plan feasibility diagnostic against 7-day capacity |
| `/stats` | `/velocity` | Renders 7-day velocity metrics, consistency score, and focus hour distributions |
| `/undo` | — | Instantly reverts the last AI agent mutation or state change |
| `/help` | `/?` | Displays the command cheatsheet and natural language examples |
| `/clear` | — | Clears the terminal screen and reprints the active daily cockpit |
| `/exit` | `/quit`, `:q` | Exits the interactive session cleanly back to your system shell |

---

### Configuration & Credential Priority

The CLI resolves configuration through a strict **5-layer hierarchy** (highest to lowest):

```
1. CLI Runtime Flags       (--key <key>, --url <url>)
2. System Environment      (export AAZDOH_API_KEY=aazdoh_live_...)
3. Directory .env          (AAZDOH_API_KEY in current working directory)
4. Local User Config       (~/.aazdoh/config.json via `az login`)
5. Hardcoded Default       (https://aazdoh.onrender.com)
```

**Configuration File (`~/.aazdoh/config.json`):**
```json
{
  "apiUrl": "https://aazdoh.onrender.com",
  "apiKey": "aazdoh_live_...",
  "userFullName": "Barkat",
  "userEmail": "barkat@example.com",
  "aiPersona": "BALANCED"
}
```

---

### Security & Input Guardrails

- **500-Character Universal Input Ceiling**: All prompt inputs and natural language instructions are capped at 500 characters to prevent prompt injection and oversized payload attacks.
- **Delimiter Neutralization**: Backticks and markdown block delimiters are sanitized before passing to backend LLMs.
- **Zero Local Credential Leakage**: Configuration is stored in OS-isolated user directories (`~/.aazdoh`) with appropriate file permissions.
- **Reversible Mutations**: All agent executions are recorded with reversible log receipts for 1-click rollback via `az undo`.

---

## 🤖 Model Context Protocol (`aazdoh-mcp`)

[![npm version](https://img.shields.io/npm/v/aazdoh-mcp.svg?style=flat-square&color=2E7D52)](https://www.npmjs.com/package/aazdoh-mcp)
[![npm downloads](https://img.shields.io/npm/dm/aazdoh-mcp.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/aazdoh-mcp)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org)

The **AazDoh MCP Server** (`aazdoh-mcp`) is an official [Model Context Protocol](https://modelcontextprotocol.io/) server that directly bridges your AI coding assistants with your personal accountability system. It turns coding assistants in **Cursor**, **Claude Desktop**, and **Antigravity** into proactive **AI Chiefs of Staff** capable of auditing cognitive load, locking in focus blocks before refactoring, validating proof-of-work, and updating accountability partners.

> 📖 **Full Guide & Tool Schemas:** See [mcp-server/README.md](mcp-server/README.md) and [USAGE.md](USAGE.md).

```
                      ┌─────────────────────────────────────────┐
                      │          AazDoh MCP Server              │
                      └────────────────────┬────────────────────┘
                                           │
         ┌──────────────────┬──────────────┴─────┬──────────────────┐
         │                  │                    │                  │
┌────────▼────────┐ ┌───────▼────────┐ ┌─────────▼────────┐ ┌───────▼────────┐
│ Plan & Commit   │ │ AI Intelligence│ │ Daily Reflection │ │ Partner Feeds  │
│ 8 Tools         │ │ 6 Tools        │ │ 2 Tools          │ │ 4 Tools        │
└─────────────────┘ └────────────────┘ └──────────────────┘ └────────────────┘
```

---

### Supported AI Environments

- **Antigravity IDE**
- **Cursor IDE**
- **Claude Desktop**
- **Windsurf / Cascade**
- **VS Code** (via Cline, Roo Code, Claude Dev)

---

### IDE Configuration Snippets

#### 1. Antigravity IDE & Cursor (`mcp_config.json` or `.cursor/mcp.json`)

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

#### 2. Claude Desktop (`claude_desktop_config.json`)
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

### Complete Suite of 18 Native MCP Tools

The MCP server exposes 18 specialized tools organized into 4 functional domains:

#### 🎯 1. Plan & Commitment Execution (8 Tools)
| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| `get_today_plan` | `[date]` | Fetches daily commitment list, completion status, Day Phases, and cognitive workload |
| `create_commitment` | `title`, `durationMinutes`, `category`, `priority`, `dayPhase`, `expectedOutcome` | Locks in a new focus task, deep work sprint, or routine errand |
| `update_commitment` | `id`, `[title]`, `[durationMinutes]`, `[priority]`, `[category]`, `[dayPhase]` | Updates details or day phase of an existing commitment |
| `complete_commitment` | `id` | Marks a commitment as kept and completed, updating velocity and streaks |
| `postpone_commitment` | `id`, `targetDate`, `reason` | Reschedules an active commitment to a future date with reason & excuse tracking |
| `reopen_commitment` | `id` | Reopens a postponed commitment back to today's active pending list |
| `delete_commitment` | `id` | Deletes or drops an unneeded commitment from your schedule |
| `get_commitments_range` | `startDate`, `endDate` | Retrieves commitments scheduled across a multi-day or weekly date range |

#### 🛡️ 2. AI Behavioral Intelligence & Stress-Testing (6 Tools)
| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| `stress_test_plan` | `[defense]` | Runs 60-second plan feasibility check against 7-day velocity to identify overload |
| `apply_optimized_plan` | `adjustments` | Applies 1-click AI-optimized task splits, trims, and reschedules |
| `get_ai_insights` | — | Retrieves synthesized behavioral patterns, friction bottlenecks, and tactical habits |
| `review_missed_commitment` | `id` | Runs an instant AI post-mortem on a missed commitment to diagnose initiation friction |
| `detect_excuse` | `reason` | AI Anti-Self-Deception Mirror: evaluates excuses against historical excuse receipts |
| `get_telemetry_stats` | `[days]` | Retrieves 7-day velocity, streak health, and focus duration distributions |

#### 🪞 3. Daily Retrospective & Reflection (2 Tools)
| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| `submit_review` | `date`, `rating`, `reflection`, `frictionCategory` | Submits end-of-day retrospective review and failure root-cause analysis |
| `get_commitment_review` | `id` | Inspects the submitted review and reflection record for a commitment |

#### 🤝 4. Peer Accountability & Discussion Threads (4 Tools)
| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| `get_partnerships` | — | Lists active 1-to-1 accountability partnerships and peer details |
| `get_partner_feed` | `partnerId`, `[date]` | Views partner's daily commitment feed, completion progress, and AI risk brief |
| `get_discussion_thread` | `commitmentId` | Fetches in-context proof-of-work discussion messages on a commitment |
| `send_partner_update` | `commitmentId`, `message` | Posts an update, Git commit proof, or blocker note to a commitment thread |

---

### AI Prompting Recipes & Workflows

Once `aazdoh-mcp` is configured in your IDE, use these practical prompt patterns during development:

#### 🌅 Recipe 1: Morning Standup & Cognitive Load Audit
> *"Check my AazDoh today's plan using `get_today_plan`. If my scheduled cognitive load exceeds 4.5 hours, run `stress_test_plan` and help me prioritize the 2 highest-leverage deep focus tasks for our coding session."*

#### ⏱️ Recipe 2: Deep Focus Sprint Lock-In Before Refactoring
> *"We're about to refactor the database connection pool. Lock in a 45m DEEP_WORK commitment in AazDoh titled 'PostgreSQL Pool Tuning' with HIGH priority in the MORNING phase and an expected outcome of 'Passing concurrency stress tests'."*

#### ✅ Recipe 3: Task Completion & Partner Proof-of-Work
> *"We just fixed the token refresh race condition and all unit tests passed. Mark the authentication commitment complete in AazDoh and post a partner update to the thread with a summary of what we changed."*

#### 🪞 Recipe 4: Evening Retrospective & Friction Analysis
> *"Review today's completed vs missed commitments in AazDoh. Summarize our velocity and submit our daily reflection with insights on what caused friction during the afternoon block."*

---

### Daily Developer Operational Playbook

| Phase | Time | Terminal CLI Action (`az`) | AI IDE Action (MCP) |
| :--- | :--- | :--- | :--- |
| **Kick-off** | 08:30 AM | Run `az` $\rightarrow$ inspect load $\rightarrow$ `/stress-test` | Prompt: *"Inspect today's plan and review focus load."* |
| **Deep Work** | 09:30 AM | `az "started PostgreSQL indexing"` | Prompt: *"Lock in 45m deep focus commitment."* |
| **In Flow** | 02:00 PM | `az "completed indexing, add 30m API review"` | Prompt: *"Mark task done and log next focus sprint."* |
| **Reflection**| 06:00 PM | `az /stats` $\rightarrow$ inspect 7-day velocity curve | Prompt: *"Run evening review and summarize friction."* |

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Java JDK 21+**
- **Node.js 18+** & **npm**
- **PostgreSQL 15+**
- *(Optional)* OpenAI / LLM API Key for AI Feasibility & Behavioral Synthesis

---

### 1. Database Setup

Create a local PostgreSQL database:
```sql
CREATE DATABASE aazdoh;
```

---

### 2. Backend Configuration

1. Navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Set environment variables or configure `src/main/resources/application.yml`:
   ```bash
   export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/aazdoh
   export SPRING_DATASOURCE_USERNAME=postgres
   export SPRING_DATASOURCE_PASSWORD=postgres
   export JWT_SECRET=your_super_secret_jwt_key_at_least_256_bits_long
   export SPRING_AI_OPENAI_API_KEY=your_openai_api_key # Optional
   ```

3. Run Spring Boot:
   ```bash
   # Linux / macOS
   ./mvnw spring-boot:run

   # Windows PowerShell
   .\mvnw.cmd spring-boot:run
   ```
   *The backend starts on port `8080`. Flyway automatically executes database migrations.*

---

### 3. Frontend Setup

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies and start the Vite dev server:
   ```bash
   npm install
   npm run dev
   ```

3. Open your browser at `http://localhost:3000`.

---

### 4. CLI Setup

```bash
cd cli
npm install
npm run build
npm link # Symlink globally for local testing
```

---

### 5. MCP Server Setup

```bash
cd mcp-server
npm install
npm run build
```

---

## 🧪 Testing & Build Verification

```bash
# Backend unit & integration tests
cd backend
./mvnw test

# Frontend TypeScript check & production bundle
cd frontend
npm run build

# CLI compilation
cd cli
npm run build

# MCP server compilation
cd mcp-server
npm run build
```

---

## 🎨 Design System (Kashmir Harud Aesthetic)

AazDoh features a bespoke, artisanal design system inspired by the autumn season (*Harud*) of the Kashmir valley:

| Token | Hex | Role |
| :--- | :--- | :--- |
| `--bg-walnut-deep` | `#120E0B` | Deep walnut background foundation |
| `--bg-walnut-card` | `#1C1510` | Elevated card & surface background |
| `--chinar-rust` | `#C05330` | Warm primary action accents |
| `--saffron-ember` | `#E2953B` | Active focus, badges & highlights |
| `--pine-emerald` | `#2E7D52` | Kept promises, success & velocity |
| `--text-kehwa-cream` | `#F5EFEB` | Crisp, high-legibility typography |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
