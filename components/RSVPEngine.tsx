"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  getORP,
  getWordDelay,
  parseMarkdown,
  computeEta,
  formatEta,
  SAMPLE_CONTENT,
} from "@/lib/rsvp-engine";

interface RSVPEngineProps {
  initialMarkdown?: string;
  contentTitle?: string;
  onComplete?: () => void;
  showEditor?: boolean;
  showOnboarding?: boolean;
}

/** DOM element refs grabbed once on mount */
interface DOMRefs {
  wBefore: HTMLSpanElement;
  wPivot: HTMLSpanElement;
  wAfter: HTMLSpanElement;
  wordText: HTMLSpanElement;
  progressBar: HTMLDivElement;
  progressFill: HTMLDivElement;
  statPos: HTMLSpanElement;
  statEta: HTMLSpanElement;
  wpmNumber: HTMLSpanElement;
  playIcon: HTMLSpanElement;
  btnPlay: HTMLButtonElement;
  btnSlower: HTMLButtonElement;
  btnFaster: HTMLButtonElement;
  btnRestart: HTMLButtonElement;
  btnVoice: HTMLButtonElement;
  tabRead: HTMLElement;
  tabEdit: HTMLElement | null;
  shell: HTMLDivElement;
  readerView: HTMLElement;
  onboardingSlot: HTMLDivElement;
  editorSlot: HTMLDivElement;
  wpmPopupSlot: HTMLDivElement;
  contentTitle: HTMLDivElement;
  contentTitleText: HTMLSpanElement;
}

export default function RSVPEngine({
  initialMarkdown,
  contentTitle,
  onComplete,
  showEditor = true,
  showOnboarding = true,
}: RSVPEngineProps) {
  const [mounted, setMounted] = useState(false);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(showOnboarding);
  const [editorText, setEditorText] = useState("");
  const [editorVisible, setEditorVisible] = useState(false);
  const [wpmPopupVisible, setWpmPopupVisible] = useState(false);
  const [wpmPopupValue, setWpmPopupValue] = useState(300);

  // DOM refs
  const domRef = useRef<DOMRefs | null>(null);

  // Playback state (mutable refs to avoid stale closures)
  const wordsRef = useRef<string[]>([]);
  const idxRef = useRef(0);
  const wpmRef = useRef(300);
  const playingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechDrivingRef = useRef(false);
  const speechEnabledRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref in sync
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // ── Render helpers ──

  const alignPivot = useCallback(() => {
    const d = domRef.current;
    if (!d) return;
    const bw = d.wBefore.offsetWidth;
    const pw = d.wPivot.offsetWidth;
    d.wordText.style.transform = `translateX(-${bw + pw / 2}px)`;
  }, []);

  const renderWord = useCallback(
    (word: string) => {
      const d = domRef.current;
      if (!d) return;
      const orp = getORP(word);
      d.wBefore.textContent = word.slice(0, orp);
      d.wPivot.textContent = word[orp] || "";
      d.wAfter.textContent = word.slice(orp + 1);
      d.wPivot.style.opacity = "1";
      alignPivot();
    },
    [alignPivot],
  );

  const renderIdle = useCallback(() => {
    const d = domRef.current;
    if (!d) return;
    d.wBefore.textContent = "";
    d.wPivot.textContent = "▶";
    d.wAfter.textContent = "";
    d.wPivot.style.opacity = "0.2";
    alignPivot();
  }, [alignPivot]);

  const updateStats = useCallback(() => {
    const d = domRef.current;
    if (!d) return;
    const w = wordsRef.current;
    const i = idxRef.current;
    const total = w.length;
    const current = Math.min(i + 1, total);
    d.statPos.textContent = total > 0 ? `${current} / ${total}` : "0 / 0";
    const secondsLeft = computeEta(w, i, wpmRef.current);
    d.statEta.textContent = formatEta(secondsLeft);
    d.progressFill.style.width = total > 0 ? `${(i / total) * 100}%` : "0%";
  }, []);

  const updatePlayIcon = useCallback((isPlaying: boolean) => {
    const d = domRef.current;
    if (!d) return;
    d.playIcon.textContent = isPlaying ? "❚❚" : "▶";
    d.btnPlay.setAttribute("aria-label", isPlaying ? "Pause playback" : "Start playback");
  }, []);

  // ── Playback ──

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    playingRef.current = false;
    speechDrivingRef.current = false;
    updatePlayIcon(false);
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  }, [updatePlayIcon]);

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

  const startSpeechDriven = useCallback(
    (fromIdx: number) => {
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
    },
    [renderWord, updateStats, stop],
  );

  const togglePlay = useCallback(() => {
    const w = wordsRef.current;
    if (w.length === 0) return;
    if (idxRef.current >= w.length) idxRef.current = 0;
    const newPlaying = !playingRef.current;
    playingRef.current = newPlaying;
    updatePlayIcon(newPlaying);
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
  }, [tick, startSpeechDriven, updatePlayIcon]);

  const restart = useCallback(() => {
    stop();
    idxRef.current = 0;
    const d = domRef.current;
    if (d) d.progressFill.style.width = "0%";
    renderIdle();
    updateStats();
  }, [stop, renderIdle, updateStats]);

  const adjustWpm = useCallback(
    (delta: number) => {
      const newWpm = Math.min(1000, Math.max(50, wpmRef.current + delta));
      wpmRef.current = newWpm;
      const d = domRef.current;
      if (d) d.wpmNumber.textContent = String(newWpm);
      setWpmPopupValue(newWpm);
      setWpmPopupVisible(true);
      setTimeout(() => setWpmPopupVisible(false), 820);
      if (playingRef.current) {
        if (speechEnabledRef.current && speechDrivingRef.current) {
          if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
          speechDrivingRef.current = false;
          startSpeechDriven(
            idxRef.current > 0 ? idxRef.current - 1 : idxRef.current,
          );
        } else if (!speechEnabledRef.current && timerRef.current) {
          clearTimeout(timerRef.current);
          const delay = getWordDelay(
            wordsRef.current[idxRef.current],
            60000 / newWpm,
          );
          timerRef.current = setTimeout(tick, delay);
        }
      }
    },
    [tick, startSpeechDriven],
  );

  const updateVoiceSvg = useCallback((enabled: boolean) => {
    const d = domRef.current;
    if (!d) return;
    const svg = d.btnVoice.querySelector("svg");
    if (!svg) return;
    const existing = svg.querySelector("line");
    if (!enabled && !existing) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "23");
      line.setAttribute("y1", "9");
      line.setAttribute("x2", "17");
      line.setAttribute("y2", "15");
      svg.appendChild(line);
    } else if (enabled && existing) {
      existing.remove();
    }
  }, []);

  const toggleSpeech = useCallback(() => {
    const newVal = !speechEnabledRef.current;
    speechEnabledRef.current = newVal;
    const d = domRef.current;
    if (d) {
      d.btnVoice.classList.toggle("is-active", newVal);
      d.btnVoice.setAttribute("aria-pressed", String(newVal));
      d.btnVoice.setAttribute(
        "aria-label",
        newVal ? "Disable speech mode" : "Enable speech mode",
      );
      updateVoiceSvg(newVal);
    }
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
  }, [tick, startSpeechDriven, updateVoiceSvg]);

  // ── Load markdown ──

  const loadMarkdown = useCallback(
    (md: string) => {
      const parsed = parseMarkdown(md);
      wordsRef.current = parsed;
      idxRef.current = 0;
      stop();
      renderIdle();
      updateStats();
    },
    [stop, renderIdle, updateStats],
  );

  // ── View switching ──

  const switchToReader = useCallback(() => {
    const d = domRef.current;
    if (!d) return;
    d.shell.setAttribute("data-view", "reader");
    d.tabRead.classList.add("active");
    d.tabEdit?.classList.remove("active");
    d.readerView.style.display = "";
    setEditorVisible(false);
  }, []);

  const switchToEditor = useCallback(() => {
    const d = domRef.current;
    if (!d) return;
    stop();
    d.shell.setAttribute("data-view", "editor");
    d.tabRead.classList.remove("active");
    d.tabEdit?.classList.add("active");
    d.readerView.style.display = "none";
    setEditorVisible(true);
  }, [stop]);

  const loadAndRead = useCallback(() => {
    loadMarkdown(editorText);
    switchToReader();
  }, [editorText, loadMarkdown, switchToReader]);

  // ── Focus mode & content title helpers ──

  const applyFocusMode = useCallback((focused: boolean) => {
    const d = domRef.current;
    if (!d) return;
    if (focused) {
      d.shell.classList.add("rsvp-shell-focus");
      d.readerView.className = "reader-focused";
    } else {
      d.shell.classList.remove("rsvp-shell-focus");
      d.readerView.className = "reader-with-onboarding";
    }
  }, []);

  const showContentTitle = useCallback((title: string) => {
    const d = domRef.current;
    if (!d) return;
    d.contentTitleText.textContent = title;
    d.contentTitle.style.display = "";
  }, []);

  // ── Mount: grab DOM elements, attach event listeners, load content ──

  useEffect(() => {
    const getEl = <T extends HTMLElement>(id: string): T | null =>
      document.getElementById(id) as T | null;

    const wBefore = getEl<HTMLSpanElement>("w-before");
    const wPivot = getEl<HTMLSpanElement>("w-pivot");
    const wAfter = getEl<HTMLSpanElement>("w-after");
    const wordText = getEl<HTMLSpanElement>("word-text");
    const progressBar = getEl<HTMLDivElement>("progress-bar");
    const progressFill = getEl<HTMLDivElement>("progress-fill");
    const statPos = getEl<HTMLSpanElement>("stat-pos");
    const statEta = getEl<HTMLSpanElement>("stat-eta");
    const wpmNumber = getEl<HTMLSpanElement>("wpm-number");
    const playIcon = getEl<HTMLSpanElement>("play-icon");
    const btnPlay = getEl<HTMLButtonElement>("btn-play");
    const btnSlower = getEl<HTMLButtonElement>("btn-slower");
    const btnFaster = getEl<HTMLButtonElement>("btn-faster");
    const btnRestart = getEl<HTMLButtonElement>("btn-restart");
    const btnVoice = getEl<HTMLButtonElement>("btn-voice");
    const tabRead = getEl<HTMLElement>("tab-read");
    const tabEdit = getEl<HTMLElement>("tab-edit");
    const shell = getEl<HTMLDivElement>("rsvp-shell");
    const readerView = getEl<HTMLElement>("reader-view");
    const onboardingSlot = getEl<HTMLDivElement>("onboarding-slot");
    const editorSlot = getEl<HTMLDivElement>("editor-slot");
    const wpmPopupSlot = getEl<HTMLDivElement>("wpm-popup-slot");
    const contentTitleEl = getEl<HTMLDivElement>("content-title");
    const contentTitleText = getEl<HTMLSpanElement>("content-title-text");

    // All required elements must exist
    if (
      !wBefore || !wPivot || !wAfter || !wordText ||
      !progressBar || !progressFill || !statPos || !statEta ||
      !wpmNumber || !playIcon || !btnPlay || !btnSlower ||
      !btnFaster || !btnRestart || !btnVoice || !tabRead ||
      !shell || !readerView || !onboardingSlot || !editorSlot ||
      !wpmPopupSlot || !contentTitleEl || !contentTitleText
    ) {
      console.error("RSVPEngine: missing DOM elements");
      return;
    }

    domRef.current = {
      wBefore,
      wPivot,
      wAfter,
      wordText,
      progressBar,
      progressFill,
      statPos,
      statEta,
      wpmNumber,
      playIcon,
      btnPlay,
      btnSlower,
      btnFaster,
      btnRestart,
      btnVoice,
      tabRead,
      tabEdit,
      shell,
      readerView,
      onboardingSlot,
      editorSlot,
      wpmPopupSlot,
      contentTitle: contentTitleEl,
      contentTitleText,
    };

    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── After mount: attach button listeners ──

  useEffect(() => {
    if (!mounted) return;
    const d = domRef.current;
    if (!d) return;

    // Button handlers
    const onPlay = () => togglePlay();
    const onSlower = () => adjustWpm(-50);
    const onFaster = () => adjustWpm(50);
    const onRestart = () => restart();
    const onVoice = () => toggleSpeech();

    d.btnPlay.addEventListener("click", onPlay);
    d.btnSlower.addEventListener("click", onSlower);
    d.btnFaster.addEventListener("click", onFaster);
    d.btnRestart.addEventListener("click", onRestart);
    d.btnVoice.addEventListener("click", onVoice);

    // Tab handlers
    const onTabRead = (e: Event) => {
      e.preventDefault();
      switchToReader();
    };
    const onTabEdit = () => switchToEditor();

    d.tabRead.addEventListener("click", onTabRead);
    d.tabEdit?.addEventListener("click", onTabEdit);

    // Progress bar click-to-seek
    const onProgressClick = (e: MouseEvent) => {
      const w = wordsRef.current;
      if (w.length === 0) return;
      const rect = d.progressBar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      const wasPlaying = playingRef.current;
      stop();
      idxRef.current = Math.max(
        0,
        Math.min(Math.floor(pct * w.length), w.length - 1),
      );
      renderWord(w[idxRef.current]);
      updateStats();
      if (wasPlaying) {
        playingRef.current = true;
        updatePlayIcon(true);
        if (speechEnabledRef.current) {
          startSpeechDriven(idxRef.current);
        } else {
          tick();
        }
      }
    };
    d.progressBar.addEventListener("click", onProgressClick);

    // Keyboard shortcuts
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowLeft") adjustWpm(-50);
      else if (e.code === "ArrowRight") adjustWpm(50);
      else if (e.code === "KeyR") restart();
      else if (e.code === "KeyS") toggleSpeech();
    };
    document.addEventListener("keydown", handleKey);

    // Resize handler
    const onResize = () => alignPivot();
    window.addEventListener("resize", onResize);

    return () => {
      d.btnPlay.removeEventListener("click", onPlay);
      d.btnSlower.removeEventListener("click", onSlower);
      d.btnFaster.removeEventListener("click", onFaster);
      d.btnRestart.removeEventListener("click", onRestart);
      d.btnVoice.removeEventListener("click", onVoice);
      d.tabRead.removeEventListener("click", onTabRead);
      d.tabEdit?.removeEventListener("click", onTabEdit);
      d.progressBar.removeEventListener("click", onProgressClick);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", onResize);
    };
  }, [
    mounted,
    togglePlay,
    adjustWpm,
    restart,
    toggleSpeech,
    stop,
    renderWord,
    updateStats,
    tick,
    startSpeechDriven,
    alignPivot,
    switchToReader,
    switchToEditor,
    updatePlayIcon,
  ]);

  // ── Init: load content ──

  useEffect(() => {
    if (!mounted) return;

    if (initialMarkdown) {
      loadMarkdown(initialMarkdown);
      setEditorText(initialMarkdown);
      if (!contentTitle) {
        const match = initialMarkdown.match(/^#\s+(.+)$/m);
        if (match) {
          const title = match[1]
            .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
            .trim();
          if (title) showContentTitle(title);
        }
      } else {
        showContentTitle(contentTitle);
      }
      setShowOnboardingBanner(false);
      return;
    }

    // URL-based loading (home page only)
    const raw = window.location.pathname.slice(1);
    const queryUrl = new URLSearchParams(window.location.search).get("url");
    const mdUrl =
      queryUrl ||
      (raw.length > 0 ? raw.replace(/^(https?:\/)([^/])/, "$1/$2") : null);

    if (mdUrl) {
      fetch(`/api/load-markdown?url=${encodeURIComponent(mdUrl)}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.text();
        })
        .then((md) => {
          setShowOnboardingBanner(false);
          const match = md.match(/^#\s+(.+)$/m);
          if (match) {
            const title = match[1]
              .replace(
                /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
                "",
              )
              .trim();
            if (title) showContentTitle(title);
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
          switchToEditor();
        });
    } else {
      setEditorText(SAMPLE_CONTENT);
      loadMarkdown(SAMPLE_CONTENT);
      renderIdle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // ── Apply focus mode when onboarding banner state changes ──

  useEffect(() => {
    if (!mounted) return;
    applyFocusMode(!showOnboardingBanner);
  }, [mounted, showOnboardingBanner, applyFocusMode]);

  // ── Portals ──

  if (!mounted) return null;

  const d = domRef.current;
  if (!d) return null;

  const editorWordCount = useMemo(
    () => parseMarkdown(editorText).length,
    [editorText],
  );

  return (
    <>
      {/* Onboarding portal */}
      {showOnboardingBanner && showOnboarding &&
        createPortal(<Onboarding />, d.onboardingSlot)}

      {/* Editor portal */}
      {editorVisible && showEditor &&
        createPortal(
          <section id="editor-view">
            <div className="editor-header">
              <p className="editor-label">Paste your Markdown below</p>
              <span id="editor-word-count">{editorWordCount} words</span>
            </div>
            <textarea
              className="md-textarea"
              spellCheck={false}
              placeholder="# Paste your markdown here..."
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
            />
            <button className="load-btn" onClick={loadAndRead}>
              Start Reading →
            </button>
          </section>,
          d.editorSlot,
        )}

      {/* WPM popup portal */}
      {wpmPopupVisible &&
        createPortal(
          <div className="wpm-popup">{wpmPopupValue} wpm</div>,
          d.wpmPopupSlot,
        )}
    </>
  );
}

/** Onboarding banner — extracted as sub-component for clarity */
function Onboarding() {
  const [activeTab, setActiveTab] = useState<"human" | "agent">("human");
  const [urlValue, setUrlValue] = useState("");

  function navigateToUrl() {
    const url = urlValue.trim();
    if (!url) return;
    window.location.href = "/?url=" + encodeURIComponent(url);
  }

  function copyToClipboard(text: string, btn: HTMLButtonElement) {
    navigator.clipboard.writeText(text);
    const orig = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = orig;
    }, 1500);
  }

  return (
    <div id="onboarding">
      <div className="onboarding-intro">
        <p className="onboarding-kicker">Focus Mode Reader</p>
        <h2 className="onboarding-title">
          Enter your markdown link and read without noise.
        </h2>
      </div>
      <div className="onboarding-tabs">
        <button
          type="button"
          className={`onboarding-tab ${activeTab === "human" ? "active" : ""}`}
          onClick={() => setActiveTab("human")}
        >
          Human
        </button>
        <button
          type="button"
          className={`onboarding-tab ${activeTab === "agent" ? "active" : ""}`}
          onClick={() => setActiveTab("agent")}
        >
          Agent
        </button>
      </div>
      {activeTab === "human" && (
        <div className="onboarding-panel active">
          <p className="onboarding-desc">
            Paste a public raw markdown URL to start reading immediately.
          </p>
          <div className="onboarding-action-row">
            <input
              type="url"
              className="onboarding-url"
              placeholder="Paste a raw markdown URL..."
              autoComplete="off"
              spellCheck={false}
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.code === "Enter") navigateToUrl();
              }}
            />
            <button type="button" className="load-btn" onClick={navigateToUrl}>
              read
            </button>
          </div>
        </div>
      )}
      {activeTab === "agent" && (
        <div className="onboarding-panel active">
          <p className="onboarding-desc">
            Let your AI agent publish markdown as a still-reading link.
          </p>
          <div className="code-block">
            <code>
              npx skills add megabyte0x/stillReading --skill still-reading -g
            </code>
            <button
              type="button"
              className="copy-btn"
              onClick={(e) =>
                copyToClipboard(
                  "npx skills add megabyte0x/stillReading --skill still-reading -g",
                  e.currentTarget,
                )
              }
            >
              Copy
            </button>
          </div>
          <span className="or-divider">or</span>
          <div className="code-block">
            <code>curl -fsSL https://stillreading.xyz/install.sh | bash</code>
            <button
              type="button"
              className="copy-btn"
              onClick={(e) =>
                copyToClipboard(
                  "curl -fsSL https://stillreading.xyz/install.sh | bash",
                  e.currentTarget,
                )
              }
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
