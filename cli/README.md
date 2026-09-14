# ⚡ AazDoh CLI (`aazdoh-cli`)
### Autonomous AI Accountability Coach & Execution Agent for the Terminal

[![npm version](https://img.shields.io/npm/v/aazdoh-cli.svg?style=flat-square&color=E2953B)](https://www.npmjs.com/package/aazdoh-cli)
[![npm downloads](https://img.shields.io/npm/dm/aazdoh-cli.svg?style=flat-square&color=blue)](https://www.npmjs.com/package/aazdoh-cli)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **Commit. Do. Report. Reflect. (Zero BS)**  
> `aazdoh-cli` brings the complete **AazDoh Cognitive Accountability Engine** into your terminal. Execute natural language commitments, stress-test your daily capacity, track 7-day velocity, and converse with an AI Chief of Staff without leaving your command line.

---

## 📑 Table of Contents

1. [✨ Key Features](#-key-features)
2. [🚀 Quickstart](#-quickstart)
   - [Installation](#1-installation)
   - [Authentication](#2-authentication)
3. [💻 Commands & Usage Reference](#-commands--usage-reference)
   - [`aazdoh today` (Daily Workload & Status)](#1-aazdoh-today--az-list)
   - [`aazdoh "<instruction>"` (Natural Language Execution)](#2-aazdoh-instruction--az-run-instruction)
   - [`aazdoh chat` (Interactive Multi-Turn REPL)](#3-aazdoh-chat-interactive-ai-chief-of-staff)
   - [`aazdoh stress-test` (60-Second Overload Audit)](#4-aazdoh-stress-test-60-second-plan-stress-test)
   - [`aazdoh undo` (Instant Action Rollback)](#5-aazdoh-undo-instant-mutation-rollback)
   - [`aazdoh stats` (7-Day Telemetry & Velocity)](#6-aazdoh-stats--az-velocity)
4. [⌨️ Interactive REPL Slash Commands](#-interactive-repl-slash-commands)
5. [⚙️ Configuration & Credential Priority](#-configuration--credential-priority)
6. [🛡️ Security, Sanitization & Cognitive Limits](#-security-sanitization--cognitive-limits)
7. [🛠️ Local Development & Contributing](#-local-development--contributing)
8. [📄 License](#-license)

---

## ✨ Key Features

- **⚡ Zero-Friction Terminal Execution**: Type `az "completed TUF DSA, add 45m Redis optimization"` to update your ledger instantaneously.
- **🛡️ 60-Second Plan Stress Test**: Real-time diagnostic that audits your schedule against your historical 7-day velocity to prevent cognitive burnout and task fragmentation.
- **💬 Interactive Chief of Staff REPL**: Continuous multi-turn conversational terminal session with real-time SSE token streaming and slash commands.
- **⏪ One-Tap Rollbacks (`undo`)**: Revert any AI-generated task or state change with a single keystroke.
- **📊 Rich Terminal Aesthetics**: ANSI-colored badges (`DEEP FOCUS`, `ROUTINE`), ASCII data tables, and dynamic progress meters designed for modern developer workflows.
- **🔒 Baked-In Production Architecture**: Pre-configured to the live production backend with layered credential overrides via `~/.aazdoh/config.json`, `.env`, or environment variables.

---

## 🚀 Quickstart

> 📖 **Full Guide & Recipes:** See the root [USAGE.md](../USAGE.md) for the complete manual.

### 1. Installation

Install globally via npm for access to both `aazdoh` and `az` binaries:

```bash
# Global installation (recommended)
npm install -g aazdoh-cli

# Verify installation
az --version
```

---

### 2. Authentication

Authenticate once using your AazDoh API key (generate one from **Web App ➔ Settings ➔ Developer API Keys**):

```bash
# Authenticate directly via flag:
az login -k aazdoh_live_your_api_key_here
```

Your credentials are saved safely to `~/.aazdoh/config.json`.

---

### 3. Zero-Friction Terminal Cockpit (`az`)

To eliminate friction, simply typing `az` (or `aazdoh`) launches the interactive cockpit:
- Pre-loads today's commitments table immediately.
- Keeps the `az>` session open for continuous commands without exiting back to shell.

```bash
az
```

Inside the cockpit, type natural language instructions or slash commands: `/today`, `/stress-test`, `/stats`, `/undo`, `/help`, `/clear`, `/exit`.

---

## 💻 Commands & Usage Reference

### 1. `aazdoh today` | `az list`
Inspect today’s scheduled commitments, completion statuses, priorities, categories, and total scheduled cognitive load.

```bash
az today
# Or inspect a specific date (YYYY-MM-DD):
az today --date 2026-09-14
```

**Output Preview:**
```text
   ⚡ AAZDOH COGNITIVE ACCOUNTABILITY CLI
   Commit. Do. Report. Reflect. (Zero BS)

   Plan for: 2026-09-13 | User: Barkat [Persona: BALANCED]

┌──────────┬────────────────────────────────┬────────────┬──────────┬────────────────┬────────────────────────────┐
│ Status   │ Commitment Title               │ Duration   │ Priority │ Category       │ Expected Outcome           │
├──────────┼────────────────────────────────┼────────────┼──────────┼────────────────┼────────────────────────────┤
│ ✅ DONE  │ Java Architecture Review       │ 60m        │ [HIGH]   │ 🎯 DEEP FOCUS  │ Core design approved       │
│ ✅ DONE  │ Spring AI Token Streaming      │ 60m        │ [MED]    │ 🎯 DEEP FOCUS  │ SSE stream tests passing   │
│ ⭕ PEND  │ DSA TUF Trees & Graphs         │ 60m        │ [MED]    │ 🎯 DEEP FOCUS  │ 4 Leetcode mediums solved  │
│ ✅ DONE  │ Morning Routine & Breakfast    │ 30m        │ [HIGH]   │ ⚡ ROUTINE     │ Ready for deep focus       │
└──────────┴────────────────────────────────┴────────────┴──────────┴────────────────┴────────────────────────────┘

   Summary: 3 Done | 1 Pending | 3.5h total scheduled (210m) •  OPTIMAL 
```

---

### 2. `aazdoh "<instruction>"` | `az run "<instruction>"`
Execute natural language tasks with automatic intent parsing, live SSE reasoning indicators, and action receipts.

```bash
# Mark tasks completed
aazdoh "finished DSA TUF trees with 4 problems solved"

# Add new high-impact deep focus blocks
aazdoh "add 45m deep focus on PostgreSQL connection pool tuning"

# Reschedule or postpone
aazdoh "postpone team sync prep to tomorrow morning"
```

**Execution Receipt:**
```text
   ⚡ Executed Actions:
   ✓ Completed Commitment: "DSA TUF Trees & Graphs"
   ✓ Created Commitment: "PostgreSQL connection pool tuning" (45m, DEEP_WORK)

   (Run 'aazdoh undo' to revert)
```

---

### 3. `aazdoh chat` (Interactive AI Chief of Staff)
Launch a persistent, multi-turn terminal conversation. Includes sliding-window session history, live token streaming, and instant slash commands.

```bash
aazdoh chat
```

```text
az> how was my velocity today?
Solid execution today. You've completed 7 of 8 commitments (300m total), locking in
your Java/Spring prep and LangChain modules.

Only 1 task remains on your ledger for 2026-09-13:
• ⏳ DSA TUF (60m | DEEP_WORK | Priority: MEDIUM)

You are 60 minutes away from a 100% execution day within your 6-hour cognitive ceiling.

az> /today
[Renders today's table live]

az> knock out DSA TUF and mark it done
[Streams tokens & updates ledger]
```

---

### 4. `aazdoh stress-test` (60-Second Plan Stress Test)
Audits your daily workload against historical capacity, identifying context-switching bottlenecks, cognitive fragmentation, and over-scheduling risks.

```bash
# Run standard audit
az stress-test

# Or justify heavy workload with a quick defense argument:
az stress-test --defense "I have zero meetings today and dedicated 4h block"
```

**Output Preview:**
```text
   MODERATE RISK (MODERATE)   [████████░░░░░░░░░░░░] 39%

   📋 Diagnostic Assessment:
   Your 6.0-hour volume is within your 6.2-hour capacity, but task fragmentation
   (8 tasks) creates context-switching drag. Consolidate your afternoon technical
   blocks to safeguard your 84% completion rate.

┌──────────────────────┬────────────────────────────┬────────────────────────┐
│ Planned Load         │ Historical 7-Day Capacity  │ Optimized Workload     │
├──────────────────────┼────────────────────────────┼────────────────────────┤
│ 6.0 hours            │ 6.2 hours/day              │ 5.5 hours              │
└──────────────────────┴────────────────────────────┴────────────────────────┘
```

---

### 5. `aazdoh undo` (Instant Mutation Rollback)
Instantly rollback the most recent action executed by the AI Agent (task creation, status change, or rescheduling).

```bash
aazdoh undo
```

---

### 6. `aazdoh stats` | `az velocity`
Displays 7-day velocity metrics, completion consistency, total deep work hours, and failure breakdown.

```bash
# Default 7-day analysis
az stats

# Custom time window
az stats --days 14
```

---

### 7. `aazdoh focus` | `az timer` (Local Offline Focus Timer & Desktop Alerts)
Run a 100% offline, zero-network Pomodoro and deep work focus timer directly in your terminal with native OS desktop toast notifications when time expires.

```bash
# 25-minute Pomodoro (default)
az focus

# Custom duration & task description
az focus 45m "PostgreSQL connection pool optimization"
az focus 1.5h "Drafting system architecture"

# Live hotkeys during focus session:
# [Space] Pause / Resume
# [+] Quick-extend +5 minutes
# [-] Subtract -5 minutes
# [q] Exit / Cancel
```

---

## ⌨️ Interactive REPL Slash Commands

Inside `aazdoh chat`, the following slash commands are built-in:

| Slash Command | Alias | Description |
| :--- | :--- | :--- |
| `/today` | `/list` | Displays today's commitments table and load breakdown |
| `/undo` | — | Reverts the last agent mutation immediately |
| `/stats` | — | Renders your 7-day velocity and focus telemetry |
| `/clear` | — | Clears the terminal screen and redraws the banner |
| `/exit` | `/quit`, `:q` | Exits the interactive chat session |

---

## ⚙️ Configuration & Credential Priority

The CLI resolves configuration through a strict **5-layer hierarchy** (highest to lowest):

```
1. CLI Flags              (--key <key>, --url <url>)
2. System Environment     (export AAZDOH_API_KEY=aazdoh_live_...)
3. Directory .env         (AAZDOH_API_KEY in current working directory)
4. Local User Config      (~/.aazdoh/config.json via `aazdoh login`)
5. Hardcoded Default      (https://aazdoh.onrender.com)
```

### Configuration File (`~/.aazdoh/config.json`)
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

## 🛡️ Security, Sanitization & Cognitive Limits

- **500-Character Universal Input Ceiling**: All prompt inputs and natural language instructions are capped at 500 characters to prevent prompt injection and oversized payload attacks.
- **Delimiter Neutralization**: Backticks and markdown block delimiters are sanitized before passing to the backend LLM engine.
- **Zero Local Credential Leakage**: Configuration is stored in OS-isolated user directories (`~/.aazdoh`) with appropriate file permissions.
- **Non-Destructive Execution**: All mutations are journaled with reversible log receipts.

---

## 🛠️ Local Development & Contributing

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/aazdoh/aazdoh.git
cd aazdoh/cli
npm install
```

### 2. Build TypeScript
```bash
# Compile once
npm run build

# Watch mode during development
npm run dev
```

### 3. Local Symlink Testing
```bash
# Symlink globally on your machine
npm link

# Now run your local code from anywhere
az today
```

---

## 📄 License

MIT © [AazDoh Team](https://github.com/aazdoh)
