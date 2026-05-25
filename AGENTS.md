# CodeLens Agent Notes

This repository is a Next.js 16 App Router frontend for **CodeLens**. The current app is a product shell with:

- a landing page at `app/page.tsx`
- auth flows for email/password plus GitHub and Google OAuth under `app/(auth)`
- an OAuth callback page at `app/auth/callback/page.tsx`
- a protected dashboard at `app/dashboard` with hardcoded demo content for stats, charts, editor, and recent evaluations

## Important Context

- The docs in `.agent/docs` are product-planning documents and may describe future backend work that is not implemented here.
- Any API endpoint tables in those docs are **not authoritative** for this repo. They do not necessarily match the real backend routes.
- Before wiring up or changing an API call, verify the actual contract in the current codebase, especially in `lib/auth/*` and the auth callback/session helpers.
- Do not invent backend endpoints from the docs. If a route is needed, confirm it against the real backend or align with the frontend helpers already in use.

## Current Frontend Structure

- Root layout and fonts live in `app/layout.tsx`.
- Auth pages use `RouteGuard` to keep signed-in users out of guest-only routes and to redirect unauthenticated users away from protected routes.
- Session state is browser-managed in `lib/auth/session.ts` and refreshed from the backend via `lib/auth/refresh-session.ts`. Authenticated API calls should use `lib/auth/auth-fetch.ts` so a 401 triggers one refresh-and-retry cycle.
- Auth requests use `NEXT_PUBLIC_API_BASE_URL` as the backend origin. It must point to the API host, not the Next.js app.
- Dashboard content is currently mocked/hardcoded, so treat it as UI scaffolding unless the user asks to connect real data.

## Working Rules

- Read the relevant Next.js docs in `node_modules/next/dist/docs/` before changing routing, metadata, server/client boundaries, or other Next-specific behavior. This project notes that Next.js conventions may differ from older training data.
- Use the App Router conventions already present in the repo.
- Keep UI changes consistent with the current visual language: dark landing page, polished auth panel, and dashboard cards using the existing CSS variables and font setup.
- Prefer small, localized changes over broad rewrites unless the task clearly calls for a larger refactor.
- When editing auth or dashboard flows, check both the page component and the supporting helper/component files so redirects, session state, and navigation stay aligned.

## Tooling

- Package manager: `pnpm`
- Dev server: `pnpm dev` on port `3001`
- Build: `pnpm build`
- Lint: `pnpm lint`

## Repository Map

- `app/` - routes, layouts, and page entry points
- `components/auth/` - sign-in, registration, OAuth, and guard UI
- `components/dashboard/` - dashboard shell and hardcoded demo widgets
- `components/landing/` - marketing/landing-page sections
- `lib/auth/` - browser auth helpers, session storage, OAuth URL helpers, and API calls

## If You Need To Extend The App

- For auth changes, keep the login/register/OAuth callback/session flow consistent end to end.
- For dashboard work, decide whether the data should stay mocked or be replaced with a real backend contract before coding.
- For any new backend integration, update the frontend helpers first only after the actual API shape is confirmed.
