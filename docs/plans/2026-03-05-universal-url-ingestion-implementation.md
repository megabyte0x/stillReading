# Universal URL Ingestion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users paste any public URL and start RSVP reading immediately by extracting platform content (starting with X and Substack) into normalized markdown.

**Architecture:** Add a server-side ingestion API (`POST /api/ingest`) backed by a scraper-first extractor registry (`x`, `substack`, `generic`). The client onboarding flow submits a URL to this API and loads returned markdown into the existing `RSVPReader` state machine. Security and reliability are enforced with URL validation, SSRF guards, request timeouts, content-size limits, deterministic fallback order, and resilient HTML/embedded-data parsing.

**Tech Stack:** Next.js App Router, React 19, TypeScript strict mode, Node runtime route handlers, Vitest, `@mozilla/readability`, `jsdom`, `turndown`, `fast-xml-parser`, `cheerio`.

**Execution Skills:** Use `@vercel-react-best-practices` for client updates and `@property-based-testing` for parser/normalization edge cases where practical.

---

### Task 1: Testing and Dependency Foundation

**Files:**

- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `lib/ingest/__tests__/smoke.test.ts`

**Step 1: Add ingestion and testing dependencies**

Modify `package.json` to add:

- `@mozilla/readability`
- `jsdom`
- `turndown`
- `fast-xml-parser`
- `vitest` (dev)

Add scripts:

- `"test": "vitest run"`
- `"test:watch": "vitest"`

**Step 2: Write failing smoke test**

```ts
// lib/ingest/__tests__/smoke.test.ts
import { describe, expect, it } from "vitest";

describe("ingest test harness", () => {
  it("runs tests", () => {
    expect(true).toBe(true);
  });
});
```

**Step 3: Run test to verify harness works**

Run: `npm run test -- lib/ingest/__tests__/smoke.test.ts`
Expected: PASS with 1 test.

**Step 4: Commit**

```bash
git add package.json package-lock.json vitest.config.ts test/setup.ts lib/ingest/__tests__/smoke.test.ts
git commit -m "chore: add ingest dependencies and vitest harness"
```

---

### Task 2: URL Validation and SSRF Guardrail Module

**Files:**

- Create: `lib/ingest/url-guards.ts`
- Test: `lib/ingest/__tests__/url-guards.test.ts`

**Step 1: Write failing tests for allowed and blocked URLs**

```ts
// lib/ingest/__tests__/url-guards.test.ts
import { describe, expect, it } from "vitest";
import { normalizePublicUrl } from "../url-guards";

describe("normalizePublicUrl", () => {
  it("accepts normal https url", async () => {
    const result = await normalizePublicUrl("https://example.com/a");
    expect(result.hostname).toBe("example.com");
  });

  it("rejects localhost", async () => {
    await expect(normalizePublicUrl("http://localhost:3000")).rejects.toThrow(
      "disallowed",
    );
  });

  it("rejects private ip literal", async () => {
    await expect(
      normalizePublicUrl("http://192.168.1.20/test"),
    ).rejects.toThrow("disallowed");
  });
});
```

**Step 2: Run tests and confirm failure**

Run: `npm run test -- lib/ingest/__tests__/url-guards.test.ts`
Expected: FAIL with module/function missing.

**Step 3: Implement minimal guard module**

Implement in `lib/ingest/url-guards.ts`:

- `normalizePublicUrl(raw: string): Promise<URL>`
- Enforce protocol `http`/`https`
- Reject URL credentials (`username`, `password`)
- Reject `localhost`, loopback, link-local, private IPv4/IPv6 literals
- Resolve DNS via `dns/promises.lookup` and reject private/loopback resolved addresses

**Step 4: Re-run URL guard tests**

Run: `npm run test -- lib/ingest/__tests__/url-guards.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/ingest/url-guards.ts lib/ingest/__tests__/url-guards.test.ts
git commit -m "feat: add url validation and ssrf guardrails"
```

---

### Task 3: Shared Ingestion Contracts and Fetch Utility

**Files:**

- Create: `lib/ingest/types.ts`
- Create: `lib/ingest/fetch-source.ts`
- Test: `lib/ingest/__tests__/fetch-source.test.ts`

**Step 1: Write failing tests for timeout and max-size behavior**

```ts
import { describe, expect, it, vi } from "vitest";
import { fetchTextSource } from "../fetch-source";

describe("fetchTextSource", () => {
  it("throws when content exceeds max bytes", async () => {
    const fakeFetch = vi.fn().mockResolvedValue(
      new Response("x".repeat(1000), {
        status: 200,
        headers: { "content-type": "text/html" },
      }),
    );

    await expect(
      fetchTextSource("https://example.com", {
        fetchImpl: fakeFetch,
        maxBytes: 100,
      }),
    ).rejects.toThrow("too large");
  });
});
```

**Step 2: Run test and confirm failure**

Run: `npm run test -- lib/ingest/__tests__/fetch-source.test.ts`
Expected: FAIL.

**Step 3: Implement contracts and utility**

`lib/ingest/types.ts`:

- `Platform = "x" | "substack" | "generic"`
- `ExtractResult` with `title`, `markdown`, `platform`, `sourceUrl`, `canonicalUrl`, optional `author`, `publishedAt`
- `Extractor` interface

`lib/ingest/fetch-source.ts`:

- `fetchTextSource(url, { timeoutMs, maxBytes, fetchImpl })`
- Abort via `AbortController`
- Validate content type includes `text/`, `application/xhtml+xml`, `application/xml`
- Enforce `maxBytes`

**Step 4: Re-run tests**

Run: `npm run test -- lib/ingest/__tests__/fetch-source.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/ingest/types.ts lib/ingest/fetch-source.ts lib/ingest/__tests__/fetch-source.test.ts
git commit -m "feat: add shared ingest contracts and bounded fetch utility"
```

---

### Task 4: Generic HTML-to-Markdown Extractor (Fallback)

**Files:**

- Create: `lib/ingest/extractors/generic.ts`
- Test: `lib/ingest/__tests__/generic-extractor.test.ts`

**Step 1: Write failing extraction tests with static HTML fixture**

```ts
import { describe, expect, it } from "vitest";
import { extractGeneric } from "../extractors/generic";

describe("extractGeneric", () => {
  it("extracts readable content and converts to markdown", async () => {
    const html =
      "<html><head><title>Test</title></head><body><article><h1>Hello</h1><p>World body.</p></article></body></html>";
    const result = await extractGeneric({
      sourceUrl: "https://example.com",
      html,
    });
    expect(result.title).toContain("Hello");
    expect(result.markdown).toContain("World body");
  });
});
```

**Step 2: Run tests to verify failure**

Run: `npm run test -- lib/ingest/__tests__/generic-extractor.test.ts`
Expected: FAIL.

**Step 3: Implement extractor**

`lib/ingest/extractors/generic.ts` should:

- Build JSDOM document
- Run Readability parser
- Convert returned HTML to markdown with Turndown
- Normalize whitespace and trim
- Return `platform: "generic"`

**Step 4: Re-run generic extractor tests**

Run: `npm run test -- lib/ingest/__tests__/generic-extractor.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/ingest/extractors/generic.ts lib/ingest/__tests__/generic-extractor.test.ts
git commit -m "feat: add generic readability markdown extractor"
```

---

### Task 5: X Scraper Extractor for Long Posts and Articles

**Files:**

- Create: `lib/ingest/extractors/x.ts`
- Test: `lib/ingest/__tests__/x-extractor.test.ts`

**Step 1: Write failing tests for URL parsing and scraper fallback behavior**

Include cases:

- `https://x.com/<user>/status/<id>` parses `<id>`
- extraction from embedded page JSON fixture succeeds
- fallback extraction from `cdn.syndication.twimg.com/tweet-result?id=<id>` succeeds when page parse fails
- clear error when protected/login-walled content is detected

**Step 2: Run tests and confirm failure**

Run: `npm run test -- lib/ingest/__tests__/x-extractor.test.ts`
Expected: FAIL.

**Step 3: Implement X extractor**

`lib/ingest/extractors/x.ts`:

- `canHandle(url)` for `x.com`, `twitter.com`
- Parse post ID from `/status/:id`
- Fetch source post HTML with browser-like headers (`User-Agent`, `Accept-Language`)
- Parse embedded state blobs (`<script>` JSON, `application/ld+json`, and hydration payloads) for long-form text/article content
- Fallback sequence when primary parsing fails:
  1. `https://cdn.syndication.twimg.com/tweet-result?id=<id>`
  2. `https://publish.twitter.com/oembed?url=<encoded-post-url>&omit_script=true`
- Map extracted text/HTML to markdown:
  - title from author + first sentence
  - body preserving paragraph/newline boundaries
- Throw actionable errors (`not found`, `protected`, `unsupported format`, `content unavailable`)

**Step 4: Re-run X tests**

Run: `npm run test -- lib/ingest/__tests__/x-extractor.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/ingest/extractors/x.ts lib/ingest/__tests__/x-extractor.test.ts
git commit -m "feat: add x scraper extractor with fallback parsing"
```

---

### Task 6: Substack Scraper Extractor with Feed/JSON/HTML Fallbacks

**Files:**

- Create: `lib/ingest/extractors/substack.ts`
- Test: `lib/ingest/__tests__/substack-extractor.test.ts`
- Test fixture: `lib/ingest/__tests__/fixtures/substack-next-data.html`

**Step 1: Write failing tests for three substack paths**

Cover:

- body markdown extracted from `/api/v1/posts/:id` JSON endpoint
- fallback to HTML parsing when JSON endpoint is unavailable
- fallback to feed matching when post id missing

**Step 2: Run tests and confirm failure**

Run: `npm run test -- lib/ingest/__tests__/substack-extractor.test.ts`
Expected: FAIL.

**Step 3: Implement Substack extractor**

`lib/ingest/extractors/substack.ts` flow:

1. Fetch page HTML.
2. Parse `__NEXT_DATA__` or metadata for `postId`, title, canonical URL.
3. If `postId` exists, request `/api/v1/posts/{postId}`.
4. Prefer `body_markdown`; else convert `body_html` to markdown.
5. If no `postId`, parse `/feed` and match canonical link for enrichment.
6. Last fallback: generic extractor on fetched page HTML.

**Step 4: Re-run Substack tests**

Run: `npm run test -- lib/ingest/__tests__/substack-extractor.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/ingest/extractors/substack.ts lib/ingest/__tests__/substack-extractor.test.ts lib/ingest/__tests__/fixtures/substack-next-data.html
git commit -m "feat: add substack extractor with layered fallbacks"
```

---

### Task 7: Extractor Registry and Orchestration Service

**Files:**

- Create: `lib/ingest/index.ts`
- Test: `lib/ingest/__tests__/ingest-index.test.ts`

**Step 1: Write failing tests for extractor selection and fallback order**

Tests should verify:

- X URL uses X extractor first
- Substack URL uses Substack extractor first
- unknown URL uses generic extractor
- on extractor failure, safe fallback to generic (except security failures)

**Step 2: Run tests to verify failure**

Run: `npm run test -- lib/ingest/__tests__/ingest-index.test.ts`
Expected: FAIL.

**Step 3: Implement orchestration**

In `lib/ingest/index.ts`:

- Validate URL via `normalizePublicUrl`
- Choose extractor candidates by host hints
- Execute extractors sequentially with bounded time budget
- Normalize output:
  - enforce non-empty title/markdown
  - strip excessive blank lines
  - compute `wordCount`

**Step 4: Re-run registry tests**

Run: `npm run test -- lib/ingest/__tests__/ingest-index.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/ingest/index.ts lib/ingest/__tests__/ingest-index.test.ts
git commit -m "feat: add ingest orchestration and fallback routing"
```

---

### Task 8: `POST /api/ingest` Route Handler

**Files:**

- Create: `app/api/ingest/route.ts`
- Test: `app/api/ingest/route.test.ts`

**Step 1: Write failing API tests**

Cover:

- 200 for valid URL with `{ ok: true, data }`
- 400 for invalid payload
- 422/502 for extraction failures

**Step 2: Run tests to confirm failure**

Run: `npm run test -- app/api/ingest/route.test.ts`
Expected: FAIL.

**Step 3: Implement route**

Route behavior:

- Parse JSON body `{ url: string }`
- Validate type and length
- Call `ingestUrl(url)`
- Return:

```json
{
  "ok": true,
  "data": {
    "platform": "x",
    "title": "...",
    "markdown": "...",
    "wordCount": 123,
    "sourceUrl": "...",
    "canonicalUrl": "..."
  }
}
```

- Consistent error payload: `{ "error": "..." }`

**Step 4: Re-run API tests**

Run: `npm run test -- app/api/ingest/route.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/api/ingest/route.ts app/api/ingest/route.test.ts
git commit -m "feat: add ingest api route for url-based extraction"
```

---

### Task 9: RSVPReader Onboarding and URL Flow Integration

**Files:**

- Modify: `components/RSVPReader.tsx`
- Modify: `app/globals.css`
- Test: `components/__tests__/rsvp-ingest-flow.test.tsx` (if test renderer is introduced)

**Step 1: Write failing behavior test (or explicit manual test script if UI test infra is skipped)**

Target behavior:

- Human tab accepts any URL
- submit calls `/api/ingest`
- successful response loads markdown and starts in reader view
- failed response shows actionable error and keeps input

**Step 2: Run test (or run manual script and capture current failure)**

Run (if tests): `npm run test -- components/__tests__/rsvp-ingest-flow.test.tsx`
Expected: FAIL.

**Step 3: Implement client integration**

In `components/RSVPReader.tsx`:

- Replace direct `window.location.href = "/" + url` submission behavior
- Add `ingestLoading` + `ingestError` state
- Add `ingestFromUrl(url: string)` helper calling `POST /api/ingest`
- On success: set title, editor text, words, hide onboarding, keep reader view
- Keep existing `?url=` and path loading for backward compatibility by routing those through `ingestFromUrl`

In `app/globals.css`:

- style loading/error states for onboarding URL input

**Step 4: Verify via manual checklist**

Run: `npm run dev`
Verify:

- X status URL loads and reads
- Substack post URL loads and reads
- Generic article URL loads and reads
- invalid URL shows inline error

**Step 5: Commit**

```bash
git add components/RSVPReader.tsx app/globals.css components/__tests__/rsvp-ingest-flow.test.tsx
git commit -m "feat: wire reader onboarding to universal url ingestion"
```

---

### Task 10: Documentation, Ops Notes, and Final Verification

**Files:**

- Modify: `README.md`
- Modify: `AGENTS.md`
- Create: `docs/plans/2026-03-05-universal-url-ingestion-runbook.md` (optional runbook)

**Step 1: Document new behavior and env requirements**

Add:

- user-facing "paste any URL" flow
- supported platforms: X scraper, Substack scraper, generic fallback
- optional env var: `INGEST_FETCH_USER_AGENT` (if custom UA is needed)
- known limitations (paywalls/private posts)

**Step 2: Run full verification suite**

Run:

- `npm run test`
- `npm run build`

Expected:

- Tests pass
- Next.js production build succeeds

**Step 3: Manual QA pass**

Checklist:

- `/` load URL success/failure states
- keyboard controls still work after ingestion
- `/readthis` pages unaffected
- no console errors in success path

**Step 4: Final commit**

```bash
git add README.md AGENTS.md docs/plans/2026-03-05-universal-url-ingestion-runbook.md
git commit -m "docs: add universal url ingestion usage and operational notes"
```

---

## Definition of Done

- Users can paste X/Substack/standard article URLs from onboarding and read immediately.
- Ingestion is server-side, secure, and bounded (SSRF, timeout, max-bytes).
- Extractor behavior is tested with deterministic fixtures and mocks.
- Existing reader controls and `/readthis` behavior remain intact.
- Build and tests pass on the branch.

## Risks and Mitigations

1. X scraper fragility from markup changes, anti-bot responses, or login walls.
   Mitigation: Multi-source fallback chain, fixture-based parser tests, and graceful error messaging.

2. Substack private/internal JSON endpoint instability.
   Mitigation: layered fallback (`api/v1` -> page JSON -> feed -> generic).

3. SSRF/security edge cases.
   Mitigation: DNS + IP guardrails and strict protocol/content-size limits.

4. Readability extraction noise on dynamic websites.
   Mitigation: fallback plus normalization filters and minimum content thresholds.

5. Platform policy/compliance exposure for automated scraping.
   Mitigation: document operator responsibility, keep host allow-list configurable, and provide fast disable switches per platform extractor.
