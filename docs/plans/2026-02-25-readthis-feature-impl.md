# "you should read this" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate stillReading from vanilla HTML to Next.js and add a curated reading list (`/readthis`) with Supabase backend and anonymous voting.

**Architecture:** Next.js App Router with TypeScript. The existing RSVP engine (ORP, adaptive timing, parser, playback) is extracted into a pure JS module (`lib/rsvp-engine.ts`). A React component (`RSVPReader`) wraps it using refs and useEffect for DOM manipulation. Supabase handles article storage and voting via RPC. Client-side localStorage rate-limits votes.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Supabase JS v2, Google Fonts (next/font), Vercel deployment

---

## Required Skills — Use PROACTIVELY

These skills MUST be invoked and followed during implementation. Read the AGENTS.md in each skill directory for the full compiled rules.

### 1. `@.claude/skills/vercel-react-best-practices`
**When:** Every task that writes React/Next.js code (Tasks 1, 3, 4, 5, 7, 8, 9, 10, 11).
**Key rules to enforce:**
- **CRITICAL — Eliminating Waterfalls:** Use `Promise.all()` for parallel fetches, Suspense boundaries for streaming, defer `await` into branches
- **CRITICAL — Bundle Size:** Import directly (no barrel files), use `next/dynamic` for heavy components, defer third-party scripts
- **HIGH — Server-Side:** Minimize data serialized to client components, parallelize server fetches, use `React.cache()` for dedup
- **MEDIUM — Re-renders:** Use refs for transient values (playback state), functional setState, derive state during render not effects, hoist default non-primitive props

### 2. `@.claude/skills/vercel-composition-patterns`
**When:** Building component APIs (Tasks 3, 8, 10, 11).
**Key rules to enforce:**
- **Avoid boolean prop proliferation** — Use composition over boolean flags when component variants grow
- **Compound components** — Use shared context for complex multi-part components (e.g., RSVPReader sub-parts)
- **Children over render props** — Use children for composition
- **React 19 APIs** — No `forwardRef`, use `use()` instead of `useContext()`

### 3. `@.claude/skills/web-design-guidelines`
**When:** After completing UI work (Tasks 4, 8, 9, 10). Fetch guidelines from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` and review all new UI components for compliance.
**Key areas:**
- Accessibility (ARIA, keyboard nav, focus management)
- Responsive design patterns
- Animation and interaction quality
- Semantic HTML structure

---

## Task 1: Initialize Next.js Project

> **Skills:** Invoke `@.claude/skills/vercel-react-best-practices` — follow `bundle-defer-third-party` for analytics, `server-` rules for layout setup.

**Files:**
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx` (placeholder)
- Modify: `package.json`
- Delete: `vercel.json` (Next.js handles routing natively)

**Step 1: Install Next.js and dependencies**

```bash
npm install next@latest react-dom@latest typescript @types/react @types/react-dom @supabase/supabase-js
```

Note: `react` is already installed. Next.js 15 uses React 19.

**Step 2: Create `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

**Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 4: Add scripts to `package.json`**

Add to `"scripts"`:
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

**Step 5: Create minimal `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "stillReading",
  description:
    "RSVP speed reader. Paste markdown, read word-by-word with ORP highlighting.",
  openGraph: {
    type: "website",
    title: "stillReading",
    description:
      "Speed read anything. Paste markdown or load via URL — words appear one at a time with ORP highlighting.",
    url: "https://stillreading.xyz",
    images: [{ url: "https://stillreading.xyz/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "stillReading",
    description:
      "Speed read anything. Paste markdown or load via URL — words appear one at a time with ORP highlighting.",
    images: ["https://stillreading.xyz/api/og"],
  },
  icons: {
    icon: {
      url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%2309090b'/><line x1='4' y1='8' x2='28' y2='8' stroke='%23222228' stroke-width='1'/><line x1='4' y1='24' x2='28' y2='24' stroke='%23222228' stroke-width='1'/><line x1='16' y1='2' x2='16' y2='8' stroke='%23dc2626' stroke-width='1.5' opacity='0.7'/><line x1='16' y1='24' x2='16' y2='30' stroke='%23dc2626' stroke-width='1.5' opacity='0.7'/><text x='16' y='19' text-anchor='middle' font-family='monospace' font-size='14' font-weight='700' fill='%23dc2626'>R</text></svg>",
      type: "image/svg+xml",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Step 6: Create `app/globals.css`**

Port the entire `<style>` block from `index.html` (lines 48-773) into this file. This is a direct copy — every CSS rule, every media query, every custom property. The only change is removing the `<style>` / `</style>` tags.

Refer to the current `index.html` lines 48-773 for the complete CSS. Copy it verbatim.

**Step 7: Create placeholder `app/page.tsx`**

```tsx
export default function Home() {
  return <div>stillReading — porting in progress</div>;
}
```

**Step 8: Verify the dev server starts**

```bash
npm run dev
```

Expected: Next.js dev server starts on http://localhost:3000, shows placeholder text.

**Step 9: Update `.gitignore`**

Add:
```
.next
```

**Step 10: Delete `vercel.json`**

Next.js handles routing natively. Remove the old rewrite rules file.

**Step 11: Commit**

```bash
git add -A && git commit -m "chore: initialize Next.js project with TypeScript"
```

---

## Task 2: Extract RSVP Engine to Pure JS Module

**Files:**
- Create: `lib/rsvp-engine.ts`

**Step 1: Create `lib/rsvp-engine.ts`**

Extract these pure functions from `index.html` (lines 963-1005, 976-984, 1058-1078) into a module with no DOM dependencies:

```ts
// lib/rsvp-engine.ts

export function getORP(word: string): number {
  const len = word.length;
  if (len === 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

export function getWordDelay(word: string, baseDelay: number): number {
  let multiplier = 1;
  if (word.length > 8) multiplier += 0.3;
  if (word.length > 12) multiplier += 0.2;
  if (/[.!?]$/.test(word)) multiplier += 1.2;
  else if (/[,;:]$/.test(word)) multiplier += 0.5;
  else if (/[-\u2013\u2014]$/.test(word)) multiplier += 0.3;
  return baseDelay * multiplier;
}

export function parseMarkdown(md: string): string[] {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

export function computeEta(words: string[], fromIdx: number, wpm: number): number {
  const baseDelay = 60000 / wpm;
  let msLeft = 0;
  for (let i = fromIdx; i < words.length; i++) {
    msLeft += getWordDelay(words[i], baseDelay);
  }
  return Math.round(msLeft / 1000);
}

export function formatEta(secondsLeft: number): string {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s remaining` : `${secondsLeft}s remaining`;
}

/** Estimate read time at a given WPM, returned as a formatted string like "3m 24s" */
export function formatReadTime(wordCount: number, wpm: number = 300): string {
  const totalSeconds = Math.round((wordCount / wpm) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0 && seconds > 0) return `${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export const SAMPLE_CONTENT = `# The Art of Speed Reading

Speed reading is a collection of techniques used to increase one's rate of reading without greatly reducing comprehension or retention. These methods typically involve visual guides, chunking text, and minimizing subvocalization.

## How RSVP Works

Rapid Serial Visual Presentation displays words one at a time at a fixed focal point. The Optimal Recognition Point — the letter your brain naturally focuses on first — is highlighted and centered, eliminating eye movement entirely.

## Benefits

This technique allows readers to consume text significantly faster than traditional reading. By removing saccades, the brain can focus purely on word recognition and meaning construction.

## Tips for Best Results

Start at a comfortable speed around 250 words per minute. Gradually increase as you become familiar with the format. Take breaks every few minutes to avoid visual fatigue. Remember that comprehension matters more than raw speed.

The goal is not to race through text, but to find your optimal pace where speed and understanding coexist harmoniously.`;
```

**Step 2: Verify no DOM references leaked in**

Manually review: no `document`, no `window`, no `getElementById` in this file.

**Step 3: Commit**

```bash
git add lib/rsvp-engine.ts && git commit -m "refactor: extract RSVP engine to pure TS module"
```

---

## Task 3: Build RSVPReader React Component

> **Skills:** Invoke `@.claude/skills/vercel-react-best-practices` — follow `rerender-use-ref-transient-values` for playback state (idx, timer, playing), `rerender-functional-setstate` for WPM updates, `rerender-derived-state-no-effect` for computed values. Invoke `@.claude/skills/vercel-composition-patterns` — follow `architecture-avoid-boolean-props` and `patterns-children-over-render-props` for component API design.

**Files:**
- Create: `components/RSVPReader.tsx`

This is the core component that replicates the entire reader view from `index.html`. It wraps the RSVP engine using refs for DOM manipulation (the ORP alignment requires direct pixel measurement via `offsetWidth`).

**Step 1: Create `components/RSVPReader.tsx`**

```tsx
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { getORP, getWordDelay, parseMarkdown, computeEta, formatEta, SAMPLE_CONTENT } from "@/lib/rsvp-engine";

interface RSVPReaderProps {
  /** Pre-loaded markdown content. If provided, skips editor/URL loading. */
  initialMarkdown?: string;
  /** Title to display above the reader. */
  contentTitle?: string;
  /** Called when playback reaches the last word. */
  onComplete?: () => void;
  /** Show the editor tab and onboarding. Default true for home page. */
  showEditor?: boolean;
  /** Show onboarding banner. Default true for home page. */
  showOnboarding?: boolean;
}

export default function RSVPReader({
  initialMarkdown,
  contentTitle,
  onComplete,
  showEditor = true,
  showOnboarding = true,
}: RSVPReaderProps) {
  // Refs for DOM elements that need direct pixel measurement
  const beforeRef = useRef<HTMLSpanElement>(null);
  const pivotRef = useRef<HTMLSpanElement>(null);
  const afterRef = useRef<HTMLSpanElement>(null);
  const wordTextRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);

  // State
  const [view, setView] = useState<"reader" | "editor">("reader");
  const [words, setWordsState] = useState<string[]>([]);
  const [wpm, setWpm] = useState(300);
  const [playing, setPlaying] = useState(false);
  const [editorText, setEditorText] = useState("");
  const [statPos, setStatPos] = useState("0 / 0");
  const [statEta, setStatEta] = useState("0s remaining");
  const [wpmPopupVisible, setWpmPopupVisible] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(showOnboarding);
  const [displayTitle, setDisplayTitle] = useState(contentTitle || "");

  // Mutable refs for playback state (avoids stale closures in setTimeout)
  const wordsRef = useRef<string[]>([]);
  const idxRef = useRef(0);
  const wpmRef = useRef(300);
  const playingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechDrivingRef = useRef(false);
  const speechEnabledRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep refs in sync
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { speechEnabledRef.current = speechEnabled; }, [speechEnabled]);

  // ── Render helpers ──

  const alignPivot = useCallback(() => {
    if (!beforeRef.current || !pivotRef.current || !wordTextRef.current) return;
    const bw = beforeRef.current.offsetWidth;
    const pw = pivotRef.current.offsetWidth;
    wordTextRef.current.style.transform = `translateX(-${bw + pw / 2}px)`;
  }, []);

  const renderWord = useCallback((word: string) => {
    if (!beforeRef.current || !pivotRef.current || !afterRef.current) return;
    const orp = getORP(word);
    beforeRef.current.textContent = word.slice(0, orp);
    pivotRef.current.textContent = word[orp] || "";
    afterRef.current.textContent = word.slice(orp + 1);
    pivotRef.current.style.opacity = "1";
    alignPivot();
  }, [alignPivot]);

  const renderIdle = useCallback(() => {
    if (!beforeRef.current || !pivotRef.current || !afterRef.current) return;
    beforeRef.current.textContent = "";
    pivotRef.current.textContent = "▶";
    afterRef.current.textContent = "";
    pivotRef.current.style.opacity = "0.2";
    alignPivot();
  }, [alignPivot]);

  const updateStats = useCallback(() => {
    const w = wordsRef.current;
    const i = idxRef.current;
    const total = w.length;
    const current = Math.min(i + 1, total);
    setStatPos(total > 0 ? `${current} / ${total}` : "0 / 0");
    const secondsLeft = computeEta(w, i, wpmRef.current);
    setStatEta(formatEta(secondsLeft));
    if (progressFillRef.current) {
      progressFillRef.current.style.width = total > 0 ? `${(i / total) * 100}%` : "0%";
    }
  }, []);

  // ── Playback ──

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    playingRef.current = false;
    speechDrivingRef.current = false;
    setPlaying(false);
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  }, []);

  const tick = useCallback(() => {
    const w = wordsRef.current;
    if (idxRef.current >= w.length) {
      stop();
      onCompleteRef.current?.();
      return;
    }
    renderWord(w[idxRef.current]);
    updateStats();
    const delay = getWordDelay(w[idxRef.current], 60000 / wpmRef.current);
    idxRef.current++;
    timerRef.current = setTimeout(tick, delay);
  }, [renderWord, updateStats, stop]);

  const startSpeechDriven = useCallback((fromIdx: number) => {
    if (!speechEnabledRef.current || fromIdx >= wordsRef.current.length) return;
    if (typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    speechDrivingRef.current = true;

    const w = wordsRef.current;
    const wordOffsets: { charStart: number; wordIdx: number }[] = [];
    let text = "";
    for (let i = fromIdx; i < w.length; i++) {
      wordOffsets.push({ charStart: text.length, wordIdx: i });
      text += (i > fromIdx ? " " : "") + w[i];
    }

    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = Math.min(Math.max(wpmRef.current / 250, 0.8), 2.5);

    utt.onboundary = (e) => {
      if (e.name !== "word" || !speechDrivingRef.current) return;
      let matchIdx = fromIdx;
      for (let i = wordOffsets.length - 1; i >= 0; i--) {
        if (e.charIndex >= wordOffsets[i].charStart) {
          matchIdx = wordOffsets[i].wordIdx;
          break;
        }
      }
      idxRef.current = matchIdx;
      renderWord(w[idxRef.current]);
      updateStats();
      idxRef.current++;
    };

    utt.onend = () => {
      if (!speechDrivingRef.current) return;
      speechDrivingRef.current = false;
      idxRef.current = w.length;
      stop();
      onCompleteRef.current?.();
    };

    renderWord(w[fromIdx]);
    updateStats();
    speechSynthesis.speak(utt);
  }, [renderWord, updateStats, stop]);

  const togglePlay = useCallback(() => {
    const w = wordsRef.current;
    if (w.length === 0) return;
    if (idxRef.current >= w.length) idxRef.current = 0;
    const newPlaying = !playingRef.current;
    playingRef.current = newPlaying;
    setPlaying(newPlaying);
    if (newPlaying) {
      if (speechEnabledRef.current) {
        startSpeechDriven(idxRef.current);
      } else {
        tick();
      }
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
      speechDrivingRef.current = false;
    }
  }, [tick, startSpeechDriven]);

  const restart = useCallback(() => {
    stop();
    idxRef.current = 0;
    if (progressFillRef.current) progressFillRef.current.style.width = "0%";
    renderIdle();
    updateStats();
  }, [stop, renderIdle, updateStats]);

  const adjustWpm = useCallback((delta: number) => {
    const newWpm = Math.min(1000, Math.max(50, wpmRef.current + delta));
    wpmRef.current = newWpm;
    setWpm(newWpm);
    setWpmPopupVisible(true);
    setTimeout(() => setWpmPopupVisible(false), 820);
    if (playingRef.current) {
      if (speechEnabledRef.current && speechDrivingRef.current) {
        if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
        speechDrivingRef.current = false;
        startSpeechDriven(idxRef.current > 0 ? idxRef.current - 1 : idxRef.current);
      } else if (!speechEnabledRef.current && timerRef.current) {
        clearTimeout(timerRef.current);
        const delay = getWordDelay(wordsRef.current[idxRef.current], 60000 / newWpm);
        timerRef.current = setTimeout(tick, delay);
      }
    }
  }, [tick, startSpeechDriven]);

  const toggleSpeech = useCallback(() => {
    const newVal = !speechEnabledRef.current;
    speechEnabledRef.current = newVal;
    setSpeechEnabled(newVal);
    if (!newVal) {
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
      speechDrivingRef.current = false;
      if (playingRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        tick();
      }
    } else if (playingRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      startSpeechDriven(idxRef.current);
    }
  }, [tick, startSpeechDriven]);

  // ── Load markdown ──

  const loadMarkdown = useCallback((md: string) => {
    const parsed = parseMarkdown(md);
    wordsRef.current = parsed;
    setWordsState(parsed);
    idxRef.current = 0;
    stop();
    renderIdle();
    updateStats();
  }, [stop, renderIdle, updateStats]);

  // ── Progress bar seek ──

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const w = wordsRef.current;
    if (w.length === 0 || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const wasPlaying = playingRef.current;
    stop();
    idxRef.current = Math.max(0, Math.min(Math.floor(pct * w.length), w.length - 1));
    renderWord(w[idxRef.current]);
    updateStats();
    if (wasPlaying) {
      playingRef.current = true;
      setPlaying(true);
      if (speechEnabledRef.current) {
        startSpeechDriven(idxRef.current);
      } else {
        tick();
      }
    }
  }, [stop, renderWord, updateStats, tick, startSpeechDriven]);

  // ── Keyboard shortcuts ──

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      else if (e.code === "ArrowLeft") adjustWpm(-50);
      else if (e.code === "ArrowRight") adjustWpm(50);
      else if (e.code === "KeyR") restart();
      else if (e.code === "KeyS") toggleSpeech();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [togglePlay, adjustWpm, restart, toggleSpeech]);

  // ── Resize handler ──

  useEffect(() => {
    function onResize() { alignPivot(); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [alignPivot]);

  // ── Init: load content ──

  useEffect(() => {
    if (initialMarkdown) {
      loadMarkdown(initialMarkdown);
      setEditorText(initialMarkdown);
      if (!contentTitle) {
        const match = initialMarkdown.match(/^#\s+(.+)$/m);
        if (match) {
          const title = match[1].replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
          if (title) setDisplayTitle(title);
        }
      }
      setShowOnboardingBanner(false);
      return;
    }

    // URL-based loading (home page only)
    const raw = window.location.pathname.slice(1);
    const queryUrl = new URLSearchParams(window.location.search).get("url");
    const mdUrl = queryUrl || (raw.length > 0 ? raw.replace(/^(https?:\/)([^/])/, "$1/$2") : null);

    if (mdUrl) {
      fetch(mdUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        })
        .then((md) => {
          setShowOnboardingBanner(false);
          const match = md.match(/^#\s+(.+)$/m);
          if (match) {
            const title = match[1].replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
            if (title) setDisplayTitle(title);
          }
          setEditorText(md);
          loadMarkdown(md);
          renderIdle();
        })
        .catch((err) => {
          setShowOnboardingBanner(false);
          console.error("Failed to load markdown from URL:", err);
          setEditorText("");
          loadMarkdown("");
          setView("editor");
        });
    } else {
      setEditorText(SAMPLE_CONTENT);
      loadMarkdown(SAMPLE_CONTENT);
      renderIdle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── View switching ──

  const switchView = useCallback((v: "reader" | "editor") => {
    setView(v);
    if (v === "editor") stop();
  }, [stop]);

  const loadAndRead = useCallback(() => {
    loadMarkdown(editorText);
    switchView("reader");
  }, [editorText, loadMarkdown, switchView]);

  // ── Render ──

  return (
    <div data-view={view} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Header */}
      <header id="header">
        <div className="logo">
          <span className="logo-icon">◉</span>
          <span className="logo-text">still</span>
          <span className="logo-sub">Reading</span>
        </div>
        <nav className="nav-tabs">
          <button className={`tab ${view === "reader" ? "active" : ""}`} onClick={() => switchView("reader")}>
            Read
          </button>
          {showEditor && (
            <button className={`tab ${view === "editor" ? "active" : ""}`} onClick={() => switchView("editor")}>
              Edit
            </button>
          )}
        </nav>
      </header>

      {/* Reader view */}
      {view === "reader" && (
        <main id="reader-view">
          {/* Onboarding */}
          {showOnboardingBanner && showOnboarding && <Onboarding />}

          {/* Content title */}
          {displayTitle && !showOnboardingBanner && (
            <div id="content-title" style={{ display: "block" }}>{displayTitle}</div>
          )}

          <div className="redicle-container">
            <div className="redicle">
              <div className="guide-top" />
              <div className="guide-bottom" />
              <div className="word-wrapper">
                <span className="word-text" ref={wordTextRef}>
                  <span id="w-before" ref={beforeRef} />
                  <span id="w-pivot" ref={pivotRef} />
                  <span id="w-after" ref={afterRef} />
                </span>
              </div>
            </div>
          </div>

          <div className="progress-container" ref={progressBarRef} onClick={handleProgressClick}>
            <div className="progress-fill" ref={progressFillRef} />
          </div>

          <div className="controls">
            <button className="ctrl-btn" onClick={() => adjustWpm(-50)} title="Slower (←)">−</button>
            <button className="ctrl-btn" onClick={restart} title="Restart (R)">⟲</button>
            <button className="play-btn" onClick={togglePlay}>
              {playing ? "❚❚" : "▶"}
            </button>
            <div className="wpm-display">
              <span id="wpm-number">{wpm}</span>
              <span className="wpm-label">wpm</span>
            </div>
            <button className="ctrl-btn" onClick={() => adjustWpm(50)} title="Faster (→)">+</button>
            <button
              className="ctrl-btn"
              onClick={toggleSpeech}
              title="Speech (S)"
              style={{
                color: speechEnabled ? "var(--accent)" : undefined,
                borderColor: speechEnabled ? "var(--accent)" : undefined,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                {!speechEnabled && <line x1="23" y1="9" x2="17" y2="15" />}
              </svg>
            </button>
          </div>

          <div className="stats">
            <span id="stat-pos">{statPos}</span>
            <span className="stat-divider">·</span>
            <span id="stat-eta">{statEta}</span>
          </div>
        </main>
      )}

      {/* Editor view */}
      {view === "editor" && showEditor && (
        <section id="editor-view" style={{ display: "flex" }}>
          <div className="editor-header">
            <p className="editor-label">Paste your Markdown below</p>
            <span id="editor-word-count">{parseMarkdown(editorText).length} words</span>
          </div>
          <textarea
            className="md-textarea"
            spellCheck={false}
            placeholder="# Paste your markdown here..."
            value={editorText}
            onChange={(e) => setEditorText(e.target.value)}
          />
          <button className="load-btn" onClick={loadAndRead}>Start Reading →</button>
        </section>
      )}

      {/* WPM popup */}
      {wpmPopupVisible && (
        <div className="wpm-popup">{wpm} wpm</div>
      )}

      {/* Footer */}
      <footer className="site-footer">
        <a href="https://github.com/megabyte0x/stillReading" target="_blank" rel="noopener noreferrer" title="GitHub">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" /></svg>
        </a>
      </footer>
    </div>
  );
}

/** Onboarding banner — extracted as sub-component for clarity */
function Onboarding() {
  const [activeTab, setActiveTab] = useState<"human" | "agent">("human");
  const [urlValue, setUrlValue] = useState("");

  function navigateToUrl() {
    const url = urlValue.trim();
    if (!url) return;
    window.location.href = "/" + url;
  }

  function copyToClipboard(text: string, btn: HTMLButtonElement) {
    navigator.clipboard.writeText(text);
    const orig = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = orig; }, 1500);
  }

  return (
    <div id="onboarding">
      <div className="onboarding-tabs">
        <button className={`onboarding-tab ${activeTab === "human" ? "active" : ""}`} onClick={() => setActiveTab("human")}>Human</button>
        <button className={`onboarding-tab ${activeTab === "agent" ? "active" : ""}`} onClick={() => setActiveTab("agent")}>Agent</button>
      </div>
      {activeTab === "human" && (
        <div className="onboarding-panel active">
          <input
            type="url"
            className="onboarding-url"
            placeholder="Paste a raw markdown URL..."
            autoComplete="off"
            spellCheck={false}
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => { if (e.code === "Enter") navigateToUrl(); }}
          />
          <button className="load-btn" onClick={navigateToUrl}>Start still Reading →</button>
        </div>
      )}
      {activeTab === "agent" && (
        <div className="onboarding-panel active">
          <p className="onboarding-desc">Let your AI agent publish markdown as a still-reading link.</p>
          <div className="code-block">
            <code>npx skills add megabyte0x/stillReading --skill still-reading -g</code>
            <button className="copy-btn" onClick={(e) => copyToClipboard("npx skills add megabyte0x/stillReading --skill still-reading -g", e.currentTarget)}>Copy</button>
          </div>
          <span className="or-divider">or</span>
          <div className="code-block">
            <code>curl -fsSL https://stillreading.xyz/install.sh | bash</code>
            <button className="copy-btn" onClick={(e) => copyToClipboard("curl -fsSL https://stillreading.xyz/install.sh | bash", e.currentTarget)}>Copy</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/RSVPReader.tsx && git commit -m "feat: add RSVPReader React component wrapping RSVP engine"
```

---

## Task 4: Port Home Page to Next.js

> **Skills:** Invoke `@.claude/skills/web-design-guidelines` — after verifying feature parity, fetch the guidelines and review all UI components for accessibility, semantic HTML, keyboard nav, and responsive correctness.

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css` (ensure complete CSS is ported)

**Step 1: Update `app/page.tsx`**

```tsx
import RSVPReader from "@/components/RSVPReader";

export default function Home() {
  return <RSVPReader showEditor={true} showOnboarding={true} />;
}
```

**Step 2: Verify `app/globals.css` contains the complete CSS**

Ensure every CSS rule from `index.html` lines 48-773 is present. The CSS is framework-agnostic, so it works as-is in Next.js.

**Step 3: Verify the home page works**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- Reader view renders with redicle and ORP guides
- Play/pause works
- WPM adjustment changes speed immediately
- Editor tab works (paste markdown, start reading)
- Onboarding banner shows with Human/Agent tabs
- URL loading works (`/?url=...`)
- Keyboard shortcuts work (Space, Arrow keys, R, S)
- Speech synthesis toggle works
- Progress bar seek works
- Responsive at mobile viewport widths

**Step 4: Add Vercel Web Analytics**

Install:
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```tsx
import { Analytics } from "@vercel/analytics/react";

// Inside the <body> tag, after {children}:
<Analytics />
```

**Step 5: Commit**

```bash
git add app/ components/ && git commit -m "feat: port home page to Next.js with full feature parity"
```

---

## Task 5: Port OG Image API Route

**Files:**
- Create: `app/api/og/route.tsx`
- Delete: `api/og.js` (old Vercel serverless function)

**Step 1: Create `app/api/og/route.tsx`**

Port the existing `api/og.js` to Next.js App Router format:

```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "2px", height: "24px", backgroundColor: "#dc2626", opacity: 0.6 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #222228",
              borderBottom: "1px solid #222228",
              width: "900px",
              height: "160px",
            }}
          >
            <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <span style={{ color: "#e4e4e7", fontSize: 72, fontWeight: 500, letterSpacing: "0.03em" }}>sti</span>
            </div>
            <span style={{ color: "#dc2626", fontSize: 72, fontWeight: 700, letterSpacing: "0.03em" }}>l</span>
            <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
              <span style={{ color: "#e4e4e7", fontSize: 72, fontWeight: 500, letterSpacing: "0.03em" }}>lReading</span>
            </div>
          </div>
          <div style={{ width: "2px", height: "24px", backgroundColor: "#dc2626", opacity: 0.6 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 48, gap: 16 }}>
          <span style={{ color: "#52525b", fontSize: 28 }}>Speed read anything. Word by word.</span>
          <div style={{ display: "flex", gap: 32, color: "#3f3f46", fontSize: 20 }}>
            <span>1. Paste markdown</span>
            <span style={{ color: "#222228" }}>|</span>
            <span>2. Hit play</span>
            <span style={{ color: "#222228" }}>|</span>
            <span>3. Read faster</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
```

**Step 2: Delete the old API file**

```bash
rm api/og.js
rmdir api  # remove empty directory
```

**Step 3: Commit**

```bash
git add app/api/og/route.tsx && git rm api/og.js && git commit -m "refactor: port OG image API to Next.js App Router"
```

---

## Task 6: Set Up Supabase — Schema, RLS, RPC

**Files:**
- Create: `lib/supabase.ts`
- Create: `lib/types.ts`
- Create: `.env.local` (not committed)

This task requires a Supabase project to be created first. The owner must:
1. Create a Supabase project at https://supabase.com
2. Get the project URL and anon key

**Step 1: Create `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Add to `.gitignore`:
```
.env*.local
```

**Step 2: Create `lib/types.ts`**

```ts
export interface Article {
  id: string;
  slug: string;
  title: string;
  source_url: string | null;
  markdown_body: string;
  tags: string[];
  word_count: number;
  upvotes: number;
  downvotes: number;
  score: number;
  created_at: string;
}
```

**Step 3: Create `lib/supabase.ts`**

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Step 4: Run SQL in Supabase SQL Editor**

Execute this in the Supabase dashboard SQL editor:

```sql
-- Create articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  source_url TEXT,
  markdown_body TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  word_count INTEGER NOT NULL DEFAULT 0,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read articles"
  ON articles FOR SELECT
  USING (true);

-- Vote RPC function (atomic increment)
CREATE OR REPLACE FUNCTION vote_article(article_id UUID, direction TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF direction = 'up' THEN
    UPDATE articles
    SET upvotes = upvotes + 1,
        score = upvotes + 1 - downvotes
    WHERE id = article_id;
  ELSIF direction = 'down' THEN
    UPDATE articles
    SET downvotes = downvotes + 1,
        score = upvotes - (downvotes + 1)
    WHERE id = article_id;
  ELSE
    RAISE EXCEPTION 'Invalid direction: %', direction;
  END IF;
END;
$$;

-- Create index for sorting by score
CREATE INDEX idx_articles_score ON articles (score DESC, created_at DESC);
```

**Step 5: Commit**

```bash
git add lib/types.ts lib/supabase.ts .gitignore && git commit -m "feat: add Supabase client, Article type, and schema SQL"
```

---

## Task 7: Build Vote API Route

**Files:**
- Create: `app/api/vote/route.ts`

**Step 1: Create `app/api/vote/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { articleId, direction } = body;

  if (!articleId || !["up", "down"].includes(direction)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabase.rpc("vote_article", {
    article_id: articleId,
    direction,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

**Step 2: Commit**

```bash
git add app/api/vote/route.ts && git commit -m "feat: add vote API route calling Supabase RPC"
```

---

## Task 8: Build /readthis Page Components

> **Skills:** Invoke `@.claude/skills/vercel-composition-patterns` — follow `architecture-compound-components` for ArticleCard structure, `patterns-explicit-variants` for vote button states. Invoke `@.claude/skills/vercel-react-best-practices` — follow `rerender-memo` for card list optimization, `client-localstorage-schema` for vote storage, `rendering-conditional-render` for ternary conditionals.

**Files:**
- Create: `components/SearchBar.tsx`
- Create: `components/TagFilter.tsx`
- Create: `components/ArticleCard.tsx`

**Step 1: Create `components/SearchBar.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), 200);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <input
      type="text"
      className="search-bar"
      placeholder="Search articles..."
      autoComplete="off"
      spellCheck={false}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

**Step 2: Create `components/TagFilter.tsx`**

```tsx
"use client";

interface TagFilterProps {
  tags: string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export default function TagFilter({ tags, activeTags, onToggle, onClear }: TagFilterProps) {
  return (
    <div className="tag-strip">
      <button
        className={`tag-pill ${activeTags.length === 0 ? "active" : ""}`}
        onClick={onClear}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`tag-pill ${activeTags.includes(tag) ? "active" : ""}`}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
```

**Step 3: Create `components/ArticleCard.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatReadTime } from "@/lib/rsvp-engine";
import type { Article } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [score, setScore] = useState(article.score);
  const [voted, setVoted] = useState<"up" | "down" | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`voted_${article.id}`) as "up" | "down" | null;
  });

  async function vote(direction: "up" | "down") {
    if (voted) return; // already voted
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: article.id, direction }),
    });
    if (res.ok) {
      setScore((prev) => prev + (direction === "up" ? 1 : -1));
      setVoted(direction);
      localStorage.setItem(`voted_${article.id}`, direction);
    }
  }

  return (
    <div className="article-card">
      <div className="article-vote">
        <button
          className={`vote-btn vote-up ${voted === "up" ? "voted" : ""}`}
          onClick={() => vote("up")}
          disabled={voted !== null}
          aria-label="Upvote"
        >
          ▲
        </button>
        <span className="vote-score">{score}</span>
        <button
          className={`vote-btn vote-down ${voted === "down" ? "voted" : ""}`}
          onClick={() => vote("down")}
          disabled={voted !== null}
          aria-label="Downvote"
        >
          ▼
        </button>
      </div>
      <div className="article-info">
        <h3 className="article-title">{article.title}</h3>
        <span className="article-readtime">{formatReadTime(article.word_count)} to stillread</span>
      </div>
      <Link href={`/readthis/${article.slug}`} className="article-play" aria-label="Read article">
        ▶
      </Link>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add components/SearchBar.tsx components/TagFilter.tsx components/ArticleCard.tsx && git commit -m "feat: add SearchBar, TagFilter, ArticleCard components"
```

---

## Task 9: Build /readthis Page

> **Skills:** Invoke `@.claude/skills/vercel-react-best-practices` — follow `server-serialization` to minimize data passed to client component, `async-suspense-boundaries` for streaming the article list, `server-parallel-fetching` for data loading. Invoke `@.claude/skills/web-design-guidelines` — review the page for accessibility, responsive grid, keyboard navigation through cards.

**Files:**
- Create: `app/readthis/page.tsx`
- Create: `app/readthis/ReadThisClient.tsx`
- Modify: `app/globals.css` (add new CSS for readthis page)

**Step 1: Create `app/readthis/page.tsx` (server component)**

```tsx
import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/types";
import ReadThisClient from "./ReadThisClient";

export const metadata = {
  title: "you should read this — stillReading",
  description: "Curated reading list. Browse, filter, and speed-read the best articles.",
};

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function ReadThisPage() {
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false });

  // Extract unique tags from all articles
  const allTags = Array.from(
    new Set((articles ?? []).flatMap((a: Article) => a.tags))
  ).sort();

  return <ReadThisClient articles={articles ?? []} allTags={allTags} />;
}
```

**Step 2: Create `app/readthis/ReadThisClient.tsx` (client component)**

```tsx
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import TagFilter from "@/components/TagFilter";
import ArticleCard from "@/components/ArticleCard";
import type { Article } from "@/lib/types";

interface ReadThisClientProps {
  articles: Article[];
  allTags: string[];
}

export default function ReadThisClient({ articles, allTags }: ReadThisClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  const handleToggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleClearTags = useCallback(() => {
    setActiveTags([]);
  }, []);

  const filtered = articles.filter((a) => {
    const matchesSearch = searchQuery === "" || a.title.toLowerCase().includes(searchQuery);
    const matchesTags = activeTags.length === 0 || activeTags.every((t) => a.tags.includes(t));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="readthis-container">
      {/* Header */}
      <header id="header">
        <Link href="/" className="logo" style={{ textDecoration: "none" }}>
          <span className="logo-icon">◉</span>
          <span className="logo-text">still</span>
          <span className="logo-sub">Reading</span>
        </Link>
        <nav className="nav-tabs">
          <Link href="/" className="tab">Read</Link>
          <span className="tab active">you should read this</span>
        </nav>
      </header>

      <div className="readthis-content">
        <h1 className="readthis-heading">These are real good ones!</h1>
        <SearchBar onSearch={handleSearch} />
        <TagFilter tags={allTags} activeTags={activeTags} onToggle={handleToggleTag} onClear={handleClearTags} />

        {filtered.length > 0 ? (
          <div className="article-grid">
            {filtered.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="readthis-empty">No articles match your filters.</p>
        )}
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <a href="https://github.com/megabyte0x/stillReading" target="_blank" rel="noopener noreferrer" title="GitHub">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" /></svg>
        </a>
      </footer>
    </div>
  );
}
```

**Step 3: Add CSS for /readthis page to `app/globals.css`**

Append these styles after the existing CSS:

```css
/* ══════════════════════════════════════════════════════════════
   /readthis PAGE
   ══════════════════════════════════════════════════════════════ */

.readthis-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
  animation: fadeIn 0.5s ease;
}

.readthis-content {
  width: 100%;
  max-width: 920px;
  padding-top: 100px;
  padding-bottom: 60px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.readthis-heading {
  font-family: var(--sans);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 600;
  color: var(--text);
  text-align: center;
  margin-bottom: 4px;
}

.readthis-empty {
  font-family: var(--mono);
  font-size: 0.85rem;
  color: var(--text-dim);
  text-align: center;
  padding: 40px 0;
}

/* ── Search bar ──────────────────────────────────────────────── */
.search-bar {
  width: 100%;
  height: 48px;
  background: var(--surface);
  border: 1px solid var(--border-dim);
  border-radius: 10px;
  color: var(--text);
  font-family: var(--mono);
  font-size: 0.85rem;
  padding: 0 16px;
}
.search-bar:focus {
  outline: 1px solid var(--accent);
  border-color: var(--accent);
}
.search-bar::placeholder {
  color: var(--text-dim);
}

/* ── Tag strip ───────────────────────────────────────────────── */
.tag-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.tag-strip::-webkit-scrollbar {
  display: none;
}
.tag-pill {
  font-family: var(--sans);
  font-size: 0.78rem;
  font-weight: 500;
  padding: 6px 16px;
  border: 1px solid var(--border-dim);
  border-radius: 20px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.tag-pill:hover {
  border-color: var(--text-muted);
  color: var(--text);
}
.tag-pill.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

/* ── Article grid ────────────────────────────────────────────── */
.article-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 640px) {
  .article-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 960px) {
  .article-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ── Article card ────────────────────────────────────────────── */
.article-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border-dim);
  border-radius: 10px;
  transition: border-color 0.15s ease;
}
.article-card:hover {
  border-color: var(--border);
}

.article-vote {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.vote-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 0.7rem;
  cursor: pointer;
  padding: 2px 6px;
  transition: color 0.15s ease;
}
.vote-btn:hover:not(:disabled) {
  color: var(--text);
}
.vote-btn:disabled {
  cursor: default;
}
.vote-up.voted {
  color: #22c55e;
}
.vote-down.voted {
  color: var(--accent);
}
.vote-score {
  font-family: var(--mono);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text);
  min-width: 24px;
  text-align: center;
}

.article-info {
  flex: 1;
  min-width: 0;
}
.article-title {
  font-family: var(--sans);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}
.article-readtime {
  font-family: var(--mono);
  font-size: 0.72rem;
  color: var(--text-dim);
}

.article-play {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--accent);
  color: var(--accent);
  font-size: 0.85rem;
  text-decoration: none;
  flex-shrink: 0;
  transition: background 0.15s ease;
}
.article-play:hover {
  background: var(--accent-dim);
}

/* ── Vote modal ──────────────────────────────────────────────── */
.vote-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(9, 9, 11, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.3s ease;
}
.vote-modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: fadeIn 0.3s ease;
}
.vote-modal-title {
  font-family: var(--sans);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
}
.vote-modal-buttons {
  display: flex;
  gap: 24px;
}
.vote-modal-btn {
  font-size: 2rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.vote-modal-btn:hover {
  border-color: var(--text-muted);
  transform: scale(1.05);
}
.vote-modal-skip {
  font-family: var(--sans);
  font-size: 0.82rem;
  color: var(--text-dim);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease;
}
.vote-modal-skip:hover {
  color: var(--text-muted);
}

/* ── Readthis responsive ─────────────────────────────────────── */
@media (max-width: 480px) {
  .readthis-content {
    padding-top: 80px;
  }
  .article-card {
    padding: 12px;
    gap: 10px;
  }
}
```

**Step 4: Commit**

```bash
git add app/readthis/ components/ app/globals.css && git commit -m "feat: build /readthis page with article grid, search, and tag filters"
```

---

## Task 10: Build /readthis/[slug] Page and VoteModal

> **Skills:** Invoke `@.claude/skills/vercel-react-best-practices` — follow `server-cache-react` for article fetch dedup in `generateMetadata` + page, `bundle-dynamic-imports` for VoteModal (only loaded on completion). Invoke `@.claude/skills/vercel-composition-patterns` — follow `patterns-children-over-render-props` for ArticleReader composition. Invoke `@.claude/skills/web-design-guidelines` — review modal for accessibility (focus trap, Escape to close, ARIA attributes).

**Files:**
- Create: `components/VoteModal.tsx`
- Create: `app/readthis/[slug]/page.tsx`

**Step 1: Create `components/VoteModal.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VoteModalProps {
  articleId: string;
}

export default function VoteModal({ articleId }: VoteModalProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  async function handleVote(direction: "up" | "down") {
    if (submitted) return;
    setSubmitted(true);
    const existing = localStorage.getItem(`voted_${articleId}`);
    if (!existing) {
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, direction }),
      });
      localStorage.setItem(`voted_${articleId}`, direction);
    }
    router.push("/readthis");
  }

  function handleSkip() {
    router.push("/readthis");
  }

  return (
    <div className="vote-modal-overlay">
      <div className="vote-modal">
        <h2 className="vote-modal-title">Did you enjoy this?</h2>
        <div className="vote-modal-buttons">
          <button className="vote-modal-btn" onClick={() => handleVote("up")} disabled={submitted}>
            👍
          </button>
          <button className="vote-modal-btn" onClick={() => handleVote("down")} disabled={submitted}>
            👎
          </button>
        </div>
        <button className="vote-modal-skip" onClick={handleSkip}>Skip</button>
      </div>
    </div>
  );
}
```

**Step 2: Create `app/readthis/[slug]/page.tsx`**

```tsx
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Article } from "@/lib/types";
import ArticleReader from "./ArticleReader";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { data: article } = await supabase
    .from("articles")
    .select("title")
    .eq("slug", slug)
    .single();

  return {
    title: article ? `${article.title} — stillReading` : "Article — stillReading",
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single<Article>();

  if (!article) notFound();

  return <ArticleReader article={article} />;
}
```

**Step 3: Create `app/readthis/[slug]/ArticleReader.tsx`**

```tsx
"use client";

import { useState } from "react";
import RSVPReader from "@/components/RSVPReader";
import VoteModal from "@/components/VoteModal";
import type { Article } from "@/lib/types";

interface ArticleReaderProps {
  article: Article;
}

export default function ArticleReader({ article }: ArticleReaderProps) {
  const [showVoteModal, setShowVoteModal] = useState(false);

  return (
    <>
      <RSVPReader
        initialMarkdown={article.markdown_body}
        contentTitle={article.title}
        showEditor={false}
        showOnboarding={false}
        onComplete={() => setShowVoteModal(true)}
      />
      {showVoteModal && <VoteModal articleId={article.id} />}
    </>
  );
}
```

**Step 4: Commit**

```bash
git add components/VoteModal.tsx app/readthis/\[slug\]/ && git commit -m "feat: build /readthis/[slug] article reader page with vote modal"
```

---

## Task 11: Add Header Navigation Tab

**Files:**
- Modify: `components/RSVPReader.tsx`

**Step 1: Update the header nav in RSVPReader**

Add a third tab to the header's `<nav>` element in `RSVPReader.tsx`. After the "Edit" tab button:

```tsx
<Link href="/readthis" className="tab" style={{ textDecoration: "none" }}>
  you should read this👇🏻
</Link>
```

Add `import Link from "next/link";` at the top.

**Step 2: Commit**

```bash
git add components/RSVPReader.tsx && git commit -m "feat: add 'you should read this' tab to header navigation"
```

---

## Task 12: Clean Up Old Files and Final Verification

**Files:**
- Delete: `index.html` (replaced by Next.js app)
- Verify: `SKILL.md`, `install.sh`, `README.md` are served from `public/`

**Step 1: Move static files to `public/`**

```bash
mkdir -p public
mv SKILL.md public/SKILL.md
mv install.sh public/install.sh
```

Note: `README.md` stays at project root (it's a repo file, not served).

**Step 2: Delete old `index.html`**

```bash
rm index.html
```

**Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: Build completes with no errors. All routes are generated.

**Step 4: Test locally**

```bash
npm run dev
```

Verify:
- `/` — Home reader works with full feature parity
- `/?url=<markdown-url>` — URL loading works
- `/readthis` — Article grid renders (may be empty if no articles in DB)
- `/readthis/<slug>` — Article reader loads and plays content, vote modal shows on completion
- `/api/og` — Returns OG image
- `/SKILL.md` — Serves the skill file
- `/install.sh` — Serves the install script

**Step 5: Commit**

```bash
git add -A && git commit -m "chore: clean up old files, move static assets to public/"
```

---

## Task 13: Deploy to Vercel

**Step 1: Deploy**

```bash
vercel deploy --prod
```

Expected: Deployment succeeds. Vercel auto-detects Next.js framework.

**Step 2: Set environment variables in Vercel**

In the Vercel dashboard, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Step 3: Redeploy with environment variables**

```bash
vercel deploy --prod
```

**Step 4: Verify production**

- https://stillreading.xyz — Home reader
- https://stillreading.xyz/readthis — Article grid
- https://stillreading.xyz/api/og — OG image

**Step 5: Commit any final config changes**

```bash
git add -A && git commit -m "chore: finalize Vercel deployment config"
```
