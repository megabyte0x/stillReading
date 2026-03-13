# AGENTS.md

Agent-facing repository guide for `stillReading`.
This file is intended for coding agents operating in this repo.

## 1) Project Snapshot

- Stack: Next.js App Router + React 19 + TypeScript (`strict`) + Supabase.
- Runtime split:
  - Server components/pages under `app/` fetch data and render route shells.
  - Client components under `components/` and `app/**/Client` handle interactions.
- Core domains:
  - RSVP parsing/timing logic in `lib/rsvp-engine.ts`.
  - Article catalog + voting in `app/readthis/*`, `app/api/vote/route.ts`, and Supabase.
  - OG image generation in `app/api/og/route.tsx` (edge runtime).

## 2) Important Paths

- `app/` routes, layouts, API handlers.
- `app/readthis/page.tsx` list page fetch + ISR (`revalidate = 60`).
- `app/readthis/[slug]/page.tsx` article fetch + markdown fallback.
- `components/RSVPReader.tsx` main reader playback state machine.
- `components/ArticleCard.tsx` and `components/VoteModal.tsx` voting UX.
- `lib/rsvp-engine.ts`, `lib/supabase.ts`, `lib/types.ts` shared logic/contracts.
- `app/globals.css` global + `/readthis` styles; `supabase/schema.sql` DB contract.

## 3) Install / Build / Run Commands

Use npm in this repo.

- Install dependencies:
  - `npm install`
- Start local dev server:
  - `npm run dev`
- Production build (required verification gate):
  - `npm run build`
- Run production server locally:
  - `npm run start`

Video tooling (Remotion):

- Open Remotion studio:
  - `npm run video:studio`
- Render launch video variants:
  - `npm run video:render`
  - `npm run video:render:hq`
  - `npm run video:render:4k`
  - `npm run video:render:stillreading-4k`

Content ingestion helper:

- Upload markdown + metadata to Supabase:
  - `./add-article.sh <raw-markdown-url> [slug] [tags]`

## 4) Lint / Typecheck / Test Reality (Current Repo)

- There is no dedicated `lint` script in `package.json` right now.
- There is no dedicated `test` script or test framework currently configured.
- `npm run build` is the primary automated quality gate (compilation, type issues, Next checks).
- Optional fallback checks: `npx tsc --noEmit` and `git diff --name-only`.

## 5) Running a Single Test (Important)

Current state:

- Single-test execution is not available by default because no test runner is installed/configured.

If tests are introduced in your branch/PR, prefer one of these patterns:

- If `npm test` exists and forwards args:
  - `npm test -- path/to/file.test.ts`
- If Vitest is added:
  - `npx vitest run path/to/file.test.ts`
- If Jest is added:
  - `npx jest path/to/file.test.ts`

When adding a test framework, also add script docs here and in `README.md`.

## 6) Manual Verification Checklist

For UI/API changes, verify at minimum:

- `/` reader flow: play/pause, speed adjust, restart, editor load, URL load.
- `/readthis` list flow: search, tag filters, score display, navigation.
- `/readthis/[slug]` article flow: markdown load + completion modal behavior.
- `POST /api/vote`: valid payload returns 200 + `{ ok: true }`; invalid payload returns 400 + error JSON.

## 7) TypeScript and Types

- Keep `strict`-safe code; avoid `any` unless unavoidable and documented.
- Prefer explicit interfaces/types for component props and shared models.
- Use `import type` for type-only imports.
- Keep shared data contracts in `lib/types.ts` when reused across routes/components.
- Preserve nullability from Supabase fields (`string | null`, etc.) and handle fallbacks explicitly.

## 8) Imports and Module Boundaries

- Prefer alias imports via `@/*` over long relative paths.
- Keep import order stable and readable:
  1) external packages
  2) internal alias imports
  3) relative imports
- Keep server-only logic out of client components where possible.
- Add `"use client"` only for modules that truly need client hooks/browser APIs.

## 9) Formatting and Code Style

Match the existing codebase style:

- 2-space indentation.
- Semicolons required.
- Double quotes for strings.
- Trailing commas where TS formatter naturally emits them.
- Keep JSX readable; break long props across lines.
- Avoid introducing new formatting tools/configs unless requested.

## 10) Naming Conventions

- Components: PascalCase (`ArticleCard`, `VoteModal`).
- Variables/functions: camelCase.
- Utility filenames in `lib/`: kebab-case (for example `rsvp-engine.ts`).
- Route segment folders: lowercase (`app/readthis/[slug]`).
- Keep CSS class names semantic and feature-scoped (`readthis-*`, `onboarding-*`).

## 11) Error Handling and API Patterns

- API routes should validate input early and return explicit status codes.
- Return JSON error payloads consistently (`{ error: "..." }`).
- For async fetches in client code, guard `res.ok` and provide safe fallback UI/state.
- Prefer non-throwing fallbacks for degraded-but-usable UX where reasonable (example pattern in `lib/supabase.ts`).
- Log actionable errors for debugging, but avoid noisy logging in hot paths.

## 12) React / Next.js Conventions

- Keep side effects in `useEffect`; cleanup timers/listeners consistently.
- Memoize callbacks/selectors when it materially helps rerender behavior.
- Use server components for data fetching by default; push interactivity into client components.
- For App Router pages, keep metadata colocated in route files when practical.
- Preserve ISR behavior where already configured (`revalidate = 60` on read list page).

## 13) Database / Supabase Notes

- DB source of truth: `supabase/schema.sql`.
- `vote_article` RPC drives score updates; keep API and SQL contract aligned.
- If schema changes, document migration steps in PR notes and update TS types/contracts.
- Never commit new secrets; prefer `.env.local` for local keys.

## 14) Commit / PR Expectations

- Conventional commit prefixes: `feat:`, `fix:`, `chore:`.
- Keep commit subject short, imperative, and scoped.
- PR should include what changed/why, screenshots for UI changes, verification steps, and env/schema notes.

## 15) Cursor/Copilot Rule Files

Checked paths in this repository:

- `.cursor/rules/` (not present)
- `.cursorrules` (not present)
- `.github/copilot-instructions.md` (not present)

If any of these files are added later, treat them as high-priority agent instructions and merge their guidance into this document.
