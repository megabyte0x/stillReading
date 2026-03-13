import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, created_at")
    .order("created_at", { ascending: false });

  const articleEntries: MetadataRoute.Sitemap = (articles ?? []).map(
    (article) => ({
      url: `https://stillreading.xyz/readthis/${article.slug}`,
      lastModified: new Date(article.created_at),
    })
  );

  return [
    {
      url: "https://stillreading.xyz",
      lastModified: new Date(),
    },
    {
      url: "https://stillreading.xyz/readthis",
      lastModified: new Date(),
    },
    ...articleEntries,
  ];
}
