import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/types";
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
      <ReadThisClient articles={articles ?? []} allTags={allTags} />
    </>
  );
}
