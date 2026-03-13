# OG Image Redesign — "Redicle Hero"

## Problem

Current OG image is flat and low-contrast. Text blends into the dark background, guide lines are too subtle, and the step-by-step instructions add clutter without impact. Fails to grab attention in social feeds.

## Design

Dramatic recreation of the reader UI frozen mid-word. The viewer sees the product in action.

### Layout (1200 x 630)

- **Atmosphere:** Red radial glow (top-left) + blue radial glow (top-right) + faint 72px grid overlay — matches actual app shell
- **Redicle:** Full-width (1000px) bordered region, 160px tall, centered vertically
- **Guide lines:** 2px wide, 32px tall, red (`#dc2626`), full opacity above and below redicle center
- **Word display:** "stillReading" at 96px, mono font, weight 550. Pivot "l" in red at weight 700
- **Footer:** `stillreading.xyz` in muted text (`#52525b`) below redicle
- **No progress bar, no steps, no tagline** — the image speaks for itself

### Colors (from design tokens)

| Element | Value |
|---------|-------|
| Background | `#09090b` |
| Redicle borders | `#222228` |
| Word text | `#e4e4e7` |
| Pivot letter | `#dc2626` |
| Guide lines | `#dc2626` |
| Footer text | `#52525b` |
| Red glow | `rgba(239, 68, 68, 0.16)` |
| Blue glow | `rgba(56, 189, 248, 0.10)` |
| Grid lines | `rgba(148, 163, 184, 0.03)` |

## Implementation

Single file change: `app/api/og/route.tsx`. Uses `@vercel/og` ImageResponse (edge runtime). No new dependencies.

## Decisions

- Dropped progress bar for cleaner composition
- Dropped step-by-step instructions — image is self-explanatory
- Added atmospheric gradients matching actual app for brand consistency
- Larger font size (96px vs 72px) for social feed impact
