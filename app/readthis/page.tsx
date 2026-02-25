import { supabase } from "@/lib/supabase";
import type { Article } from "@/lib/types";
import ReadThisClient from "./ReadThisClient";

export const metadata = {
  title: "you should read this — stillReading",
  description: "Curated reading list. Browse, filter, and speed-read the best articles.",
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

  return <ReadThisClient articles={articles ?? []} allTags={allTags} />;
}
