import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Article } from "@/lib/types";
import ArticleReader from "./ArticleReader";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/articles-md`;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { data: article } = await supabase
    .from("articles")
    .select("title")
    .eq("slug", slug)
    .single();

  return {
    title: article ? `${article.title} — stillReading` : "Article — stillReading",
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

  return <ArticleReader article={article} markdown={markdown} />;
}
