"use client";

import { useState, useCallback, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import TagFilter from "@/components/TagFilter";
import ArticleCard from "@/components/ArticleCard";
import type { Article } from "@/lib/types";

interface ReadThisClientProps {
  articles: Article[];
  allTags: string[];
}

function estimateReadingMinutes(totalWords: number) {
  if (totalWords <= 0) return 0;
  return Math.max(1, Math.round(totalWords / 230));
}

export default function ReadThisClient({ articles, allTags }: ReadThisClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  const handleToggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleClearTags = useCallback(() => {
    setActiveTags([]);
  }, []);

  const filtered = useMemo(
    () =>
      articles.filter((a) => {
        const matchesSearch = searchQuery === "" || a.title.toLowerCase().includes(searchQuery);
        const matchesTags = activeTags.length === 0 || activeTags.every((t) => a.tags.includes(t));
        return matchesSearch && matchesTags;
      }),
    [articles, searchQuery, activeTags]
  );

  const filteredMinutes = useMemo(
    () => estimateReadingMinutes(filtered.reduce((sum, article) => sum + article.word_count, 0)),
    [filtered]
  );

  return (
    <>
      {filtered.length !== articles.length && (
        <p className="readthis-results">
          Showing {filtered.length} of {articles.length} articles (~{filteredMinutes}m of reading)
        </p>
      )}
      <section className="readthis-controls" aria-label="Article filters">
        <SearchBar onSearch={handleSearch} />
        <TagFilter tags={allTags} activeTags={activeTags} onToggle={handleToggleTag} onClear={handleClearTags} />
      </section>
      {filtered.length > 0 ? (
        <div className="article-grid">
          {filtered.map((article, index) => (
            <ArticleCard key={article.id} article={article} rank={index + 1} />
          ))}
        </div>
      ) : (
        <p className="readthis-empty">No articles match your filters.</p>
      )}
    </>
  );
}
