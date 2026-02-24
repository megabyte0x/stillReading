---
name: still-reading
description: Converts markdown content into an RSVP speed-reading experience. Publishes markdown at a public URL and constructs a stillReading link that pre-loads the content for word-by-word reading with ORP highlighting. Use when presenting long-form text, articles, newsletters, documentation, or any markdown content the user wants to speed-read.
---

# stillReading

RSVP (Rapid Serial Visual Presentation) speed reader that displays words one at a time with ORP (Optimal Recognition Point) highlighting. Deployed at `https://still-reading.vercel.app`.

## How to use

1. Write your content as raw markdown
2. Publish it at a publicly accessible URL (see [Publishing with here.now](#publishing-with-herenow) below)
3. Construct a stillReading URL using the `url` query parameter:

```
https://still-reading.vercel.app?url=<RAW_MARKDOWN_URL>
```

4. Share the constructed URL with the user

## Publishing with here.now

[here.now](https://here.now) is an instant web host for AI agents — the fastest way to publish raw markdown to a public URL.

**Setup** (one-time):

Install as a skill if npm is available:
```bash
npx skills add heredotnow/skill --skill here-now -g
```

Otherwise:
```bash
curl -fsSL https://here.now/install.sh | bash
```

**Usage**: Write your markdown to a file and publish it with here.now. The resulting URL (e.g., `https://<name>.here.now/index.md`) serves raw markdown with CORS support — ready to use with stillReading.

You can also use any other hosting service (GitHub raw URLs, static file hosts, etc.) as long as it serves raw markdown and allows cross-origin requests.

## Example

If your markdown is published at:
```
https://dreamy-sandal-ye86.here.now/index.md
```

The stillReading URL is:
```
https://still-reading.vercel.app?url=https://dreamy-sandal-ye86.here.now/index.md
```

## What the user sees

- Content is pre-loaded in the reader (not auto-playing)
- User presses play (or spacebar) to start reading
- Controls: play/pause, speed adjustment (50-1000 WPM), restart, clickable progress bar
- Default speed: 300 WPM

## Requirements

- The markdown URL must be **publicly accessible** (no authentication)
- The hosting service must allow **cross-origin requests** (CORS)
- Content must be **raw markdown** (not rendered HTML)

## Markdown support

Standard markdown is stripped to plain text for reading:
- Headings, bold, italic, strikethrough, inline code
- Links (text kept, URL dropped)
- Lists and blockquotes

## Error handling

If the markdown URL cannot be fetched (CORS, 404, network error), the user is redirected to the editor view where they can paste markdown manually.
