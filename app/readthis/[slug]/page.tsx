import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Article } from "@/lib/types";
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
      <ArticleReader article={article} markdown={markdown} />
    </>
  );
}
