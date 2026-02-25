import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Article } from "@/lib/types";
import ArticleReader from "./ArticleReader";

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

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single<Article>();

  if (!article) notFound();

  return <ArticleReader article={article} />;
}
