# Onboarding Banner Design

**Date**: 2026-02-24
**Feature**: Tabbed onboarding banner with Human / Agent tabs

## Summary

Add a collapsible onboarding banner inside `#reader-view`, positioned between the fixed header and the redicle. Two tabs: "Human" (paste a raw markdown URL, navigate to shareable link) and "Agent" (install commands for the still-reading skill). Auto-hides when content loads from URL. No way to re-open — reload page to see again.

## Approach

Inline banner (Approach A) — a `<div id="onboarding">` that participates in the reader's flex layout. Hidden via `display: none` when content loads. No changes to existing view-switching logic.

## HTML Structure

```
#onboarding
├── .onboarding-tabs
│   ├── button.onboarding-tab[data-otab="human"]  (active by default)
│   └── button.onboarding-tab[data-otab="agent"]
├── .onboarding-panel#panel-human
│   ├── input[type="url"]     (placeholder: "Paste a raw markdown URL...")
│   └── button.load-btn       ("Start still Reading →")
└── .onboarding-panel#panel-agent
    ├── p                      (one-liner explainer)
    ├── .code-block            (npx command + copy button)
    └── .code-block            (curl command + copy button)
```

## Visual Design

- **Container**: `var(--surface)` bg, `1px solid var(--border-dim)` border, `border-radius: 10px`, max-width `680px`, `margin-top: 88px`, `padding: 24px`, `gap: 16px`.
- **Tabs**: Reuse `.nav-tabs` / `.tab` pill-toggle pattern from header. Slightly larger padding for content area context.
- **Human panel**: Single-line URL input styled like `.md-textarea` (mono font, surface bg, dim border, red focus ring). Red accent "Start still Reading" button (`.load-btn` styles).
- **Agent panel**: One-liner in `var(--text-muted)` Outfit font. Code blocks in `var(--bg)` with mono font at `0.8rem`. Ghost-style "Copy" button per block. Blocks separated by "or" divider in `var(--text-dim)`.
- **Animation**: `fadeIn 0.3s ease` (existing keyframe).

## Behavior

- **Tab switching**: Local toggle — clicking "Human" / "Agent" shows/hides `.onboarding-panel` divs. Independent of Read/Edit view switching.
- **Human tab submit**: On click or Enter, navigates to `window.location.href = '/' + url`. The existing `init()` handles URL loading on page load.
- **Agent tab copy**: `navigator.clipboard.writeText()`, button text changes to "Copied!" for 1.5s.
- **Auto-hide**: In `init()`, if `mdUrl` is truthy, set `onboarding.style.display = 'none'`. Otherwise banner stays visible with sample content in redicle below.
- **No persistence**: Reload = banner reappears (if no URL content).

## Scope

- Modify only `index.html` (CSS + HTML + JS)
- Push to `dev` branch for preview before merging to main
