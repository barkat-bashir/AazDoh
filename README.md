# AazDoh (آزدوہ)

> **Keep the promises you make to yourself.**  
> *Commit • Do • Report • Reflect*

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.3+-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue.svg)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)

---

## 📖 Overview

Standard to-do apps reward dopamine checkmarks and passive backlog hoarding. **AazDoh** (*Kashmiri*: *"Do it today"*) is an **Empirical Behavioral Operating System** designed to eliminate planning fallacy, cognitive rationalizations, and execution drift through:

1. **60-Second Plan Feasibility Defense**: Pre-flight stress-testing that checks proposed daily load against rolling 7-day velocity to stop overcommitting before the morning begins.
2. **Sleep-Immune Focus Sprint Engine**: A precision stopwatch cockpit anchored to real-world timestamps with 1-click distraction harvesting.
3. **Cognitive Excuse Mirror & Receipts**: Confronts avoidance rationalizations (*Morning Illusion*, *Perfectionist Stalling*) with historical data and micro-starts.
4. **1-to-1 Peer Transparency**: Asynchronous timezone-aware partner visibility with in-context discussion threads.
5. **Deterministic Behavioral Analytics**: 52-week consistency heatmaps, duration stamina curves, and capacity execution ratios running on sub-10ms SQL aggregations.

---

## ⚡ Key Features & Capabilities

### 1. 🎯 Daily Commitments & Priority Filtering
- **Active Focus First**: Default view prioritizes actionable tasks (`Active Focus → Kept → All`).
- **Capacity Limits**: Encourages sustainable limits (2–4 high-leverage promises) rather than endless backlog anxiety.
- **Victory State**: Dynamic celebration cards when active focus commitments are cleared.

### 2. ⏱️ Focus Sprint Cockpit & Cognitive Telemetry
- **Drift & Sleep Immunity**: Uses epoch timestamp delta calculation (`Date.now() + remainingMs`) with `visibilitychange` listeners. Never lags or pauses when your laptop sleeps, screen locks, or tabs background.
- **Flanked Sprint Presets**: 25m Sprint, 45m Deep, 60m Block, and 5m Recharge break options.
- **Manual Early Completion**: `[ ✓ Mark Done & Finish Sprint ]` records exact seconds spent and checks off the commitment on `/today`.
- **Distraction Harvest Pipeline**: Park fleeting thoughts during deep work and convert them with **1-click into tomorrow's commitments**.
- **Harmonic Web Audio Chime**: Procedurally synthesizes a warm harmonic chord (C5-E5-G5-C6) upon completion without external MP3 dependencies.

### 3. 🛡️ Plan Feasibility Check (AI Stress-Testing)
- **Velocity Defense**: Cross-references proposed commitment hours against your historical 7-day baseline.
- **1-Click Rebalanced Proposals**: Automatically suggests split, trim, or reschedule options when overload is detected.
- **Sovereign Override**: Allows users to proceed after intentional acknowledgment.

### 4. 🪞 Cognitive Excuse Mirror & Receipts
- **Avoidance Classifier**: Analyzes postponement reasons to detect patterns (e.g. *Underestimation*, *Distraction*, *Perfectionism*).
- **Historical Receipts**: Surfaces past times the same justification was used.
- **15-Minute Micro-Starts**: Low-friction inertia-breaker sessions to overcome initiation resistance.

### 5. 🤝 1-to-1 Peer Accountability
- **Timezone-Aware Sync**: Partner daily commitments align to individual midnight resets.
- **In-Context Discussions**: Discuss blockers and cheer partner progress directly on commitment cards.
- **Quiet Background Sync**: TanStack Query background polling for unread message indicators without UI interruption.

### 6. 📊 Empirical Behavioral Velocity & Analytics
- **52-Week Consistency Heatmap**: Multi-level green/amber matrix focusing on compounding output rather than fragile all-or-nothing streaks.
- **Capacity Execution Efficiency**: Tracks planned vs. actual hours delivered and computes the **Planning Optimism Ratio**.
- **Sprint Duration Sweet-Spot Curve**: Highlights task completion win-rates across 25m, 45m, and 90m+ duration buckets.
- **On-Demand AI Chief of Staff**: Generates strategic behavioral summaries, root-cause friction deconstruction, and tactical habit protocols.

---

## 🏗️ Technical Architecture & Stack

```
AazDoh/
├── backend/                  # Java 21 & Spring Boot 3 REST API
│   ├── src/main/java/com/aazdoh/
│   │   ├── ai/              # Spring AI clients & Feasibility Evaluators
│   │   ├── analytics/       # Velocity metrics, Focus Telemetry & Heatmap
│   │   ├── auth/            # JWT authentication & User sessions
│   │   ├── commitment/      # Daily commitments & status lifecycle
│   │   ├── discussion/      # Peer comments & unread notification sync
│   │   ├── partner/         # 1-to-1 partner pairing & invitations
│   │   ├── review/          # Daily reflection & excuse classifier
│   │   └── user/            # User profiles & execution stats
│   └── src/main/resources/db/migration/  # Flyway SQL migrations (V1..V15)
│
└── frontend/                 # React 18, TypeScript & Vite SPA
    ├── src/
    │   ├── api/             # Typed API client services
    │   ├── components/
    │   │   ├── analytics/   # Heatmap, Duration Curve, Friction Matrix
    │   │   ├── commitments/ # Commitment cards, modals & stress-test
    │   │   ├── common/      # Header, Nav, Chinar canvas, BrandLogo
    │   │   ├── focus/       # FocusSprintModal, FloatingFocusBar, Telemetry
    │   │   ├── partners/    # 1:1 partner dashboard & discussion drawers
    │   │   └── review/      # Reflection & excuse mirror modals
    │   ├── context/         # AuthContext, ToastContext, FocusTimerContext
    │   └── pages/           # LandingPage, TodayPage, PartnersPage, AnalyticsPage
```

### Technology Highlights

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend** | Java 21, Spring Boot 3.3+ | Virtual threads readiness, type safety, rock-solid enterprise stability. |
| **Database** | PostgreSQL 16+ | Rich JSONB support, ACID reliability, indexing for multi-day time-series aggregations. |
| **Migrations** | Flyway | Versioned, reproducible SQL schema evolutions (`V1` to `V15`). |
| **AI Layer** | Spring AI (OpenAI / Ollama / Gemini) | Structured JSON output parsing for feasibility evaluation & behavioral synthesis. |
| **Frontend** | React 18, TypeScript, Vite | Sub-second HMR, strict type safety, modular component architecture. |
| **Data Fetching** | TanStack Query v5 | Automatic background synchronization, cache invalidation, and optimistic updates. |
| **Styling** | Vanilla CSS (Kashmiri Harud Design Tokens) | Zero-runtime CSS with rich walnut, kehwa cream, saffron ember, and chinar rust aesthetics. |

---

## 🚀 Getting Started

### Prerequisites
- **Java JDK 21+**
- **Node.js 18+** & **npm**
- **PostgreSQL 15+**
- *(Optional)* OpenAI / Compatible LLM API Key for AI Feasibility & Synthesis features

---

### 1. Database Setup
Create a PostgreSQL database:
```sql
CREATE DATABASE aazdoh;
```

---

### 2. Backend Configuration & Run

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure environment variables or edit `src/main/resources/application.yml`:
   ```bash
   export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/aazdoh
   export SPRING_DATASOURCE_USERNAME=postgres
   export SPRING_DATASOURCE_PASSWORD=postgres
   export JWT_SECRET=your_super_secret_jwt_key_at_least_256_bits_long
   export SPRING_AI_OPENAI_API_KEY=your_openai_api_key_here # Optional
   ```

3. Build and run Spring Boot:
   ```bash
   # Using Maven Wrapper or local Maven
   ./mvnw spring-boot:run
   ```
   *The backend will start on port `8080` and Flyway will automatically run database migrations.*

---

### 3. Frontend Setup & Run

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser at:
   ```
   http://localhost:3000
   ```

---

## 🧪 Running Tests & Build Verification

### Backend Tests
```bash
cd backend
./mvnw test
```

### Frontend TypeScript & Production Build
```bash
cd frontend
npm run build
```

---

## 📜 Design System: 

AazDoh uses a custom, artisanal design system inspired by the autumn season of Kashmir valley:
- **`--bg-walnut-deep`**: `#120E0B` (Rich dark walnut foundation)
- **`--bg-walnut-card`**: `#1C1510` (Surface cards)
- **`--chinar-rust`**: `#C05330` (Warm primary actions)
- **`--saffron-ember`**: `#E2953B` (Focus & active accents)
- **`--pine-emerald`**: `#2E7D52` (Kept commitments & consistency badges)
- **`--text-kehwa-cream`**: `#F5EFEB` (Crisp readable typography)

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
