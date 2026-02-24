# Onboarding Banner Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Human/Agent tabbed onboarding banner above the redicle that helps humans paste a URL and helps agents install the skill.

**Architecture:** Single inline `<div id="onboarding">` inside `#reader-view`, before `.redicle-container`. Uses existing design tokens and patterns. Hidden when content loads from URL. All changes in `index.html` (CSS + HTML + JS).

**Tech Stack:** Vanilla HTML/CSS/JS, no dependencies.

---

### Task 1: Create dev branch

**Files:** None (git only)

**Step 1: Create and switch to dev branch**

Run: `git checkout -b dev`

**Step 2: Verify branch**

Run: `git branch --show-current`
Expected: `dev`

---

### Task 2: Add onboarding CSS

**Files:**
- Modify: `index.html:32-440` (inside `<style>` block)

**Step 1: Add onboarding styles after the `.hidden` rule (line 334) and before the `#editor-view` comment (line 336)**

Insert these styles:

```css
/* ── Onboarding banner ──────────────────────────────────────── */
#onboarding {
  width: 100%;
  max-width: 680px;
  margin-top: 88px;
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border-dim);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.3s ease;
}
.onboarding-tabs {
  display: flex;
  gap: 2px;
  background: var(--bg);
  border: 1px solid var(--border-dim);
  border-radius: 8px;
  padding: 3px;
  align-self: flex-start;
}
.onboarding-tab {
  font-family: var(--sans);
  font-size: 0.78rem;
  font-weight: 500;
  padding: 5px 20px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  letter-spacing: 0.01em;
}
.onboarding-tab.active { background: var(--border); color: #fafafa; }
.onboarding-panel { display: none; flex-direction: column; gap: 12px; }
.onboarding-panel.active { display: flex; }
.onboarding-url {
  width: 100%;
  height: 44px;
  background: var(--bg);
  border: 1px solid var(--border-dim);
  border-radius: 8px;
  color: var(--text);
  font-family: var(--mono);
  font-size: 0.82rem;
  padding: 0 14px;
}
.onboarding-url:focus { outline: 1px solid var(--accent); border-color: var(--accent); }
.onboarding-url::placeholder { color: var(--text-dim); }
.onboarding-desc {
  font-family: var(--sans);
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.5;
}
.code-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--bg);
  border: 1px solid var(--border-dim);
  border-radius: 8px;
  padding: 10px 14px;
}
.code-block code {
  font-family: var(--mono);
  font-size: 0.78rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.copy-btn {
  font-family: var(--sans);
  font-size: 0.7rem;
  font-weight: 500;
  padding: 4px 10px;
  border: 1px solid var(--border-dim);
  border-radius: 5px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.copy-btn:hover { color: var(--text); border-color: var(--text-muted); }
.or-divider {
  font-family: var(--sans);
  font-size: 0.72rem;
  color: var(--text-dim);
  text-align: center;
}
```

**Step 2: Add responsive overrides inside the `@media (max-width: 480px)` block**

Add at the end of the 480px media query:

```css
#onboarding { margin-top: 72px; padding: 18px; }
.code-block { flex-direction: column; align-items: stretch; gap: 8px; }
.code-block code { font-size: 0.72rem; }
.copy-btn { align-self: flex-end; }
```

**Step 3: Verify — open in browser**

Open `index.html`, confirm no visual regressions (banner HTML not added yet, so styles are inert).

**Step 4: Commit**

```bash
git add index.html
git commit -m "style: add onboarding banner CSS"
```

---

### Task 3: Add onboarding HTML

**Files:**
- Modify: `index.html:457-458` (inside `#reader-view`, before `.redicle-container`)

**Step 1: Insert onboarding HTML after `<main id="reader-view">` (line 457) and before `<div class="redicle-container">` (line 458)**

```html
    <!-- Onboarding banner -->
    <div id="onboarding">
      <div class="onboarding-tabs">
        <button class="onboarding-tab active" data-otab="human">Human</button>
        <button class="onboarding-tab" data-otab="agent">Agent</button>
      </div>
      <div class="onboarding-panel active" id="panel-human">
        <input
          type="url"
          id="onboarding-url"
          class="onboarding-url"
          placeholder="Paste a raw markdown URL..."
          autocomplete="off"
          spellcheck="false"
        />
        <button class="load-btn" id="onboarding-go">Start still Reading →</button>
      </div>
      <div class="onboarding-panel" id="panel-agent">
        <p class="onboarding-desc">Let your AI agent publish markdown as a speed-reading link.</p>
        <div class="code-block">
          <code>npx skills add megabyte0x/stillReading --skill still-reading -g</code>
          <button class="copy-btn" data-copy="npx skills add megabyte0x/stillReading --skill still-reading -g">Copy</button>
        </div>
        <span class="or-divider">or</span>
        <div class="code-block">
          <code>curl -fsSL https://stillreading.xyz/install.sh | bash</code>
          <button class="copy-btn" data-copy="curl -fsSL https://stillreading.xyz/install.sh | bash">Copy</button>
        </div>
      </div>
    </div>

```

**Step 2: Verify — open in browser**

Open `index.html` with no URL path. The banner should appear above the redicle with "Human" tab active and a URL input visible. Clicking "Agent" tab won't work yet (JS not added).

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add onboarding banner HTML"
```

---

### Task 4: Add onboarding JavaScript

**Files:**
- Modify: `index.html` (inside `<script>` block)

**Step 1: Add DOM refs after the existing DOM REFS section (after line 527)**

```javascript
const elOnboarding    = document.getElementById('onboarding');
const elOnboardingUrl = document.getElementById('onboarding-url');
const elOnboardingGo  = document.getElementById('onboarding-go');
```

**Step 2: Add onboarding functions before the INIT section (before the `(async function init()` block)**

```javascript
// =============================================================================
// ONBOARDING
// =============================================================================

// Tab switching
document.querySelectorAll('.onboarding-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.onboarding-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.onboarding-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.otab).classList.add('active');
  });
});

// Human tab: navigate to URL
function navigateToUrl() {
  const url = elOnboardingUrl.value.trim();
  if (!url) return;
  window.location.href = '/' + url;
}
elOnboardingGo.addEventListener('click', navigateToUrl);
elOnboardingUrl.addEventListener('keydown', e => {
  if (e.code === 'Enter') navigateToUrl();
});

// Agent tab: copy buttons
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.dataset.copy);
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = orig; }, 1500);
  });
});

function hideOnboarding() {
  if (elOnboarding) elOnboarding.style.display = 'none';
}
```

**Step 3: Modify `init()` to hide onboarding when URL content loads**

In the `init()` function, add `hideOnboarding()` right after the `if (mdUrl) {` line (before the `try`):

```javascript
if (mdUrl) {
    hideOnboarding();
    try {
```

**Step 4: Exclude onboarding URL input from keyboard shortcuts**

In the keyboard shortcut handler, update the early return to also ignore the onboarding input:

Change:
```javascript
if (e.target === elTextarea) return;
```

To:
```javascript
if (e.target === elTextarea || e.target === elOnboardingUrl) return;
```

**Step 5: Verify — open in browser**

1. Open `index.html` with no URL path: banner visible, Human tab active
2. Click "Agent" tab: shows install commands
3. Click "Copy" on either code block: copies to clipboard, button says "Copied!"
4. Click "Human" tab: back to URL input
5. Paste a URL and press Enter or click button: page navigates to `/<url>`
6. Open `index.html` with a URL path (e.g., `?url=https://...`): banner is hidden

**Step 6: Commit**

```bash
git add index.html
git commit -m "feat: add onboarding banner interactivity"
```

---

### Task 5: Push dev branch and verify

**Files:** None (git only)

**Step 1: Push dev branch**

Run: `git push -u origin dev`

**Step 2: Verify deployment**

Check the Vercel preview deployment URL to confirm the banner works on the deployed site.

**Step 3: Confirm with user**

Share the preview URL and ask for approval before merging to main.
