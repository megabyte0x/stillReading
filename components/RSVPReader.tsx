"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  const [, setWordsState] = useState<string[]>([]);
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
          <Link href="/readthis" className="tab readthis-tab" style={{ textDecoration: "none" }}>
            you should read this 👇🏻
          </Link>
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
