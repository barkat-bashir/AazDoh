# 📋 AazDoh Changelog

All notable changes to the **AazDoh Developer Ecosystem** (`aazdoh-cli`, `aazdoh-mcp`, backend, frontend) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.2] - 2026-09-14

### ⚡ CLI (`aazdoh-cli` v1.0.2)
- **Zero-Friction Interactive Cockpit**: Running `az` or `aazdoh` with no arguments now launches the interactive terminal session by default, automatically pre-loading today's commitments and load summary without kicking users back to the system shell.
- **Interactive Slash Commands Parity**:
  - Added `/stress-test` (`/stresstest`) to execute the 60-second plan feasibility diagnostic directly from the `az>` prompt.
  - Added `/help` (`/?`) for quick command reference and natural language examples.
  - Added `/stats` (`/velocity`), `/today` (`/list`), `/clear`, `/exit` (`/quit`, `:q`).
- **Automatic In-CLI Update Notifier**: Integrated lightweight background npm registry version checker that automatically notifies users in the terminal when newer CLI releases are available.
- **Enhanced Terminal Aesthetics**: Streamlined ASCII Harud styling and structured action receipts tables.

### 📖 Documentation
- **Comprehensive User Guide (`USAGE.md`)**: Created exhaustive operational manual detailing:
  - Part 1: Terminal Power User Guide (`aazdoh-cli` / `az`).
  - Part 2: AI IDE Native Guide (`aazdoh-mcp`) with configurations for Antigravity, Cursor, Claude Desktop, and Windsurf, along with 18-tool suite schemas and prompt recipes.
  - Part 3: Daily Developer Operational Playbook.
  - Part 4: Troubleshooting & FAQ.

---

## [1.0.1] - 2026-09-13

### ⚡ CLI (`aazdoh-cli` v1.0.1)
- **One-Tap AI Mutation Rollback (`undo`)**: Added `az undo` and `/undo` slash command to instantaneously revert AI-generated schedule mutations.
- **Real-Time Token Streaming**: Integrated Server-Sent Events (SSE) token streamer for Chief of Staff reasoning traces.
- **Cognitive Overload Warnings**: Visual callout banners when scheduled load exceeds empirical 7-day capacity.
- **Layered Credential Configuration**: Added support for CLI flags, `.env` file, environment variables, and `~/.aazdoh/config.json`.

### 🤖 MCP Server (`aazdoh-mcp` v1.0.1)
- **Full Tool Suite (18 Tools)**: Complete tool registration for daily commitment management, AI stress-testing, excuse detection, daily reflections, and peer discussion threads.

---

## [1.0.0] - 2026-09-12

### Initial Release
- **AazDoh Monorepo**: Complete release containing Spring Boot 3.3+ Java 21 backend, React 18 TypeScript frontend, `aazdoh-cli`, and `aazdoh-mcp`.
- **Core Cognitive OS**:
  - Daily active commitments with bounded capacity.
  - 60-Second Plan Feasibility Stress Test.
  - Sleep-immune Focus Sprint Cockpit with Web Audio harmonic chime.
  - Cognitive Excuse Mirror with historical receipts.
  - 1-to-1 Timezone-Aware Peer Accountability.
  - 52-Week Compounding Consistency Heatmap.
