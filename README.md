# stillReading

RSVP (Rapid Serial Visual Presentation) speed reader. Displays words one at a time with ORP (Optimal Recognition Point) highlighting — the same technique pioneered by Spritz.

**Live at [still-reading.vercel.app](https://still-reading.vercel.app)**

## How it works

1. Paste markdown in the editor
2. Hit play — words appear one at a time at a fixed focal point
3. The red-highlighted letter (ORP) is where your brain starts recognizing each word
4. Your eyes never move — no saccades, faster reading

## Features

- ORP-aligned word display with vertical guide markers
- Adjustable speed: 50–1000 WPM (default 300)
- Adaptive timing — longer words and sentence endings get more time
- Clickable progress bar with seek
- Keyboard shortcuts: Space (play/pause), Arrow keys (speed), R (restart)
- Markdown stripping — paste formatted markdown, read clean text
- External URL loading — load content via path

## Load content via URL

Append a raw markdown URL after `/`:

```
https://still-reading.vercel.app/https://example.com/article.md
```

Content is pre-loaded in the reader, ready to play.

## Agent Skill

stillReading ships with a [SKILL.md](SKILL.md) compatible with [Anthropic Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview). AI agents can publish markdown and construct a stillReading URL for users to speed-read.

**Install as a skill:**

```bash
npx skills add megabyte0x/stillReading --skill still-reading -g
```

Or without npm:

```bash
curl -fsSL https://still-reading.vercel.app/install.sh | bash
```

See [SKILL.md](SKILL.md) for the full spec and formatting rules.

## Architecture

Single-file vanilla HTML/CSS/JS — no framework, no build step, no bundler. The entire app is `index.html`.

## Development

Open `index.html` in a browser. No install, no build.

## Deployment

```bash
vercel deploy --prod
```

## License

MIT
