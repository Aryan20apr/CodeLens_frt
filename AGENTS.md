# CodeLens Agent Notes

This repository is a Next.js 16 (App Router) frontend for **CodeLens** — an AI-powered code evaluation and PR review platform.

---

## Current Application Features

1. **Landing Page (`app/page.tsx`)**
   - Marketing sections: Hero, Feature grid, Resource metrics strip, and 4-step pipeline overview.
   - Dark cyber/developer aesthetic using custom design tokens and fonts.

2. **Authentication Flow (`app/(auth)`, `lib/auth/`)**
   - Email/password authentication (`/login`, `/register`).
   - GitHub & Google OAuth login and callback handling (`/auth/callback`).
   - Client session storage with user hydration (`GET /api/v1/auth/me`).
   - Protected client routing with `RouteGuard`.
   - Automatic 401 interception and cookie-based token refresh via `authFetch` (`lib/auth/auth-fetch.ts`).

3. **Dashboard Overview (`app/dashboard/page.tsx`)**
   - Stats summary cards, issues breakdown radar chart, quick code editor, and recent evaluations table.

4. **Snippet Evaluation Workspace (`app/dashboard/evaluations/page.tsx`, `components/dashboard/code-review-workspace.tsx`)**
   - Multi-language interactive CodeMirror 6 editor (TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, C#, PHP, Ruby, Swift).
   - Real-time inline code annotations for review findings (severity-based line highlighting and DOM comment widgets).
   - Async review job submission (`POST /api/v1/codereview/job`) and job details / report polling (`GET /api/v1/codereview/{jobId}`).
   - Score badges and categorized finding summary.

5. **GitHub Integration & PR Review (`app/dashboard/github/`, `lib/github/`, `lib/review-runs/`)**
   - GitHub App installation / linking flow (`/dashboard/github/callback`, `GET /api/v1/github/install`, `POST /api/v1/github/installations`).
   - Connected repositories and pull requests explorer (`/dashboard/github?repo={repoId}`).
   - Pull Request Diff Viewer (`/dashboard/github/[repoId]/pull/[pullNumber]`):
     - Side-by-side (split) and unified diff modes via `react-diff-view` & `gitdiff-parser`.
     - File tree / list sidebar with search, change counters, and sticky diff scrolling.
   - Real-time PR AI Review Streaming (`components/dashboard/review-run-workflow.tsx`):
     - Triggers AI review via `POST /api/v1/review-runs/repositories/{repoId}/pull-requests/{pullNumber}`.
     - Live progress events and findings streamed via SSE through Next.js proxy route handler (`app/api/v1/review-runs/[reviewRunId]/stream/route.ts`).

---

## Real Backend API Contract

The frontend connects to the backend API origin configured in `NEXT_PUBLIC_API_BASE_URL` (parsed via `lib/api-config.ts`).

> [!IMPORTANT]
> Always verify API endpoints against the frontend helpers in `lib/` rather than planning docs.

### 1. Auth (`lib/auth/*`)
- `POST /api/v1/auth/login` — Email/password login (returns tokens & user profile).
- `POST /api/v1/auth/register` — New user registration.
- `POST /api/v1/auth/logout` — Revokes session.
- `POST /api/v1/auth/refresh` — Cookie-based access token refresh.
- `GET /api/v1/auth/me` — Fetches current user profile.
- `GET /api/v1/auth/github` & `GET /api/v1/auth/google` — OAuth provider redirect URLs.

### 2. Snippet Code Review (`lib/code-review/*`)
- `POST /api/v1/codereview/job` — Submits code snippet (`{ code, language, filename }`) for evaluation.
- `GET /api/v1/codereview/:jobId` — Fetches review job status, progress percentage, timeline events, and final report findings.

### 3. GitHub App & Repositories (`lib/github/*`)
- `GET /api/v1/github/install` — Fetches GitHub App installation URL.
- `POST /api/v1/github/installations` — Links GitHub installation ID to user account.
- `GET /api/v1/repositories` — Lists connected installations and repositories.
- `GET /api/v1/repositories/:repoId/pull-requests?state={open|closed|all}` — Lists pull requests for a repo.
- `GET /api/v1/repositories/:repoId/pull-requests/:pullNumber` — Fetches PR details.
- `GET /api/v1/repositories/:repoId/pull-requests/:pullNumber/files` — Fetches modified files with patch diffs.

### 4. AI Review Runs / Streaming (`lib/review-runs/*`, `app/api/v1/review-runs/*`)
- `POST /api/v1/review-runs/repositories/:repoId/pull-requests/:pullNumber` — Starts PR review workflow; returns `{ reviewRunId }`.
- `GET /api/v1/review-runs/:reviewRunId/stream` — SSE stream endpoint. Frontend proxies this via the Next.js Route Handler (`app/api/v1/review-runs/[reviewRunId]/stream/route.ts`) to avoid browser streaming/CORS friction.

---

## Frontend Architecture & Patterns

- **Next.js 16 App Router**: Server components for route layouts and metadata; Client components (`"use client"`) for interactive editors, stateful forms, and streaming widgets.
- **Dynamic Route Handlers**: `app/api/v1/review-runs/[reviewRunId]/stream/route.ts` uses `export const dynamic = "force-dynamic"` and passes upstream `ReadableStream` directly to the browser client with `text/event-stream` headers.
- **Session & Auth Management**:
  - Session tokens are stored in `sessionStorage` via `lib/auth/session.ts`.
  - Authenticated API calls MUST use `authFetch` (`lib/auth/auth-fetch.ts`), which automatically attaches the `Authorization: Bearer <token>` header and handles a 401 by attempting `tryRefreshSession()` before a single retry.
- **CodeMirror 6 Extensions**:
  - `@uiw/react-codemirror` configured with `oneDark` theme and dynamic language parsers.
  - Custom line decorations (`Decoration.line`) and DOM widgets (`WidgetType`) render inline finding badges and comments inside the editor gutter/lines.
- **Diff Parsing**:
  - `gitdiff-parser` parses unified diff patches into structured hunks.
  - `react-diff-view` renders split or unified views with custom styles defined in `components/dashboard/pr-diff-view.css`.
- **Styling & Design System**:
  - Tailwind CSS v4 (`@tailwindcss/postcss`).
  - Dark mode color tokens, surfaces, and shadows defined in `app/globals.css`.
  - Fonts: Geist Sans, Geist Mono, Inter, and Space Grotesk.

---

## Tooling & Commands

- **Package Manager**: `pnpm` (`pnpm@10.17.1`)
- **Dev Server**: `pnpm dev` (runs on port `3001`)
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`

---

## Repository Map

```
├── app/
│   ├── (auth)/                    # Guest auth routes (login, register)
│   ├── api/v1/review-runs/        # Next.js Route Handlers (SSE proxy for review runs)
│   ├── auth/callback/             # OAuth callback handler
│   ├── dashboard/                 # Protected dashboard area
│   │   ├── evaluations/           # Snippet evaluation workspace
│   │   ├── github/                # GitHub repo browser & installation callback
│   │   │   └── [repoId]/pull/[pullNumber]/ # PR diff viewer & AI review runner
│   │   └── page.tsx               # Main dashboard overview
│   ├── layout.tsx                 # Root layout & font configuration
│   └── page.tsx                   # Public landing page
├── components/
│   ├── auth/                      # Sign-in, register, OAuth buttons & RouteGuard
│   ├── dashboard/                 # CodeMirror editor, PR diff viewer, SSE workflow, sidebar, topbar
│   ├── landing/                   # Landing page hero, feature grid, pipeline steps
│   └── ui/                        # Reusable status chips and score badges
├── lib/
│   ├── api-config.ts              # Backend API base URL resolver
│   ├── auth/                      # Session storage, authFetch, token refresh & login/register helpers
│   ├── code-review/               # Snippet review job API client & types
│   ├── github/                    # GitHub repository/PR API client, patch normalizer & route helpers
│   └── review-runs/               # PR review trigger, SSE stream parser, and state machine
```

---

## Development Guidelines

1. **API Calls**: Always use `authFetch` from `lib/auth/auth-fetch.ts` for authenticated endpoints so token refresh is handled seamlessly.
2. **Next.js Conventions**: Consult docs in `node_modules/next/dist/docs/` when adjusting server/client boundaries, dynamic params (e.g. `await params`), or route handler streaming.
3. **UI Consistency**: Maintain the dark aesthetic and color tokens (`var(--surface-*)`, `var(--primary)`, `var(--on-surface)`, etc.) defined in `app/globals.css`.
