# Agent Skill: External Markdown Loading via URL

## Problem

AI agents that generate or curate markdown content have no way to offer users a speed-reading experience. We want agents to publish markdown at a public URL and construct a stillReading link that pre-loads the content.

## Design

### 1. URL Parameter Support (`index.html`)

On page load, check for `?url=<markdown-url>` query parameter.

- **Present + fetch succeeds**: parse markdown, load into reader (idle state), populate textarea with source
- **Present + fetch fails**: switch to editor view, show inline error message
- **Absent**: load SAMPLE content (current behavior)

No auto-play — user hits play when ready.

### 2. Root `SKILL.md`

A file at `/SKILL.md` following Anthropic's Agent Skills spec. Contains:

- YAML frontmatter with `name` and `description`
- Instructions for agents: publish raw markdown at a public URL, construct `https://still-reading.vercel.app?url=<markdown-url>`
- Example URL
- Requirements note (public URL, CORS-permissive)

Under 100 lines. No implementation details — just the URL contract.

## URL Format

```
https://still-reading.vercel.app?url=https://example.com/article.md
```

## Error Handling

- CORS blocked / 404 / network error → switch to editor view with error message
- No proxy server — keeps zero-infrastructure philosophy

## Scope

- ~20 lines of JS added to init block in `index.html`
- 1 new file: `/SKILL.md`
