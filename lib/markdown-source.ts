const RAW_PRE_BY_ID_RE = /<pre[^>]*\bid=["']raw["'][^>]*>([\s\S]*?)<\/pre>/i;
const RAW_PRE_BY_CLASS_RE =
  /<pre[^>]*\bclass=["'][^"']*\bmd-raw\b[^"']*["'][^>]*>([\s\S]*?)<\/pre>/i;
const NUMERIC_ENTITY_RE = /&#(\d+);/g;
const HEX_ENTITY_RE = /&#x([0-9a-f]+);/gi;

function decodeHtmlEntities(text: string): string {
  return text
    .replace(HEX_ENTITY_RE, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(NUMERIC_ENTITY_RE, (_, dec: string) =>
      String.fromCodePoint(parseInt(dec, 10)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

export function extractMarkdownFromHereNowHtml(html: string): string | null {
  const byId = html.match(RAW_PRE_BY_ID_RE);
  if (byId?.[1] !== undefined) return decodeHtmlEntities(byId[1]);

  const byClass = html.match(RAW_PRE_BY_CLASS_RE);
  if (byClass?.[1] !== undefined) return decodeHtmlEntities(byClass[1]);

  return null;
}
