# ⚡ aazdoh-cli — Autonomous Terminal Accountability Agent

The official terminal CLI & AI Chief of Staff companion for **AazDoh** (Zero-BS Cognitive Accountability).

---

## 🚀 Quickstart

### 1. Installation

```bash
# Global install via npm
npm install -g aazdoh-cli

# Or run directly via npx without install
### 2. Authentication

```bash
# Enter your API key interactively (backend URL is pre-configured to production)
aazdoh login

# Or pass directly via flag:
aazdoh login -k aazdoh_live_your_key_here

# Or set an environment variable in ~/.zshrc or ~/.bashrc:
export AAZDOH_API_KEY="aazdoh_live_your_key_here"
```

---

## 💻 Commands & Usage

### 📋 View Today's Commitments & Workload
```bash
aazdoh today
# or alias
az list
```

### ⚡ Natural Language Execution (Instant)
```bash
# Single-shot command execution
aazdoh "add 45m deep focus task to finish Redis cache refactor"

# Mark things done
aazdoh "completed the redis cache refactor with flying colors"

# Postpone or reschedule
aazdoh "postpone meeting prep to tomorrow because of prod incident"
```

### 💬 Interactive Terminal REPL
```bash
aazdoh chat
```
Inside the interactive session, you have real-time SSE streaming responses, mutation receipts, and slash commands:
- `/today` — view today's table
- `/undo` — revert the last AI mutation
- `/stats` — inspect 7-day velocity
- `/clear` — clear screen
- `/exit` — quit session

### 🛡️ 60-Second Plan Stress Test
```bash
aazdoh stress-test
# Or provide a defense for high workload
aazdoh stress-test --defense "I have no meetings scheduled today"
```

### ⏪ Instant Undo
```bash
aazdoh undo
```

### 📊 Velocity & Cognitive Load Stats
```bash
aazdoh stats --days 7
```

---

## 🛠️ Configuration

Stored in `~/.aazdoh/config.json`:
```json
{
  "apiUrl": "http://localhost:8080",
  "apiKey": "aazdoh_live_..."
}
```

---

## 📄 License
MIT © AazDoh
