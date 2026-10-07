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

## Architecture & Directory Structure

```
apps/backend/
├── src/
│   ├── index.ts                 # Express application entrypoint & Redis connection
│   ├── constants/               # System prompts, tool definitions, and environment configs
│   │   ├── env.ts               # Environment variable validation
│   │   ├── prompts.ts           # Agent system prompt & framework instructions
│   │   └── tools.ts             # Function calling definitions for DeepSeek
│   ├── controllers/
│   │   ├── file.controller.ts   # Sandbox file tree & file content reading
│   │   └── project.controller.ts# Project creation, updates, deletion, Q&A, and metadata
│   ├── middlewares/
│   │   └── auth.middleware.ts   # JWT authentication middleware
│   ├── providers/
│   │   └── deepseek.ts          # DeepSeek LLM client and chat completions wrapper
│   ├── routes/
│   │   ├── index.ts             # Root router & health check
│   │   └── project.route.ts     # Protected project management routes
│   └── utils/
│       ├── agent-loop.ts        # Core autonomous agent loop and tool execution
│       ├── event-stream.ts      # Server-Sent Events client manager
│       ├── project-schema.ts    # Zod schemas for project input validation
│       ├── redis.ts             # Redis client and connection handlers
│       ├── screenshot.ts        # Puppeteer screenshot capture utility
│       └── tools/               # Individual tool handlers (bash, files, build, qna)
│           ├── bash.ts
│           ├── build-project.ts
│           ├── delete-file.ts
│           ├── qna.ts
│           ├── read-file.ts
│           ├── run-project.ts
│           └── write-file.ts
├── package.json
└── tsconfig.json
```

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

# AI Provider
DEEPSEEK_API_KEY=your_deepseek_api_key

# E2B Sandbox Platform
E2B_API_KEY=your_e2b_api_key
SANDBOX_TIMEOUT_MS=240000

# Cache
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600000

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
- **DeepSeek API Key**: From [platform.deepseek.com](https://platform.deepseek.com)

### Installation & Run

From the monorepo root or inside `apps/backend/`:

```bash
# Install dependencies
bun install

# Start development server with hot-reload
bun run dev
```

The backend API server will start on `http://localhost:3001`.
