# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router routes (`page.tsx`, `layout.tsx`), API handlers in `app/api/*`, and article flows in `app/readthis/*`.
- `components/`: reusable React UI components (PascalCase files like `ArticleCard.tsx`).
- `lib/`: shared TypeScript logic and adapters (`rsvp-engine.ts`, `supabase.ts`, `types.ts`).
- `supabase/schema.sql`: database schema and RPC definitions used by API routes.
- `public/`: static assets and helper install scripts.
- `docs/plans/`: design and implementation notes.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start local dev server at `http://localhost:3000`.
- `npm run build`: create a production build (also catches TypeScript/app-router issues).
- `npm run start`: run the built app.
- `./add-article.sh <raw-markdown-url> [slug] [tags]`: upload article markdown + metadata to Supabase.

There are currently no `lint` or `test` npm scripts; use `npm run build` plus manual checks before opening a PR.

## Coding Style & Naming Conventions
- Language: TypeScript (`strict` mode in `tsconfig.json`).
- Match existing formatting: 2-space indentation, semicolons, double quotes.
- Prefer `@/*` import aliases over long relative paths.
- Naming: PascalCase for React components, camelCase for variables/functions, kebab-case for utility filenames in `lib/`.
- Keep route segment folders lowercase (example: `app/readthis/[slug]`).

## Testing Guidelines
- No automated test framework is configured yet.
- For each change, run `npm run build` and manually validate:
  - `/` reader flow
  - `/readthis` list/filter flow
  - `/readthis/[slug]` article rendering
  - `POST /api/vote` valid and invalid payloads
- If you add tests, colocate as `*.test.ts` or `*.test.tsx` near the changed module. Prioritize parser/timing logic and API behavior.

## Commit & Pull Request Guidelines
- Follow existing Conventional Commit style: `feat:`, `fix:`, `chore:`.
- Keep subjects short, imperative, and scoped to one change.
- PRs should include: summary + rationale, linked issue (if any), screenshots/GIFs for UI updates, and manual verification steps.
- Call out env/schema changes explicitly (for example `.env.local` keys or `supabase/schema.sql` updates).
