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
4. [💻 CLI Agent (`aazdoh-cli`)](#-cli-agent-aazdoh-cli)
5. [🤖 Model Context Protocol (`aazdoh-mcp`)](#-model-context-protocol-aazdoh-mcp)
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

### 1. 🎯 Daily Commitments & Focused Capacity
- **Active Focus First**: Default views prioritize actionable commitments (`Active Focus → Kept → All`).
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
│   └── src/main/resources/db/migration/  # Versioned Flyway SQL migrations (V1..V15)
│
├── frontend/                 # React 18, TypeScript & Vite SPA
│   ├── src/
│   │   ├── api/             # Typed API client services
│   │   ├── components/
│   │   │   ├── analytics/   # Heatmap, Duration Curve, Friction Matrix
│   │   │   ├── commitments/ # Commitment cards, Modals, Stress-test UI
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
│   │   ├── commands/        # `today`, `run`, `chat`, `stress-test`, `undo`, `stats`
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

## 💻 CLI Agent (`aazdoh-cli`)

AazDoh includes a full-featured terminal client published to npm as **`aazdoh-cli`** (providing both `aazdoh` and `az` commands).

> 📖 **Looking for full documentation and recipes?** See the [Complete User Guide (USAGE.md)](USAGE.md).

### Installation & Interactive Cockpit

```bash
# Global install
npm install -g aazdoh-cli

# Authenticate once with your API key
az login -k aazdoh_live_your_api_key

# Launch Zero-Friction Terminal Cockpit (pre-loads today's table & stays open)
az
```

### Key CLI Commands

| Command / Shortcut | Role | Description |
| :--- | :--- | :--- |
| `az` *(or `aazdoh`)* | **Interactive Cockpit** | Displays today's agenda and keeps the interactive session (`az>`) open |
| `az "<instruction>"` | **Natural Language** | Fast one-shot task execution with live SSE action receipts |
| `az today` | **Daily Table** | One-shot printout of today's schedule, categories, and load |
| `az stress-test` | **Feasibility Audit** | Runs 60-second plan feasibility check against 7-day velocity |
| `az stats` *(or `az velocity`)* | **Velocity Metrics** | Displays 7-day compounding consistency and focus hours |
| `az undo` | **1-Tap Rollback** | Instantly reverts the last AI agent mutation |

Inside the cockpit (`az>`), use slash commands: `/today`, `/stress-test`, `/stats`, `/undo`, `/help`, `/clear`, `/exit`.

---

## 🤖 Model Context Protocol (`aazdoh-mcp`)

AazDoh provides a production-grade **Model Context Protocol (MCP)** server published as **`aazdoh-mcp`**. It connects your AI coding assistants directly to your accountability system.

### Supported Environments
- **Claude Desktop**
- **Cursor IDE**
- **Antigravity**

### IDE Configuration (`mcpServers`)

Add the following to your AI client's configuration file (e.g., `claude_desktop_config.json` or `.cursor/mcp.json`):

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

### Native Tools Exposed via MCP
- **Plan & Commitments**: `get_today_plan`, `create_commitment`, `update_commitment`, `complete_commitment`, `postpone_commitment`, `reopen_commitment`, `delete_commitment`, `get_commitments_range`.
- **AI & Feasibility**: `stress_test_plan`, `apply_optimized_plan`, `get_ai_insights`, `review_missed_commitment`, `detect_excuse`, `get_telemetry_stats`.
- **Reviews & Partners**: `submit_review`, `get_commitment_review`, `get_partnerships`, `get_partner_feed`, `get_discussion_thread`, `send_partner_update`.

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
