---
name: rsvp-speed-reader
description: Build and extend an RSVP (Rapid Serial Visual Presentation) speed reading webapp that takes Markdown input and presents words one at a time using the Spritz-style ORP (Optimal Recognition Point) technique. Use this skill whenever working on the RSVP reader project, adding features to it, fixing bugs, styling changes, or extending its functionality. Also use when the user mentions speed reading, RSVP, Spritz, word-by-word reading, ORP, redicle, or any feature requests related to this project — even if they just say "the reader" or "my reading app".
---

# RSVP Speed Reader Webapp

A webapp that takes Markdown content and presents it word-by-word using the RSVP (Rapid Serial Visual Presentation) technique with ORP (Optimal Recognition Point) highlighting — the same approach pioneered by Spritz Inc.

## The Science Behind It

When reading traditionally, your eyes make rapid jumps called **saccades** between words. Spritz developers claimed ~80% of reading time is spent on these eye movements. RSVP eliminates saccades entirely by displaying words at a fixed focal point.

The key innovation is the **Optimal Recognition Point (ORP)** — the letter in each word where the brain most efficiently begins recognition. Research shows this position is slightly left of center, roughly at the first third of the word. By highlighting the ORP in a contrasting color (red) and aligning all ORPs at the same screen position, the reader's eyes never need to move.

The display frame is called a **"redicle"** — a visual container with vertical guide markers that help the eye stay fixed on the ORP position.

### ORP Calculation

The ORP position shifts further into the word as word length increases:

| Word Length | ORP Index (0-based) | Example        |
|-------------|---------------------|----------------|
| 1           | 0                   | **I**          |
| 2–5         | 1                   | h**e**llo      |
| 6–9         | 2                   | pr**e**sented  |
| 10–13       | 3                   | com**p**rehension |
| 14+         | 4                   | subs**t**antially |

```javascript
function getORP(word) {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}
```

### Adaptive Timing

Not all words should display for the same duration. Longer words and punctuated words need more processing time:

```javascript
function getWordDelay(word, baseDelay) {
  let multiplier = 1;
  if (word.length > 8) multiplier += 0.3;   // long words
  if (word.length > 12) multiplier += 0.2;  // very long words
  if (/[.!?]$/.test(word)) multiplier += 1.2;  // sentence endings — big pause
  else if (/[,;:]$/.test(word)) multiplier += 0.5;  // clause breaks
  else if (/[-–—]$/.test(word)) multiplier += 0.3;  // dashes
  return baseDelay * multiplier;
}
```

The base delay is `60000 / wpm` milliseconds. At 300 WPM, that's 200ms per word, but a sentence-ending word gets ~440ms.

## Project Architecture

This is a **Next.js** webapp (or Vite React — pick based on the user's preference). The core structure:

```
src/
├── components/
│   ├── Redicle.tsx          # The word display with ORP highlighting
│   ├── Controls.tsx         # Play/pause, speed, restart buttons
│   ├── ProgressBar.tsx      # Clickable seek bar
│   ├── MarkdownEditor.tsx   # Textarea for pasting markdown
│   └── StatsBar.tsx         # Word count, ETA, progress
├── lib/
│   ├── orp.ts               # getORP() and getWordDelay()
│   ├── parser.ts            # Markdown → word array (strip formatting)
│   └── useRSVP.ts           # Custom hook: playback state machine
├── app/
│   └── page.tsx             # Main layout with Read/Edit views
└── styles/
    └── globals.css
```

### Core Components

**Redicle** — The most important visual element. It must:
- Show horizontal border lines (top and bottom)
- Have thin vertical red guide markers extending above and below at the center point
- Display the word with the ORP letter aligned to center and colored red
- The letters before and after the ORP are white/light gray
- Use a monospace font (JetBrains Mono recommended) so letter widths are predictable
- The word must be positioned so the ORP letter sits exactly at the vertical guide

**Controls** — Minimal, clean controls:
- Play/Pause toggle (circular button, prominent)
- Restart button
- Speed decrease (−50 WPM) and increase (+50 WPM) buttons
- Current WPM display
- Speed range: 50–1000 WPM, default 300

**Progress Bar** — A thin horizontal bar showing read progress. Clicking it seeks to that position in the word array.

**Markdown Editor** — A view/tab where users paste markdown. On submission, it strips all markdown formatting and extracts a flat word array.

### Markdown Parsing

Strip these markdown elements before splitting into words:
- Headers (`# ## ###` etc.)
- Bold (`**text**`), italic (`*text*`), strikethrough (`~~text~~`)
- Inline code (`` `code` ``)
- Links (`[text](url)` → keep text, drop url)
- List markers (`- `, `* `, `1. `)
- Blockquote markers (`> `)

Then split on whitespace and filter empty strings.

```javascript
function parseMarkdown(md) {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}
```

### Playback State Machine

Use refs to avoid stale closures in setTimeout chains:

```javascript
const timerRef = useRef(null);
const indexRef = useRef(0);
const wordsRef = useRef([]);

const tick = useCallback(() => {
  const i = indexRef.current;
  const w = wordsRef.current;
  if (i >= w.length) { setIsPlaying(false); return; }

  setCurrentIndex(i);
  setProgress(((i + 1) / w.length) * 100);

  const baseDelay = 60000 / wpm;
  const delay = getWordDelay(w[i], baseDelay);
  indexRef.current = i + 1;
  timerRef.current = setTimeout(tick, delay);
}, [wpm]);
```

Important: when WPM changes mid-playback, the `tick` callback must re-create with the new WPM value. The `useCallback` dependency on `wpm` handles this.

## Design Direction

The aesthetic is **dark, minimal, monospace-forward** — inspired by terminal UIs and code editors. Think: Vercel's design language meets a focused reading tool.

- **Background**: Near-black (`#09090b`)
- **Text**: Light gray (`#e4e4e7`) with the ORP letter in red (`#dc2626`)
- **Accent**: Red (`#dc2626`) — used sparingly for the ORP, guide lines, play button border, progress bar, and active states
- **Fonts**: JetBrains Mono for the redicle and all data/stats; Outfit (or similar geometric sans) for UI labels
- **Controls**: Circular buttons with subtle borders, no fill backgrounds
- **Spacing**: Generous — the redicle needs breathing room

The redicle should feel like the centerpiece — visually dominant, with everything else receding into the dark background.

## Feature Checklist

These are the baseline features. Implement all of them:

- [x] Redicle with ORP highlighting and vertical guides
- [x] Play / Pause / Restart controls
- [x] WPM adjustment (−50 / +50) with popup feedback
- [x] Clickable progress bar with seek
- [x] Word count and ETA display
- [x] Markdown editor with word count
- [x] Read / Edit tab switching
- [x] Auto-pause at end of text
- [x] Restart from beginning when pressing play after completion

## Possible Extensions

When the user asks for new features, here are common ones and how to approach them:

**Keyboard shortcuts** — Space for play/pause, left/right arrows for ±50 WPM, R for restart. Add a `useEffect` with a `keydown` listener.

**Dark/Light theme toggle** — Use CSS variables for all colors. Store preference in localStorage.

**File upload** — Accept `.md` and `.txt` files via drag-and-drop or file input. Read with FileReader API.

**Paragraph-aware pausing** — Detect double-newlines in the original markdown and insert longer pauses (2–3x base delay) at paragraph boundaries.

**Context preview** — Show the current sentence or surrounding ~5 words below the redicle in a muted style, so the reader has context if they zone out.

**Chunked mode** — Display 2–3 words at a time instead of one. Requires adjusting the ORP calculation to center on the middle word's ORP.

**Session persistence** — Save current position, WPM, and text to localStorage so the reader can resume later.

**Mobile responsiveness** — Scale the redicle font size down on small screens. Make touch targets larger for controls.

## Reference Implementation

A complete working React prototype is available at `references/prototype.jsx`. Read this file to understand the full implementation before making changes. It contains the complete component with all styles inline as a JavaScript object — this is the canonical reference for how the redicle, controls, and editor should work and look.

## Research Caveats Worth Knowing

If the user asks about the science or effectiveness:
- Studies show comprehension drops at speeds above ~500 WPM, especially for longer texts
- RSVP eliminates the ability to re-read (regress), which hurts literal comprehension
- It works best for short-form content: emails, news articles, social media
- Visual fatigue increases because blink rate drops during RSVP reading
- The technique is still valuable as a training tool and for consuming text on small screens
- Recommended: start at 250 WPM, gradually increase, take breaks every few minutes
