import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadThisClient from "./ReadThisClient";

export const metadata: Metadata = {
  title: "you should read this — stillReading",
  description:
    "Curated reading list. Browse, filter, and speed-read the best articles.",
  alternates: {
    canonical: "/readthis",
  },
  openGraph: {
    title: "you should read this — stillReading",
    description:
      "Curated reading list. Browse, filter, and speed-read the best articles.",
    url: "https://stillreading.xyz/readthis",
  },
};

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function ReadThisPage() {
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false });

  // Extract unique tags from all articles
  const allTags = Array.from(
    new Set((articles ?? []).flatMap((a: Article) => a.tags))
  ).sort();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "you should read this — stillReading",
    description:
      "Curated reading list. Browse, filter, and speed-read the best articles.",
    url: "https://stillreading.xyz/readthis",
    isPartOf: { "@id": "https://stillreading.xyz/#website" },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: (articles ?? []).length,
      itemListElement: (articles ?? []).map((a: Article, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        name: a.title,
        url: `https://stillreading.xyz/readthis/${a.slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="readthis-container">
        <Header activePage="readthis" />
        <div className="readthis-content">
          <section className="readthis-hero">
            <p className="readthis-kicker">Curated Reading Queue</p>
            <h1 className="readthis-heading">Pick your next high-signal read in seconds.</h1>
            <p className="readthis-subheading">
              Better contrast, faster scanning, and focused filters so you can spend less time searching and more time reading.
            </p>
            <div className="readthis-metrics">
              <div className="readthis-metric">
                <span className="readthis-metric-label">Articles</span>
                <span className="readthis-metric-value">{(articles ?? []).length}</span>
              </div>
              <div className="readthis-metric">
                <span className="readthis-metric-label">Reading time</span>
                <span className="readthis-metric-value">
                  ~{Math.max(1, Math.round((articles ?? []).reduce((s: number, a: Article) => s + a.word_count, 0) / 230))}m
                </span>
              </div>
              <div className="readthis-metric">
                <span className="readthis-metric-label">Library size</span>
                <span className="readthis-metric-value">{(articles ?? []).length} items</span>
              </div>
            </div>
          </section>
          <ReadThisClient articles={articles ?? []} allTags={allTags} />
        </div>
        <Footer />
      </div>
    </>
  );
}
