# Anvilly Web: Next.js Frontend & App Showcase

## Features

- **Prompt Forge & App Creation**: Prompt input interface supporting dual platform targets:
  - **Web Applications**: React 19, Bun, Tailwind CSS v4, and Shadcn UI.
  - **Mobile Applications**: React Native and Expo SDK.
- **In-Browser Workspace (`/projects/[id]`)**:
  - **Multi-Tab Monaco Code Editor**: High-performance code editor (`@monaco-editor/react`) featuring file tabs, syntax highlighting, and live filesystem navigation.
  - **Real-Time Agent Chat Sidebar**: Direct Server-Sent Events (SSE) feed displaying the AI agent's reasoning steps, tool executions, terminal outputs, and error resolution progress.
  - **Interactive Human-in-the-Loop Q&A**: Dynamically renders interactive question cards when the agent triggers `qna_tool`, allowing users to select architectural choices and unblock code generation.
  - **Multi-Device Live Web Preview**: Real-time iframe preview with viewport switching between Desktop, Tablet, and Mobile layouts, container reloading, and external tab launcher.
  - **Expo Go QR Mobile Testing**: Dynamic QR code generator rendering live Expo tunnel endpoints for scanning and testing mobile apps instantly on physical iOS and Android devices.
- **Project Showcase & Management**:
  - Filter projects by platform (All, Web Apps, Mobile Apps) or search by project name.
  - Card menus with hover actions and non-clipped dropdowns.
  - In-place project edit modal to rename projects and adjust descriptions with live synchronization.
  - Safe project deletion with automatic cloud container de-provisioning.
- **Authentication**: NextAuth.js session management supporting Credentials (email/password with bcrypt hashing) and OAuth providers (Google, GitHub, Discord) backed by PostgreSQL.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack) & React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, `tw-animate-css`
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **UI Components**: Radix UI primitives, Lucide React, Sonner toasts
- **Markdown & Code Rendering**: `react-markdown`, `remark-gfm`
- **Mobile QR Generator**: `qrcode.react`
- **Authentication**: NextAuth.js
- **API Client**: Axios

---

## Environment Configuration

Create a `.env` file in `apps/web/`:

```env
# Backend API Endpoint
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key_minimum_32_characters

# Database Connection (Prisma)
DATABASE_URL=postgresql://username:password@localhost:5432/anvilly_db

# Optional OAuth Providers
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
```

---

## Getting Started

### Prerequisites

- **Bun**: v1.1+ ([Installation](https://bun.sh))
- **Node.js**: v18+ (for Next.js Turbopack compatibility)
- **Running Backend**: The backend service must be running on `http://localhost:3001`
- **Database**: PostgreSQL database with schema pushed (`bunx prisma db push`)

### Installation & Run

From the monorepo root or inside `apps/web/`:

```bash
# Install dependencies
bun install

# Start Next.js development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
