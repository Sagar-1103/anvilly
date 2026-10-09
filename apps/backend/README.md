# Anvilly Backend: Autonomous AI Agent Orchestrator & Sandbox Engine

## Features

- **Autonomous Agent Loop**: Iterative ReAct-style agent cycle (`agent-loop.ts`) that analyzes user prompts, plans architecture, creates source files, installs packages, runs builds, and starts dev servers.
- **Agent Tool Ecosystem**: Modular tool architecture including:
  - `write_file_tool`: Creates or updates source code inside the sandbox container.
  - `read_file_tool`: Reads configuration files and existing code to guide subsequent edits.
  - `delete_file_tool`: Deletes deprecated or conflicting files during code refactoring.
  - `bash_tool`: Executes arbitrary terminal commands (package installations, environment checks).
  - `build_project_tool`: Runs compile commands and reports compiler/bundler errors back to the agent for auto-repair.
  - `run_project_tool`: Starts and restarts development servers (Bun/Expo) within the container.
  - `qna_tool`: Pauses execution and requests clarification from the user with interactive structured choices when specifications are ambiguous.
- **Isolated E2B Sandboxes**: Provisions dedicated, secure E2B container environments per project with automatic timeout handling and tunnel URL routing.
- **Server-Sent Events (SSE)**: Custom streaming implementation (`event-stream.ts`) delivering live reasoning steps, tool invocations, shell outputs, and build progress to the client.
- **Automated Puppeteer Previews**: Background headless Chromium instance (`screenshot.ts`) takes full-page WebP screenshots of generated web apps to populate showcase cards.
- **Redis Caching & Heartbeats**: Caches file trees, sandbox statuses, and handles project pinging to optimize performance.
- **Prisma & PostgreSQL Integration**: Manages user projects, sandbox associations, prompt history, and metadata updates via `@repo/db`.

---

## Tech Stack

- **Runtime**: Bun
- **Framework**: Express 5 (ES modules)
- **AI / LLM Engine**: DeepSeek API (`deepseek-flash`)
- **Sandboxes**: E2B Code Interpreter (`@e2b/code-interpreter`, `e2b`)
- **Database**: PostgreSQL with Prisma ORM (`@repo/db`)
- **Cache**: Redis (`redis`)
- **Headless Browser**: Puppeteer
- **Authentication**: JWT verification (`jsonwebtoken`, `bcryptjs`)
- **Validation**: Zod v4

---

## Architecture

![Anvilly System Architecture](../../anvilly-architecture.png)

- **Client Layer (Next.js & Monaco IDE)**: Browser workspace where users enter prompts, inspect code in Monaco, and interact with the live iframe / Expo preview.
- **Orchestration Layer (Express Backend)**: The central control unit coordinating user requests, the autonomous agent loop, and real-time SSE progress streaming.
- **Intelligence Layer (DeepSeek API)**: The reasoning engine that plans application structures, writes code, and executes structured tool calls.
- **Runtime Layer (E2B Cloud Sandboxes)**: Isolated, persistent cloud containers where code is executed, packages are installed, dev servers run, and Puppeteer captures screenshots.
- **Persistence Layer (PostgreSQL & Redis)**: PostgreSQL stores users, projects, and metadata via Prisma, while Redis handles session state, sandbox status, and cache.

---

## API Reference

All project routes require authentication via a Bearer JWT token in the `Authorization` header.

### System
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint returning `{ success: true }`. |

### Projects (`/api/projects`)
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/projects` | Initiates new project creation, boots E2B sandbox, and starts the autonomous agent loop. |
| `GET` | `/api/projects` | Lists all projects owned by the authenticated user. |
| `GET` | `/api/projects/:projectId` | Fetches details and active sandbox state for a specific project. |
| `POST` | `/api/projects/:projectId` | Submits a follow-up prompt or modification request to the agent for an existing project. |
| `PATCH` | `/api/projects/:projectId` | Updates project title and description metadata. |
| `DELETE` | `/api/projects/:projectId` | Deletes a project from the database and terminates its active E2B sandbox container. |
| `POST` | `/api/projects/answer` | Submits user selected answer for a pending `qna_tool` question to resume the agent. |
| `GET` | `/api/projects/ping/:projectId` | Keeps the sandbox container alive and resets timeout counters. |
| `GET` | `/api/projects/:projectId/files` | Retrieves the file tree of the active sandbox. |
| `GET` | `/api/projects/:projectId/files/read?path=<path>` | Reads raw file content from the sandbox filesystem. |

---

## Environment Configuration

Create a `.env` file in `apps/backend/`:

```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_jwt_secret_key_minimum_32_characters

# Credential Service Platform (Required)
CREDENTIAL_SERVICE_URL=http://127.0.0.1:3002
INTERNAL_SERVICE_SECRET=your_internal_service_secret

# E2B Sandbox Platform
E2B_API_KEY=your_e2b_api_key
SANDBOX_TIMEOUT_MS=240000

# Cache
REDIS_URL=redis://localhost:6379

# Redis Cache TTLs (Optional - defaults shown in seconds)
SESSION_TTL_SECONDS=900          # 15 minutes
STATE_CACHE_TTL_SECONDS=604800   # 7 days
CHAT_CACHE_TTL_SECONDS=3600      # 1 hour
LOCK_TTL_SECONDS=120             # 2 minutes

# Database Connection (Prisma)
DATABASE_URL=postgresql://username:password@localhost:5432/anvilly_db
```

---

## Getting Started

### Prerequisites

- **Bun**: v1.1+ ([Installation](https://bun.sh))
- **PostgreSQL**: Running instance with migrations applied (`bunx prisma db push`)
- **Redis**: Running instance (local or hosted)
- **E2B API Key**: From [e2b.dev](https://e2b.dev)
- **AI Provider API Key**: OpenAI, DeepSeek, or OpenRouter key (configured in user vault)

### Installation & Run

From the monorepo root or inside `apps/backend/`:

```bash
# Install dependencies
bun install

# Start development server with hot-reload
bun run dev
```

The backend API server will start on `http://localhost:3001`.
