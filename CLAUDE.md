# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**stillReading** is an RSVP (Rapid Serial Visual Presentation) speed reader webapp. It takes markdown input and presents words one at a time using Spritz-style ORP (Optimal Recognition Point) highlighting. Deployed at https://stillreading.xyz.

## Architecture

Single-file vanilla HTML/CSS/JS app — no framework, no build step, no bundler. The entire application lives in `index.html`:

- `<style>` — CSS with custom properties (design tokens), responsive breakpoints via `clamp()`, media queries
- `<body>` — Static HTML shell with two views: reader and editor (toggled via `data-view` attribute)
- `<script>` — All logic: ORP algorithm, markdown parser, playback state machine, event listeners

External dependencies: Google Fonts CDN only (JetBrains Mono + Outfit).

## Development

Open `index.html` in a browser. No install, no build.

## Deployment

```bash
vercel deploy --prod
```

Project is linked as "still-reading" on Vercel (scope: megabytes-projects).

## Key Design Decisions

- **ORP alignment**: Word display uses absolute positioning with JS-computed `translateX` to pin the pivot character (red) between vertical guide lines. Earlier approaches using flexbox centering and CSS grid both failed for long words.
- **Responsive sizing**: CSS custom properties (`--word-size`, `--redicle-h`) are overridden per breakpoint. Mobile uses conservative font sizes (`clamp(1.4rem, 6.3vw, 1.8rem)` at 480px) to prevent long words from clipping — no per-word font scaling (bad UX).
- **Full-viewport guide lines**: `::before/::after` pseudo-elements on `.redicle` with `width: 100vw` and `translateX(-50%)`.
- **Fixed header**: `position: fixed` so reader content centers in the true viewport via `min-height: 100vh` + `justify-content: center`.
- **Subtle progress bar**: 1px height, muted zinc color (`#3f3f46`) to avoid distracting from text.

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | The entire app |
| `.claude/skills/rsvp-speed-reader/` | Claude Code skill + React prototype reference |
| `docs/plans/` | Design doc and implementation plan |
