# Figma Design System Rules — stillReading

Rules for translating Figma designs into code for the stillReading project. Follow these for every Figma-driven change.

---

## Figma MCP Integration Flow

### Required Steps (do not skip)

1. Run `get_design_context` first to fetch the structured representation for the exact node(s)
2. If the response is too large or truncated, run `get_metadata` to get the high-level node map, then re-fetch only the required node(s) with `get_design_context`
3. Run `get_screenshot` for a visual reference of the node variant being implemented
4. Only after you have both `get_design_context` and `get_screenshot`, download any assets needed and start implementation
5. Translate the output (React + Tailwind) into this project's conventions (plain CSS with custom properties)
6. Validate against Figma screenshot for 1:1 look and behavior before marking complete

### Translation Rules

- IMPORTANT: Figma MCP output is React + Tailwind — treat it as a design reference, NOT final code
- Replace ALL Tailwind utility classes with plain CSS using the project's custom properties in `app/globals.css`
- Reuse existing components from `components/` instead of duplicating functionality
- Map Figma colors to CSS custom properties (see Design Tokens below), never hardcode hex values
- Respect existing routing, state management, and data-fetch patterns

---

## Design Tokens

All design tokens are CSS custom properties defined in `:root` within `app/globals.css`.

### Colors

```css
--bg: #09090b;              /* page background (near-black) */
--surface: #111113;         /* card/panel backgrounds */
--border: #222228;          /* standard border */
--border-dim: #18181c;      /* subtle border */
--text: #e4e4e7;            /* primary text (zinc-200) */
--text-muted: #52525b;      /* secondary text (zinc-600) */
--text-dim: #3f3f46;        /* very dim text (zinc-700) */
--accent: #dc2626;          /* red accent — ORP pivot, logo, CTAs */
--accent-dim: rgba(220, 38, 38, 0.08); /* subtle accent bg */
```

- IMPORTANT: Never hardcode hex colors — always use `var(--token-name)`
- When Figma shows a color not in this palette, find the closest existing token or propose a new one with rationale

### Typography

```css
--mono: "JetBrains Mono", monospace;  /* code, reader display, technical text */
--sans: "DM Sans", sans-serif;        /* UI labels, body text, headings */
```

- Fonts are loaded from Google Fonts CDN in `app/layout.tsx` using `next/font/google`
- IMPORTANT: Do not add new font imports without discussion

### Fluid Sizing

```css
--word-size: clamp(2rem, 5vw, 4.5rem);       /* reader word display */
--redicle-h: clamp(100px, 14vw, 220px);       /* reader window height */
```

- Use `clamp()` for responsive sizing — no fixed pixel values for text or layout dimensions
- Breakpoint overrides exist at 480px, 360px, and landscape <=500px height

---

## Component Organization

### Directory Structure

```
components/          # Shared, reusable React components
  RSVPReader.tsx     # Core RSVP reader — playback engine + UI shell (700+ lines)
  ArticleCard.tsx    # Article list card with voting
  SearchBar.tsx      # Debounced search input
  TagFilter.tsx      # Tag pill filter strip
  VoteModal.tsx      # Post-read vote overlay

app/                 # Next.js App Router pages
  page.tsx           # Home — server component
  readthis/
    page.tsx         # Article list — server component (ISR 60s)
    ReadThisClient.tsx  # Client component for search/filter/display
    [slug]/
      page.tsx          # Article detail — server component
      ArticleReader.tsx # Client component wrapping RSVPReader

lib/                 # Pure utilities + data access
  rsvp-engine.ts     # ORP algorithm, markdown parser, timing logic
  supabase.ts        # Supabase client singleton
  types.ts           # TypeScript interfaces (Article, etc.)
```

### Rules

- IMPORTANT: Always check `components/` for existing components before creating new ones
- Place new shared UI components in `components/`
- Place page-specific client components co-located in the relevant `app/` route directory
- Pure utilities and data access go in `lib/`
- PascalCase filenames matching the default export name
- All components are default exports

---

## Styling Approach

### Plain CSS — No Framework

- IMPORTANT: This project uses plain CSS with custom properties. No Tailwind, no CSS Modules, no styled-components.
- ALL styles live in a single file: `app/globals.css` (imported once in `app/layout.tsx`)
- New styles go in `app/globals.css`, organized by section (see below)

### CSS File Organization (in `app/globals.css`)

1. Design tokens (`:root`) + resets
2. Header / logo / nav-tabs
3. View switching (`[data-view]` attribute selectors)
4. Reader shell + ambient gradients + grid overlay
5. Content title / onboarding banner
6. Redicle (word display window) + guide lines
7. Word display (`.word-text`, `#w-before`, `#w-pivot`, `#w-after`)
8. Reader console: progress bar, controls, speed buttons, play button
9. Focus mode
10. WPM popup
11. Footer
12. Editor view
13. Responsive breakpoints (768px, 480px, 360px, landscape)
14. `readthis` page styles (search, tags, article grid, cards, vote modal)
15. Readthis responsive breakpoints

- IMPORTANT: Add new styles in the appropriate section, not at the end of the file
- Use CSS class selectors (`.class-name`) — avoid element selectors unless resetting

### Responsive Design

- Use `clamp()` for fluid typography and spacing
- Breakpoints: 768px (tablet), 480px (mobile), 360px (small mobile), landscape <=500px height
- Override CSS custom properties within `@media` blocks for breakpoint-specific values
- Article grid: 1 col default -> 2 col at 640px -> 3 col at 960px via CSS Grid

---

## Component Patterns

### TypeScript Props

- Define explicit `interface` for props above each component
- Use optional props with sensible defaults for configurability

```typescript
interface ExampleProps {
  title?: string;        // optional with default
  onAction: () => void;  // required callback
  variant?: 'primary' | 'secondary';  // union type for variants
}
```

### State Management

- No external state library — use React `useState` and `useRef`
- For performance-critical loops (playback engine), use mutable refs to avoid stale closures
- Server components do data fetching; client components handle interactivity
- State is local or lifted one level — no global store

### Import Conventions

- Use path alias `@/` which maps to project root: `@/components/RSVPReader`, `@/lib/types`
- IMPORTANT: Always use `@/` imports, never relative paths beyond the current directory

### Client vs Server Components

- Route-level `page.tsx` files are server components (data fetching, SSR)
- Interactive UI components are `"use client"` — mark at top of file
- Data fetching happens in server components via Supabase client (`lib/supabase.ts`)
- Client components call API routes (`/api/*`) via `fetch()`

---

## Asset Handling

- IMPORTANT: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly
- IMPORTANT: DO NOT import/add new icon packages — all assets should come from the Figma payload
- IMPORTANT: DO NOT use or create placeholder images if a localhost source is provided
- Store downloaded static assets in `public/`
- Fonts are served via Google Fonts CDN — do not self-host

---

## Key Design Decisions

These are intentional architectural choices — do not change without discussion:

- **ORP alignment**: Word display uses absolute positioning with JS-computed `translateX` to pin the pivot character (red) between vertical guide lines. Do not attempt flexbox or grid alternatives.
- **Full-viewport guide lines**: `::before/::after` pseudo-elements on `.redicle` with `width: 100vw` and `translateX(-50%)`
- **Fixed header**: `position: fixed` so reader content centers in true viewport via `min-height: 100vh` + `justify-content: center`
- **Subtle progress bar**: 1px height, muted zinc color (`var(--text-dim)`) — intentionally minimal
- **Dark theme only**: No light mode. All colors assume dark background (`--bg: #09090b`)
- **Single CSS file**: All styles in `globals.css` — no per-component stylesheets

---

## Figma-to-Code Checklist

When implementing a Figma design, verify each item:

- [ ] Used `get_design_context` + `get_screenshot` before starting
- [ ] All colors mapped to existing CSS custom properties (no hardcoded hex)
- [ ] Typography uses `var(--sans)` or `var(--mono)` font families
- [ ] Responsive sizing uses `clamp()` or breakpoint overrides
- [ ] Checked `components/` for reusable components before creating new ones
- [ ] New styles added to correct section in `globals.css`
- [ ] Component uses TypeScript interface for props
- [ ] Imports use `@/` path alias
- [ ] Final UI validated against Figma screenshot for 1:1 parity
