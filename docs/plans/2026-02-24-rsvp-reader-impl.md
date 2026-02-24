# RSVP Speed Reader Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single `index.html` RSVP speed reader that parses Markdown and presents words one at a time using the ORP technique, with no build step or dependencies beyond Google Fonts.

**Architecture:** Single self-contained HTML file. All CSS in `<style>`, all logic in `<script>`. State managed via plain JS module-level variables. View switching (reader ↔ editor) via `data-view` attribute on body.

**Tech Stack:** Vanilla HTML5, CSS3, ES2020 JS. Google Fonts CDN (JetBrains Mono + Outfit). No npm, no bundler, no framework.

**Reference:** `.claude/skills/rsvp-speed-reader/references/prototype.jsx` — the canonical React implementation this plan ports to vanilla JS.

---

### Task 1: HTML skeleton + fonts + CSS reset

**Files:**
- Create: `index.html`

**Step 1: Create the file with the HTML shell**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>stillReading</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body {
      font-family: 'Outfit', sans-serif;
      background: #09090b;
      color: #fafafa;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 20px;
      animation: fadeIn 0.4s ease;
    }
    ::selection { background: #dc2626; color: #fff; }
    button:focus-visible { outline: 1px solid #dc2626; outline-offset: 2px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes wpmPop { 0% { opacity: 0; transform: translate(-50%,-50%) scale(0.8); } 30% { opacity: 1; transform: translate(-50%,-50%) scale(1.05); } 100% { opacity: 0; transform: translate(-50%,-50%) scale(1); } }
  </style>
</head>
<body data-view="reader">

  <script>
    // placeholder
  </script>
</body>
</html>
```

**Step 2: Open in browser and verify**

```bash
open index.html
```
Expected: Black page loads, no errors in console.

**Step 3: Commit**

```bash
git init
git add index.html docs/
git commit -m "feat: init project with HTML skeleton and design tokens"
```

---

### Task 2: Header HTML + CSS

**Files:**
- Modify: `index.html` — add header markup inside `<body>` and header CSS inside `<style>`

**Step 1: Add header markup** (before `<script>`)

```html
<header id="header">
  <div class="logo">
    <span class="logo-icon">◉</span>
    <span class="logo-text">stillReading</span>
  </div>
  <nav class="nav-tabs">
    <button class="tab active" data-tab="reader" onclick="switchView('reader')">Read</button>
    <button class="tab" data-tab="editor" onclick="switchView('editor')">Edit</button>
  </nav>
</header>
```

**Step 2: Add header CSS** (inside `<style>`)

```css
#header {
  width: 100%;
  max-width: 640px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0 20px;
  border-bottom: 1px solid #1a1a1f;
  margin-bottom: 40px;
}
.logo { display: flex; align-items: center; gap: 8px; }
.logo-icon { color: #dc2626; font-size: 1.1rem; }
.logo-text {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.02em;
}
.nav-tabs {
  display: flex;
  gap: 4px;
  background: #18181b;
  border-radius: 8px;
  padding: 3px;
}
.tab {
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #71717a;
  cursor: pointer;
  transition: all 0.15s ease;
}
.tab.active { background: #27272a; color: #fafafa; }
```

**Step 3: Add `switchView` stub to `<script>`**

```js
function switchView(view) {
  document.body.dataset.view = view;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === view);
  });
}
```

**Step 4: Verify in browser**

Reload. Header visible with logo and Read/Edit tabs. Clicking tabs updates active state.

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add header with logo and view tabs"
```

---

### Task 3: Redicle HTML + CSS

**Files:**
- Modify: `index.html`

**Step 1: Add reader view markup** (after `<header>`, before `<script>`)

```html
<main id="reader-view">
  <div class="redicle-container">
    <div class="redicle">
      <div class="guide-top"></div>
      <div class="guide-bottom"></div>
      <div class="word-wrapper">
        <span class="word-text">
          <span id="w-before"></span><span id="w-pivot"></span><span id="w-after"></span>
        </span>
      </div>
    </div>
  </div>

  <div id="progress-bar" class="progress-container">
    <div id="progress-fill" class="progress-fill"></div>
  </div>

  <div class="controls">
    <button class="ctrl-btn" onclick="adjustWpm(-50)" title="Slower (←)">−</button>
    <button class="ctrl-btn" onclick="restart()" title="Restart (R)">⟲</button>
    <button class="play-btn" id="play-btn" onclick="togglePlay()">▶</button>
    <div class="wpm-display">
      <span id="wpm-number">300</span>
      <span class="wpm-label">wpm</span>
    </div>
    <button class="ctrl-btn" onclick="adjustWpm(50)" title="Faster (→)">+</button>
  </div>

  <div class="stats">
    <span id="stat-pos">0 / 0</span>
    <span class="stat-divider">·</span>
    <span id="stat-eta">0s remaining</span>
  </div>
</main>

<div id="wpm-popup" class="wpm-popup hidden"></div>
```

**Step 2: Add redicle + controls CSS**

```css
/* View switching */
[data-view="editor"] #reader-view { display: none; }
[data-view="editor"] #editor-view { display: flex; }
[data-view="reader"] #editor-view { display: none; }

#reader-view {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.redicle-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0 50px;
}
.redicle {
  position: relative;
  width: 100%;
  max-width: 560px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 2px solid #1c1c22;
  border-bottom: 2px solid #1c1c22;
}
.guide-top {
  position: absolute;
  left: 50%; top: -10px;
  width: 1px; height: 10px;
  background: #dc2626; opacity: 0.6;
}
.guide-bottom {
  position: absolute;
  left: 50%; bottom: -10px;
  width: 1px; height: 10px;
  background: #dc2626; opacity: 0.6;
}
.word-wrapper { position: relative; display: flex; justify-content: center; }
.word-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 3.5rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  white-space: nowrap;
  color: #e4e4e7;
}
#w-pivot { color: #dc2626; font-weight: 700; }

/* Progress */
.progress-container {
  width: 100%;
  height: 3px;
  background: #18181b;
  border-radius: 2px;
  cursor: pointer;
  margin-bottom: 32px;
}
.progress-fill {
  height: 100%;
  background: #dc2626;
  border-radius: 2px;
  width: 0%;
  transition: width 0.08s linear;
}

/* Controls */
.controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.play-btn {
  width: 56px; height: 56px;
  border-radius: 50%;
  border: 2px solid #dc2626;
  background: transparent;
  color: #dc2626;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s ease;
  font-family: inherit;
}
.ctrl-btn {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 1px solid #27272a;
  background: transparent;
  color: #71717a;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s ease;
  font-family: inherit;
}
.wpm-display {
  display: flex; flex-direction: column; align-items: center; min-width: 50px;
}
#wpm-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.1rem; font-weight: 600; color: #fafafa;
}
.wpm-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem; color: #52525b;
  text-transform: uppercase; letter-spacing: 0.08em;
}

/* Stats */
.stats { display: flex; gap: 8px; align-items: center; }
#stat-pos, #stat-eta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem; color: #52525b;
}
.stat-divider { color: #27272a; font-size: 0.75rem; }

/* WPM popup */
.wpm-popup {
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.4rem; font-weight: 600; color: #dc2626;
  background: rgba(9,9,11,0.9);
  padding: 12px 28px; border-radius: 12px;
  border: 1px solid #27272a;
  pointer-events: none; z-index: 100;
  animation: wpmPop 0.8s ease forwards;
}
.hidden { display: none !important; }
```

**Step 3: Verify in browser**

Reload. Redicle frame visible with red guide lines, circular play button with red border, control buttons, progress bar.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add redicle, controls, and progress bar layout"
```

---

### Task 4: Editor view HTML + CSS

**Files:**
- Modify: `index.html`

**Step 1: Add editor view markup** (after `#reader-view`, before `<script>`)

```html
<section id="editor-view">
  <div class="editor-header">
    <p class="editor-label">Paste your Markdown below</p>
    <span id="editor-word-count" class="editor-wc">0 words</span>
  </div>
  <textarea
    id="markdown-input"
    class="md-textarea"
    spellcheck="false"
    placeholder="# Paste your markdown here..."
  ></textarea>
  <button class="load-btn" onclick="loadAndRead()">Start Reading →</button>
</section>
```

**Step 2: Add editor CSS**

```css
#editor-view {
  width: 100%; max-width: 640px;
  flex-direction: column;
  gap: 16px; flex: 1;
  animation: fadeIn 0.3s ease;
}
.editor-header { display: flex; justify-content: space-between; align-items: center; }
.editor-label { font-size: 0.9rem; color: #a1a1aa; }
.editor-wc { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #52525b; }
.md-textarea {
  width: 100%; min-height: 400px;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  color: #d4d4d8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem; line-height: 1.7;
  padding: 20px; resize: vertical;
}
.md-textarea:focus { outline: 1px solid #dc2626; }
.load-btn {
  align-self: flex-end;
  padding: 10px 28px;
  background: #dc2626;
  border: none; border-radius: 8px;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem; font-weight: 500;
  cursor: pointer; transition: all 0.15s ease;
}
```

**Step 3: Verify in browser**

Click "Edit" tab. Editor view appears with textarea and "Start Reading →" button. Click "Read" — reader view returns.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add editor view with markdown textarea"
```

---

### Task 5: Core logic — ORP, parser, state

**Files:**
- Modify: `index.html` — fill in `<script>` with all logic

**Step 1: Replace script placeholder with full logic**

```js
// ── ORP ──────────────────────────────────────────────────────────────
function getORP(word) {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

function getWordDelay(word, baseDelay) {
  let m = 1;
  if (word.length > 8)  m += 0.3;
  if (word.length > 12) m += 0.2;
  if (/[.!?]$/.test(word))  m += 1.2;
  else if (/[,;:]$/.test(word)) m += 0.5;
  else if (/[-–—]$/.test(word)) m += 0.3;
  return baseDelay * m;
}

// ── Parser ────────────────────────────────────────────────────────────
function parseMarkdown(md) {
  return md
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .split(/\s+/)
    .filter(w => w.length > 0);
}

// ── State ─────────────────────────────────────────────────────────────
const SAMPLE = `# The Art of Speed Reading

Speed reading is a collection of techniques used to increase one's rate of reading without greatly reducing comprehension or retention. These methods typically involve visual guides, chunking text, and minimizing subvocalization.

## How RSVP Works

Rapid Serial Visual Presentation displays words one at a time at a fixed focal point. The Optimal Recognition Point — the letter your brain naturally focuses on first — is highlighted and centered, eliminating eye movement entirely.

## Benefits

This technique allows readers to consume text significantly faster than traditional reading. By removing saccades, the brain can focus purely on word recognition and meaning construction.

## Tips for Best Results

Start at a comfortable speed around 250 words per minute. Gradually increase as you become familiar with the format. Take breaks every few minutes to avoid visual fatigue. Remember that comprehension matters more than raw speed.

The goal is not to race through text, but to find your optimal pace where speed and understanding coexist harmoniously.`;

let words    = [];
let idx      = 0;
let wpm      = 300;
let playing  = false;
let timer    = null;

// ── DOM refs ──────────────────────────────────────────────────────────
const elBefore   = document.getElementById('w-before');
const elPivot    = document.getElementById('w-pivot');
const elAfter    = document.getElementById('w-after');
const elPlayBtn  = document.getElementById('play-btn');
const elFill     = document.getElementById('progress-fill');
const elWpmNum   = document.getElementById('wpm-number');
const elPos      = document.getElementById('stat-pos');
const elEta      = document.getElementById('stat-eta');
const elPopup    = document.getElementById('wpm-popup');
const elInput    = document.getElementById('markdown-input');
const elEditorWC = document.getElementById('editor-word-count');

// ── Render ────────────────────────────────────────────────────────────
function renderWord(word) {
  const orp = getORP(word);
  elBefore.textContent = word.slice(0, orp);
  elPivot.textContent  = word[orp] || '';
  elAfter.textContent  = word.slice(orp + 1);
}

function renderIdle() {
  elBefore.textContent = '';
  elPivot.textContent  = '▶';
  elAfter.textContent  = '';
  elPivot.style.opacity = '0.2';
}

function updateStats() {
  const remaining = words.length - idx;
  const secs = Math.round((remaining / wpm) * 60);
  const m = Math.floor(secs / 60), s = secs % 60;
  elPos.textContent = `${idx + 1} / ${words.length}`;
  elEta.textContent = `${m > 0 ? m + 'm ' : ''}${s}s remaining`;
  elFill.style.width = words.length ? `${((idx + 1) / words.length) * 100}%` : '0%';
}

// ── Playback ──────────────────────────────────────────────────────────
function tick() {
  if (idx >= words.length) { stop(); return; }
  elPivot.style.opacity = '1';
  renderWord(words[idx]);
  updateStats();
  const delay = getWordDelay(words[idx], 60000 / wpm);
  idx++;
  timer = setTimeout(tick, delay);
}

function stop() {
  playing = false;
  clearTimeout(timer);
  elPlayBtn.textContent = '▶';
}

function togglePlay() {
  if (words.length === 0) return;
  if (idx >= words.length) {
    idx = 0;
    elFill.style.width = '0%';
  }
  playing = !playing;
  elPlayBtn.textContent = playing ? '❚❚' : '▶';
  if (playing) tick();
  else clearTimeout(timer);
}

function restart() {
  stop();
  idx = 0;
  elFill.style.width = '0%';
  renderIdle();
  updateStats();
}

function adjustWpm(delta) {
  wpm = Math.max(50, Math.min(1000, wpm + delta));
  elWpmNum.textContent = wpm;
  showWpmPopup();
}

function showWpmPopup() {
  elPopup.textContent = `${wpm} wpm`;
  elPopup.classList.remove('hidden');
  // re-trigger animation
  void elPopup.offsetWidth;
  elPopup.style.animation = 'none';
  void elPopup.offsetWidth;
  elPopup.style.animation = '';
  setTimeout(() => elPopup.classList.add('hidden'), 820);
}

// ── Progress seek ─────────────────────────────────────────────────────
document.getElementById('progress-bar').addEventListener('click', e => {
  if (words.length === 0) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  const wasPlaying = playing;
  stop();
  idx = Math.floor(pct * words.length);
  renderWord(words[idx] || words[0]);
  updateStats();
  if (wasPlaying) { playing = true; elPlayBtn.textContent = '❚❚'; tick(); }
});

// ── Load markdown ─────────────────────────────────────────────────────
function loadMarkdown(md) {
  words = parseMarkdown(md);
  idx = 0;
  stop();
  renderIdle();
  updateStats();
  elEditorWC.textContent = `${words.length} words`;
}

function loadAndRead() {
  loadMarkdown(elInput.value);
  switchView('reader');
}

// ── View switching ────────────────────────────────────────────────────
function switchView(view) {
  document.body.dataset.view = view;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === view);
  });
  if (view === 'editor') { stop(); }
}

// ── Editor live word count ────────────────────────────────────────────
elInput.addEventListener('input', () => {
  const w = parseMarkdown(elInput.value);
  elEditorWC.textContent = `${w.length} words`;
});

// ── Keyboard shortcuts ────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target === elInput) return; // don't intercept in textarea
  if (e.code === 'Space')      { e.preventDefault(); togglePlay(); }
  if (e.code === 'ArrowLeft')  adjustWpm(-50);
  if (e.code === 'ArrowRight') adjustWpm(50);
  if (e.code === 'KeyR')       restart();
});

// ── Init ──────────────────────────────────────────────────────────────
elInput.value = SAMPLE;
loadMarkdown(SAMPLE);
renderIdle();
```

**Step 2: Verify in browser**

Reload. Click Play — words stream through redicle with ORP letter in red. Progress bar fills. Stats count down. Pause works. Restart works. −/+ WPM buttons show popup. Space / arrow keys / R work. Click "Edit", change text, click "Start Reading →" — new words load.

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: implement ORP engine, playback state machine, and keyboard shortcuts"
```

---

### Task 6: Polish and final verification

**Files:**
- Modify: `index.html` — minor tweaks

**Step 1: Verify full feature checklist from the skill**

Open browser and check each item:
- [ ] Redicle shows ORP letter in red aligned to guide markers
- [ ] Play / Pause / Restart all work correctly
- [ ] WPM +/− with popup feedback works
- [ ] Clickable progress bar seeks correctly
- [ ] Word count and ETA display update live
- [ ] Markdown editor shows word count as you type
- [ ] Read / Edit tab switching works
- [ ] Auto-pause at end of text
- [ ] Pressing play after completion restarts from beginning
- [ ] Space = play/pause, ← = −50 wpm, → = +50 wpm, R = restart

**Step 2: Fix any issues found, then commit**

```bash
git add index.html
git commit -m "feat: complete RSVP reader with all baseline features"
```

---

## Summary

5 tasks, ~30 minutes of implementation. Output: a single `index.html` that opens in any browser with no install step.
