import { NextRequest, NextResponse } from "next/server";

import { extractMarkdownFromHereNowHtml } from "@/lib/markdown-source";

const MAX_MARKDOWN_BYTES = 2_000_000;

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url")?.trim();
  if (!rawUrl) {
    return NextResponse.json(
      { error: "Missing required query parameter: url" },
      { status: 400 },
    );
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json(
      { error: "URL must use http or https" },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(target.toString(), {
      redirect: "follow",
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream request failed with status ${upstream.status}` },
        { status: 502 },
      );
    }

    const sourceBody = await upstream.text();
    if (sourceBody.length > MAX_MARKDOWN_BYTES) {
      return NextResponse.json(
        { error: "Source is too large to load" },
        { status: 413 },
      );
    }

    const contentType =
      upstream.headers.get("content-type")?.toLowerCase() ?? "";
    let markdown = sourceBody;

    if (contentType.includes("text/html")) {
      const extracted = extractMarkdownFromHereNowHtml(sourceBody);
      if (!extracted) {
        return NextResponse.json(
          {
            error:
              "Source returned HTML but no raw markdown block was found. Use a raw markdown URL.",
          },
          { status: 422 },
        );
      }
      markdown = extracted;
    }

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to load remote markdown", {
      url: target.toString(),
      error,
    });
    return NextResponse.json(
      { error: "Unable to fetch source URL" },
      { status: 502 },
    );
  }
}
