import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Article } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleReader from "./ArticleReader";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/articles-md`;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: article } = await supabase
    .from("articles")
    .select("title, tags, word_count")
    .eq("slug", slug)
    .single();

  if (!article) {
    return { title: "Article — stillReading" };
  }

  const readingMinutes = Math.ceil(article.word_count / 250);
  const description = `${article.title}. ${readingMinutes} min speed read on stillReading.`;

  return {
    title: `${article.title} — stillReading`,
    description,
    alternates: {
      canonical: `/readthis/${slug}`,
    },
    openGraph: {
      title: `${article.title} — stillReading`,
      description,
      url: `https://stillreading.xyz/readthis/${slug}`,
    },
    keywords: article.tags,
  };
}

async function getMarkdown(article: Article): Promise<string> {
  if (article.storage_path) {
    const res = await fetch(`${STORAGE_BASE}/${article.storage_path}`);
    if (res.ok) return res.text();
  }
  return article.markdown_body ?? "";
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single<Article>();

  if (!article) notFound();

  const markdown = await getMarkdown(article);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        url: `https://stillreading.xyz/readthis/${article.slug}`,
        datePublished: article.created_at,
        wordCount: article.word_count,
        keywords: article.tags,
        isPartOf: { "@id": "https://stillreading.xyz/#website" },
        publisher: { "@id": "https://stillreading.xyz/#organization" },
        mainEntityOfPage: {
          "@type": "WebPage",
          url: `https://stillreading.xyz/readthis/${article.slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://stillreading.xyz",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "you should read this",
            item: "https://stillreading.xyz/readthis",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div data-view="reader" className="rsvp-shell" id="rsvp-shell">
        <Header activePage="reader" />

        <main id="reader-view" className="reader-focused">
          <div id="onboarding-slot" />

          <div id="content-title">
            <span className="content-title-kicker">Now Reading</span>
            <span className="content-title-text" id="content-title-text">{article.title}</span>
          </div>

          <div className="redicle-container">
            <div className="redicle">
              <div className="guide-top" />
              <div className="guide-bottom" />
              <div className="word-wrapper">
                <span className="word-text" id="word-text">
                  <span id="w-before" />
                  <span id="w-pivot" style={{ opacity: 0.2 }}>▶</span>
                  <span id="w-after" />
                </span>
              </div>
            </div>
          </div>

          <div className="reader-console">
            <div className="progress-container" id="progress-bar">
              <div className="progress-fill" id="progress-fill" />
            </div>
            <div className="controls">
              <div className="console-toolbar">
                <div className="stats" aria-live="polite">
                  <span id="stat-pos">0 / 0</span>
                  <span className="stat-divider">·</span>
                  <span id="stat-eta">0s remaining</span>
                </div>
                <div className="speed-controls" role="group" aria-label="Reading speed controls">
                  <button type="button" className="speed-btn" id="btn-slower" title="Slower (←)" aria-label="Decrease speed by 50 words per minute">−</button>
                  <div className="wpm-display" aria-live="polite" aria-atomic="true">
                    <span id="wpm-number">300</span>
                    <span className="wpm-label">wpm</span>
                  </div>
                  <button type="button" className="speed-btn" id="btn-faster" title="Faster (→)" aria-label="Increase speed by 50 words per minute">+</button>
                </div>
              </div>
              <div className="transport-row">
                <button type="button" className="ctrl-btn restart-btn" id="btn-restart" title="Restart (R)" aria-label="Restart reading from the beginning">
                  <span className="btn-icon" aria-hidden="true">⟲</span>
                </button>
                <button type="button" className="play-btn" id="btn-play" aria-label="Start playback">
                  <span className="play-icon" id="play-icon" aria-hidden="true">▶</span>
                </button>
                <button type="button" className="ctrl-btn voice-btn" id="btn-voice" title="Speech (S)" aria-label="Enable speech mode" aria-pressed="false">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>

        <div id="editor-slot" />
        <div id="wpm-popup-slot" />

        <Footer />
      </div>
      <ArticleReader article={article} markdown={markdown} />
    </>
  );
}
