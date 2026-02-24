# RSVP Speed Reader — Design Doc

**Date:** 2026-02-24
**Status:** Approved

## Overview

A single `index.html` RSVP speed reader webapp. No build step, no Node.js, no dependencies beyond Google Fonts (CDN). Open in a browser and go.

## Architecture

One file containing:
- `<style>` — all CSS (dark theme, redicle, controls, animations)
- `<body>` — static HTML shell
- `<script>` — all logic (ORP, markdown parser, playback state machine, event listeners)

## Components

| Piece | Implementation |
|---|---|
| Redicle | `<div>` with `<span id="before">`, `<span id="pivot">` (red), `<span id="after">` |
| Guide lines | Absolute-positioned 1px red divs above/below redicle |
| Controls | Play/Pause, Restart, −50/+50 WPM buttons; WPM display |
| Progress bar | Thin `<div>` with fill child; click handler seeks |
| Stats bar | Word count + ETA updated each tick |
| Editor | `<textarea>` + "Start Reading →" button |

## State Machine

Ports the prototype's `setTimeout`-chain approach to vanilla JS:

```js
let indexState = 0, wordsState = [], wpm = 300, timer = null, playing = false;

function tick() {
  if (indexState >= wordsState.length) { stop(); return; }
  renderWord(wordsState[indexState]);
  const delay = getWordDelay(wordsState[indexState], 60000 / wpm);
  indexState++;
  timer = setTimeout(tick, delay);
}
```

## View Switching

`data-view="reader|editor"` attribute on `<body>`. CSS handles show/hide.

## Design Tokens

- Background: `#09090b`
- Text: `#e4e4e7`
- ORP / Accent: `#dc2626`
- Muted: `#52525b`
- Fonts: JetBrains Mono (redicle, stats), Outfit (UI labels)
- WPM range: 50–1000, default 300
