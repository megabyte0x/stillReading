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
