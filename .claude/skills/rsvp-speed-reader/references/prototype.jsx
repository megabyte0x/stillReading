import { useState, useEffect, useRef, useCallback } from "react";

const SAMPLE_MARKDOWN = `# The Art of Speed Reading

Speed reading is a collection of techniques used to increase one's rate of reading without greatly reducing comprehension or retention. These methods typically involve visual guides, chunking text, and minimizing subvocalization.

## How RSVP Works

Rapid Serial Visual Presentation displays words one at a time at a fixed focal point. The Optimal Recognition Point — the letter your brain naturally focuses on first — is highlighted and centered, eliminating eye movement entirely.

## Benefits

This technique allows readers to consume text significantly faster than traditional reading. By removing saccades, the brain can focus purely on word recognition and meaning construction.

## Tips for Best Results

Start at a comfortable speed around 250 words per minute. Gradually increase as you become familiar with the format. Take breaks every few minutes to avoid visual fatigue. Remember that comprehension matters more than raw speed.

The goal is not to race through text, but to find your optimal pace where speed and understanding coexist harmoniously.`;

function getORP(word) {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

function getWordDelay(word, baseDelay) {
  let multiplier = 1;
  if (word.length > 8) multiplier += 0.3;
  if (word.length > 12) multiplier += 0.2;
  if (/[.!?]$/.test(word)) multiplier += 1.2;
  else if (/[,;:]$/.test(word)) multiplier += 0.5;
  else if (/[-–—]$/.test(word)) multiplier += 0.3;
  return baseDelay * multiplier;
}

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

function Redicle({ word, isPlaying }) {
  if (!word) {
    return (
      <div style={styles.redicleContainer}>
        <div style={styles.redicle}>
          <div style={styles.guideLine} />
          <div style={styles.guideLineMid} />
          <span style={{ ...styles.wordText, opacity: 0.2, fontSize: "3.5rem" }}>
            ▶
          </span>
        </div>
      </div>
    );
  }

  const orpIndex = getORP(word);
  const before = word.slice(0, orpIndex);
  const pivot = word[orpIndex] || "";
  const after = word.slice(orpIndex + 1);

  return (
    <div style={styles.redicleContainer}>
      <div style={styles.redicle}>
        <div style={styles.guideLine} />
        <div style={styles.guideLineMid} />
        <div style={styles.wordWrapper}>
          <span style={styles.wordText}>
            <span style={styles.beforeORP}>{before}</span>
            <span style={styles.orpLetter}>{pivot}</span>
            <span style={styles.afterORP}>{after}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RSVPReader() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [view, setView] = useState("reader");
  const [progress, setProgress] = useState(0);
  const [showWpmPopup, setShowWpmPopup] = useState(false);

  const timerRef = useRef(null);
  const indexRef = useRef(0);
  const wordsRef = useRef([]);

  useEffect(() => {
    const parsed = parseMarkdown(markdown);
    setWords(parsed);
    wordsRef.current = parsed;
    setCurrentIndex(0);
    indexRef.current = 0;
    setProgress(0);
  }, [markdown]);

  const tick = useCallback(() => {
    const i = indexRef.current;
    const w = wordsRef.current;

    if (i >= w.length) {
      setIsPlaying(false);
      return;
    }

    setCurrentIndex(i);
    setProgress(((i + 1) / w.length) * 100);

    const baseDelay = 60000 / wpm;
    const delay = getWordDelay(w[i], baseDelay);

    indexRef.current = i + 1;
    timerRef.current = setTimeout(tick, delay);
  }, [wpm]);

  useEffect(() => {
    if (isPlaying) {
      tick();
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, tick]);

  const togglePlay = () => {
    if (indexRef.current >= wordsRef.current.length) {
      indexRef.current = 0;
      setCurrentIndex(0);
      setProgress(0);
    }
    setIsPlaying((p) => !p);
  };

  const restart = () => {
    setIsPlaying(false);
    clearTimeout(timerRef.current);
    indexRef.current = 0;
    setCurrentIndex(0);
    setProgress(0);
  };

  const adjustWpm = (delta) => {
    setWpm((prev) => Math.max(50, Math.min(1000, prev + delta)));
    setShowWpmPopup(true);
    setTimeout(() => setShowWpmPopup(false), 800);
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const newIndex = Math.floor(pct * words.length);
    const wasPlaying = isPlaying;
    setIsPlaying(false);
    clearTimeout(timerRef.current);
    indexRef.current = newIndex;
    setCurrentIndex(newIndex);
    setProgress(((newIndex + 1) / words.length) * 100);
    if (wasPlaying) {
      setTimeout(() => setIsPlaying(true), 50);
    }
  };

  const handleLoadMarkdown = () => {
    setView("reader");
    restart();
  };

  const currentWord = words[currentIndex] || "";
  const remaining = words.length - currentIndex;
  const etaSeconds = Math.round((remaining / wpm) * 60);
  const etaMin = Math.floor(etaSeconds / 60);
  const etaSec = etaSeconds % 60;

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090b; }
        ::selection { background: #dc2626; color: #fff; }
        textarea:focus, button:focus-visible { outline: 1px solid #dc2626; outline-offset: 2px; }
        input[type=range] { -webkit-appearance: none; background: transparent; cursor: pointer; width: 100%; }
        input[type=range]::-webkit-slider-track { height: 3px; background: #27272a; border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #dc2626; margin-top: -5.5px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes wpmPop { 0% { opacity: 0; transform: scale(0.8); } 30% { opacity: 1; transform: scale(1.05); } 100% { opacity: 0; transform: scale(1); } }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoArea}>
          <span style={styles.logoIcon}>◉</span>
          <span style={styles.logoText}>rsvp</span>
          <span style={styles.logoDot}>reader</span>
        </div>
        <div style={styles.navTabs}>
          <button
            style={{
              ...styles.tab,
              ...(view === "reader" ? styles.tabActive : {}),
            }}
            onClick={() => setView("reader")}
          >
            Read
          </button>
          <button
            style={{
              ...styles.tab,
              ...(view === "editor" ? styles.tabActive : {}),
            }}
            onClick={() => {
              setView("editor");
              setIsPlaying(false);
              clearTimeout(timerRef.current);
            }}
          >
            Edit
          </button>
        </div>
      </header>

      {view === "editor" ? (
        <div style={styles.editorView}>
          <div style={styles.editorHeader}>
            <p style={styles.editorLabel}>Paste your Markdown below</p>
            <span style={styles.wordCount}>
              {parseMarkdown(markdown).length} words
            </span>
          </div>
          <textarea
            style={styles.textarea}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="# Paste your markdown here..."
            spellCheck={false}
          />
          <button style={styles.loadBtn} onClick={handleLoadMarkdown}>
            Start Reading →
          </button>
        </div>
      ) : (
        <div style={styles.readerView}>
          {/* Redicle */}
          <Redicle word={isPlaying || currentIndex > 0 ? currentWord : null} isPlaying={isPlaying} />

          {/* WPM popup */}
          {showWpmPopup && (
            <div style={styles.wpmPopup}>{wpm} wpm</div>
          )}

          {/* Progress bar */}
          <div style={styles.progressContainer} onClick={handleProgressClick}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            <button style={styles.ctrlBtn} onClick={() => adjustWpm(-50)} title="Slower">
              <span style={styles.ctrlIcon}>−</span>
            </button>

            <button style={styles.ctrlBtn} onClick={restart} title="Restart">
              <span style={styles.ctrlIcon}>⟲</span>
            </button>

            <button style={styles.playBtn} onClick={togglePlay}>
              {isPlaying ? "❚❚" : "▶"}
            </button>

            <div style={styles.wpmDisplay}>
              <span style={styles.wpmNumber}>{wpm}</span>
              <span style={styles.wpmLabel}>wpm</span>
            </div>

            <button style={styles.ctrlBtn} onClick={() => adjustWpm(50)} title="Faster">
              <span style={styles.ctrlIcon}>+</span>
            </button>
          </div>

          {/* Stats */}
          <div style={styles.stats}>
            <span style={styles.stat}>
              {currentIndex + 1} / {words.length}
            </span>
            <span style={styles.statDivider}>·</span>
            <span style={styles.stat}>
              {etaMin > 0 ? `${etaMin}m ` : ""}{etaSec}s remaining
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  app: {
    fontFamily: "'Outfit', sans-serif",
    background: "#09090b",
    color: "#fafafa",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 20px",
    animation: "fadeIn 0.4s ease",
  },
  header: {
    width: "100%",
    maxWidth: 640,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 0 20px",
    borderBottom: "1px solid #1a1a1f",
    marginBottom: 40,
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    color: "#dc2626",
    fontSize: "1.1rem",
  },
  logoText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700,
    fontSize: "1rem",
    letterSpacing: "-0.02em",
  },
  logoDot: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 400,
    fontSize: "1rem",
    color: "#52525b",
  },
  navTabs: {
    display: "flex",
    gap: 4,
    background: "#18181b",
    borderRadius: 8,
    padding: 3,
  },
  tab: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "0.82rem",
    fontWeight: 500,
    padding: "6px 16px",
    border: "none",
    borderRadius: 6,
    background: "transparent",
    color: "#71717a",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  tabActive: {
    background: "#27272a",
    color: "#fafafa",
  },

  // Reader
  readerView: {
    width: "100%",
    maxWidth: 640,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    gap: 0,
  },
  redicleContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "60px 0 50px",
  },
  redicle: {
    position: "relative",
    width: "100%",
    maxWidth: 560,
    height: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderTop: "2px solid #1c1c22",
    borderBottom: "2px solid #1c1c22",
  },
  guideLine: {
    position: "absolute",
    left: "50%",
    top: -10,
    width: 1,
    height: 10,
    background: "#dc2626",
    opacity: 0.6,
  },
  guideLineMid: {
    position: "absolute",
    left: "50%",
    bottom: -10,
    width: 1,
    height: 10,
    background: "#dc2626",
    opacity: 0.6,
  },
  wordWrapper: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
  },
  wordText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "3.5rem",
    fontWeight: 500,
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    position: "relative",
    color: "#e4e4e7",
  },
  beforeORP: {
    color: "#e4e4e7",
  },
  orpLetter: {
    color: "#dc2626",
    fontWeight: 700,
  },
  afterORP: {
    color: "#e4e4e7",
  },

  // WPM popup
  wpmPopup: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "1.4rem",
    fontWeight: 600,
    color: "#dc2626",
    background: "rgba(9,9,11,0.9)",
    padding: "12px 28px",
    borderRadius: 12,
    border: "1px solid #27272a",
    animation: "wpmPop 0.8s ease forwards",
    pointerEvents: "none",
    zIndex: 100,
  },

  // Progress
  progressContainer: {
    width: "100%",
    height: 3,
    background: "#18181b",
    borderRadius: 2,
    cursor: "pointer",
    marginBottom: 32,
  },
  progressFill: {
    height: "100%",
    background: "#dc2626",
    borderRadius: 2,
    transition: "width 0.08s linear",
  },

  // Controls
  controls: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "2px solid #dc2626",
    background: "transparent",
    color: "#dc2626",
    fontSize: "1.2rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
  },
  ctrlBtn: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1px solid #27272a",
    background: "transparent",
    color: "#71717a",
    fontSize: "1.2rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
  },
  ctrlIcon: {
    lineHeight: 1,
  },
  wpmDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 50,
  },
  wpmNumber: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#fafafa",
  },
  wpmLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.65rem",
    color: "#52525b",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  // Stats
  stats: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  stat: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.75rem",
    color: "#52525b",
  },
  statDivider: {
    color: "#27272a",
    fontSize: "0.75rem",
  },

  // Editor
  editorView: {
    width: "100%",
    maxWidth: 640,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    flex: 1,
    animation: "fadeIn 0.3s ease",
  },
  editorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editorLabel: {
    fontSize: "0.9rem",
    fontWeight: 400,
    color: "#a1a1aa",
  },
  wordCount: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.75rem",
    color: "#52525b",
  },
  textarea: {
    width: "100%",
    minHeight: 400,
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 12,
    color: "#d4d4d8",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "0.85rem",
    lineHeight: 1.7,
    padding: 20,
    resize: "vertical",
  },
  loadBtn: {
    alignSelf: "flex-end",
    padding: "10px 28px",
    background: "#dc2626",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
};
