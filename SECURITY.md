# 🛡️ Security Policy & Architecture

The **AazDoh** project takes the security, reliability, and privacy of its users' operational commitments and cognitive telemetry seriously. This document details our security practices, responsible disclosure procedures, and developer safeguards.

---

## 🔒 Supported Versions

We provide security updates and patches for the following versions:

| Component | Version | Supported |
| :--- | :--- | :---: |
| **Backend API** (Spring Boot 3.3+) | `latest` (main) | ✅ |
| **Frontend SPA** (React / Vite) | `latest` (main) | ✅ |
| **CLI Agent** (`aazdoh-cli`) | `1.x` | ✅ |
| **MCP Server** (`aazdoh-mcp`) | `1.x` | ✅ |

---

## 🚨 Reporting a Vulnerability

If you discover a potential security vulnerability within AazDoh, **please do not open a public GitHub issue**.

Instead, please report it via responsible disclosure:

1. **Email**: Send detailed vulnerability specifics to `barkatbashir10@gmail.com` (or create a [Private Security Advisory](https://github.com/aazdoh/aazdoh/security/advisories/new) directly on GitHub).
2. **Details to Include**:
   - Component affected (Backend, Frontend, CLI, or MCP Server).
   - Description and severity of the vulnerability.
   - Step-by-step reproduction instructions or Proof-of-Concept (PoC).
   - Potential impact on user data or system integrity.
3. **Response SLA**: We aim to acknowledge receipt of vulnerability reports within **48 hours** and provide status updates as we develop a mitigation.

---

## 🛡️ Built-in Security Safeguards

### 1. 500-Character Universal Input Ceiling
To prevent prompt injection, oversized payload resource exhaustion, and memory fragmentation, all user inputs and LLM prompts across both the Web UI and Terminal CLI are strictly capped at **500 characters**.

### 2. Delimiter & Prompt Sanitization
All natural language instructions sent to the backend LLM engine (Spring AI) undergo automatic sanitization to neutralize system prompt breakouts, backtick delimiters, and multi-line markdown injections.

### 3. Isolated Credential Storage
- **CLI Configuration**: User API keys are stored exclusively in the OS-isolated user directory (`~/.aazdoh/config.json`) with strict user-only read/write permissions.
- **MCP Server**: The MCP server uses stdio transport and reads API credentials exclusively from environment variables (`AAZDOH_API_KEY`) passed securely by the host AI IDE (Claude Desktop / Cursor / Antigravity).

### 4. Non-Destructive Mutation Receipts & Reversibility
All state-mutating actions executed by AI agents (e.g. creating, completing, rescheduling, or dropping commitments) are recorded in transactional journal logs with instant rollback capabilities via `aazdoh undo`.

### 5. JWT Authentication & Rate Limiting
- All REST endpoints are protected by short-lived signed JWT access tokens.
- API keys generated from the web settings use cryptographically secure `aazdoh_live_` prefixed tokens with SHA-256 hash validation in PostgreSQL.
