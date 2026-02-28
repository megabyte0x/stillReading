"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
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

  const totalMinutes = useMemo(
    () => estimateReadingMinutes(articles.reduce((sum, article) => sum + article.word_count, 0)),
    [articles]
  );

  const filteredMinutes = useMemo(
    () => estimateReadingMinutes(filtered.reduce((sum, article) => sum + article.word_count, 0)),
    [filtered]
  );

  return (
    <div className="readthis-container">
      {/* Header */}
      <header id="header">
        <Link href="/" className="logo" style={{ textDecoration: "none" }}>
          <span className="logo-icon">◉</span>
          <span className="logo-text">still</span>
          <span className="logo-sub">Reading</span>
        </Link>
        <nav className="nav-tabs">
          <Link href="/" className="tab">Read</Link>
          <span className="tab active">you should read this</span>
        </nav>
      </header>

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
              <span className="readthis-metric-value">{filtered.length}</span>
            </div>
            <div className="readthis-metric">
              <span className="readthis-metric-label">Reading time</span>
              <span className="readthis-metric-value">~{filteredMinutes}m</span>
            </div>
            <div className="readthis-metric">
              <span className="readthis-metric-label">Library size</span>
              <span className="readthis-metric-value">{articles.length} items</span>
            </div>
          </div>
          {filtered.length !== articles.length && (
            <p className="readthis-results">
              Showing {filtered.length} of {articles.length} articles ({filteredMinutes}m of ~{totalMinutes}m)
            </p>
          )}
        </section>

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
      </div>

      {/* Footer */}
      <footer className="site-footer">
        <a href="https://github.com/megabyte0x/stillReading" target="_blank" rel="noopener noreferrer" title="GitHub">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.694.825.576C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" /></svg>
        </a>
      </footer>
    </div>
  );
}
