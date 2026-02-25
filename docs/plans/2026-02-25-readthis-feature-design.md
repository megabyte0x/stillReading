# "you should read this" Feature Design

**Date:** 2026-02-25
**Status:** Approved

## Overview

A curated reading list at `/readthis` where users browse, search, filter, and speed-read articles. You curate content manually via Supabase; readers consume and vote anonymously.

## Key Decisions

| Decision | Choice |
|----------|--------|
| Content source | Owner-curated via Supabase dashboard |
| Voting model | Anonymous, 1 vote per article per browser (localStorage) |
| Framework | Next.js App Router (full migration from vanilla HTML) |
| Content storage | Source URL + cached markdown body in Supabase |
| Vote semantics | Single vote — card and post-reading modal share it |

## Database Schema

**Supabase `articles` table:**

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` (PK, default gen) | |
| `slug` | `text` (unique, not null) | URL-friendly identifier |
| `title` | `text` (not null) | Display title |
| `source_url` | `text` | Original article URL |
| `markdown_body` | `text` (not null) | Cached markdown content |
| `tags` | `text[]` | Array: `['ai', 'crypto', 'self-help']` |
| `word_count` | `integer` | Pre-computed for read-time display |
| `upvotes` | `integer` (default 0) | |
| `downvotes` | `integer` (default 0) | |
| `score` | `integer` (default 0) | `upvotes - downvotes`, sorting key |
| `created_at` | `timestamptz` (default now) | |

**RLS:** Public `select` on `articles`. Votes go through Supabase RPC `vote_article(article_id, direction)` — atomically increments counter and recalculates `score`. No direct `update` access.

## App Structure

```
app/
├── layout.tsx              # Root layout — fonts, dark theme globals
├── page.tsx                # "/" — existing RSVP reader (ported from index.html)
├── globals.css             # CSS custom properties, design tokens
├── readthis/
│   ├── page.tsx            # "/readthis" — article grid + search + tag filters
│   └── [slug]/
│       └── page.tsx        # "/readthis/[slug]" — RSVP reader with article content
├── api/
│   ├── og/route.ts         # OG image generation (port existing api/og.js)
│   └── vote/route.ts       # POST — increment upvote/downvote via Supabase RPC
lib/
├── supabase.ts             # Supabase client (server + browser)
├── rsvp-engine.ts          # Pure JS: ORP, getWordDelay, parseMarkdown, tick logic
└── types.ts                # Article type definition
components/
├── RSVPReader.tsx          # Reader UI — redicle, controls, progress, stats
├── ArticleCard.tsx         # Grid card — title, read time, play, vote
├── TagFilter.tsx           # Horizontal tag pills
├── SearchBar.tsx           # Search input with debounced filtering
├── VoteModal.tsx           # Post-reading upvote/downvote modal
└── Header.tsx              # Shared header with nav tabs
```

## Routing

- **`/`** — Home reader. Supports `/?url=...` and path-based URL loading. Has "Edit" tab.
- **`/readthis`** — Server-rendered article listing. Sorted by `score DESC`. Search + tag filtering client-side.
- **`/readthis/[slug]`** — Fetches article from Supabase, renders RSVPReader. On completion shows VoteModal.

## UI Design

### `/readthis` Page (top to bottom)

1. **Header** — Same site header, "you should read this" tab active
2. **Heading** — "These are real good ones!" (Outfit font, centered)
3. **Search bar** — Full-width, placeholder "Search articles...", debounced title filter
4. **Tag strip** — Horizontal scrollable pill buttons (`self-help`, `ai`, `crypto`, `investments`, `geopolitics`, `stocks`). Multiple active = AND filter. "All" clears.
5. **Article grid** — Responsive: 1 col mobile, 2 col tablet, 3 col desktop

### Article Card

```
┌──────────────────────────────────────┐
│  ▲                                 ▶ │
│  12      Article Title Here          │
│  ▼       3m 24s to stillread         │
└──────────────────────────────────────┘
```

- **Left:** Up/down arrows + score. Green/red active state if voted (localStorage).
- **Right:** Play button → `/readthis/[slug]`
- **Center:** Title (bold, 2-line truncate), read time at 300 WPM

### `/readthis/[slug]` Page

- Identical reader UI to home (`/`), pre-loaded with article content
- Header shows article title + back link to `/readthis`
- On last word → VoteModal slides up:

```
┌─────────────────────────────┐
│     Did you enjoy this?     │
│                             │
│      👍          👎         │
│                             │
│      Skip                   │
└─────────────────────────────┘
```

- Vote → `POST /api/vote`, sets `localStorage[voted_<id>]`
- Skip or vote → redirects to `/readthis`

## Vote API

`POST /api/vote` body: `{ articleId: string, direction: "up" | "down" }`

Calls Supabase RPC `vote_article(article_id, direction)`:
- Atomically increments `upvotes` or `downvotes`
- Recalculates `score = upvotes - downvotes`
- No auth — rate-limiting is client-side via localStorage

## Migration Strategy

1. Initialize Next.js project in the repo
2. Port `index.html` CSS to `globals.css`
3. Extract RSVP engine logic to `lib/rsvp-engine.ts`
4. Build `RSVPReader.tsx` component wrapping the engine
5. Port home page (`/`) to `app/page.tsx` using RSVPReader
6. Set up Supabase project, create `articles` table + RPC
7. Build `/readthis` page with grid, search, tags
8. Build `/readthis/[slug]` page with RSVPReader + VoteModal
9. Port `api/og.js` to `app/api/og/route.ts`
10. Update Vercel deployment config
