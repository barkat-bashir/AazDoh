# 🤝 Contributing to AazDoh

Thank you for your interest in contributing to **AazDoh**!  
We welcome contributions from engineers, designers, and behavioral system builders.

---

## 📑 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Monorepo Architecture](#monorepo-architecture)
3. [Local Development Setup](#local-development-setup)
   - [Backend (Java 21 / Spring Boot 3)](#backend-setup)
   - [Frontend (React 18 / Vite / TypeScript)](#frontend-setup)
   - [CLI Agent (`cli/`)](#cli-setup)
   - [MCP Server (`mcp-server/`)](#mcp-server-setup)
4. [Pull Request & Git Workflow](#pull-request--git-workflow)
5. [Commit Message Conventions](#commit-message-conventions)

---

## 📜 Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all contributors. Please maintain professional, constructive, and respectful interactions across all discussions and pull requests.

---

## 🏗️ Monorepo Architecture

AazDoh is structured as a modular monorepo:

- **`backend/`**: Java 21, Spring Boot 3.3+, Spring AI, PostgreSQL 16, Flyway migrations.
- **`frontend/`**: React 18, TypeScript, Vite, TanStack Query, Vanilla CSS (Kashmir Harud tokens).
- **`cli/`**: TypeScript autonomous terminal agent (`aazdoh-cli` on npm).
- **`mcp-server/`**: Model Context Protocol Server for Claude Desktop, Cursor, Antigravity (`aazdoh-mcp` on npm).

---

## 🛠️ Local Development Setup

### Prerequisites
- **Java JDK 21+**
- **Node.js 18+** & **npm**
- **PostgreSQL 15+**

---

### Backend Setup

```bash
cd backend

# Configure your local PostgreSQL connection
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/aazdoh
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
export JWT_SECRET=your_super_secret_jwt_key_at_least_256_bits_long

# Run Spring Boot (Flyway runs migrations automatically)
./mvnw spring-boot:run
```

Run backend unit tests:
```bash
./mvnw test
```

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server on http://localhost:3000
npm run dev

# Run TypeScript check & production build
npm run build
```

---

### CLI Setup

```bash
cd cli

# Install dependencies
npm install

# Build TypeScript
npm run build

# Link globally for local testing
npm link

# Test CLI
az today
```

---

### MCP Server Setup

```bash
cd mcp-server

# Install dependencies
npm install

# Build TypeScript
npm run build
```

---

## 🚀 Pull Request & Git Workflow

1. **Fork the repository** on GitHub.
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/my-new-feature
   ```
3. **Ensure all builds & tests pass**:
   - Backend: `./mvnw test`
   - Frontend: `npm run build`
   - CLI / MCP: `npm run build`
4. **Commit your changes** following our commit conventions.
5. **Push to your fork** and submit a Pull Request.

---

## 📝 Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new user-facing feature or tool
- `fix:` A bug fix
- `docs:` Documentation updates
- `refactor:` Code restructuring without behavior changes
- `test:` Adding or updating unit/integration tests
- `perf:` Performance enhancements
- `chore:` Dependency bumps, CI updates, or build tooling
