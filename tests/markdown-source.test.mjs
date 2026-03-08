import test from "node:test";
import assert from "node:assert/strict";

import { extractMarkdownFromHereNowHtml } from "../lib/markdown-source.ts";

const HERE_NOW_HTML = `<!doctype html>
<html>
  <body>
    <div class="md-rendered"><h1>Rendered</h1></div>
    <pre class="md-raw" id="raw"># Title\n\nLine with &amp; and &#39;quote&#39; and &lt;tag&gt;.
</pre>
  </body>
</html>`;

test("extractMarkdownFromHereNowHtml returns decoded markdown from md-raw pre block", () => {
  const md = extractMarkdownFromHereNowHtml(HERE_NOW_HTML);

  assert.equal(md, "# Title\n\nLine with & and 'quote' and <tag>.\n");
});
