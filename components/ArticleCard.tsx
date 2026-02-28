"use client";

import { useState } from "react";
import Link from "next/link";
import { formatReadTime } from "@/lib/rsvp-engine";
import type { Article } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
  rank: number;
}

export default function ArticleCard({ article, rank }: ArticleCardProps) {
  const [score, setScore] = useState(article.score);
  const [voted, setVoted] = useState<"up" | "down" | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`voted_${article.id}`) as "up" | "down" | null;
  });

  async function vote(direction: "up" | "down") {
    if (voted) return; // already voted
    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: article.id, direction }),
    });
    if (res.ok) {
      setScore((prev) => prev + (direction === "up" ? 1 : -1));
      setVoted(direction);
      localStorage.setItem(`voted_${article.id}`, direction);
    }
  }

  return (
    <Link href={`/readthis/${article.slug}`} className="article-card" style={{ textDecoration: "none" }}>
      <div className="article-card-accent" />
      <div className="article-card-inner">
        <div className="article-card-body">
          <div className="article-meta-row">
            {article.tags.length > 0 && (
              <div className="article-tags">
                {article.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="article-tag">{tag}</span>
                ))}
              </div>
            )}
            <span className="article-rank" aria-label={`Rank ${rank}`}>
              #{rank}
            </span>
          </div>

          <h3 className="article-title">{article.title}</h3>
          <div className="article-meta-line">
            <span className="article-readtime">{formatReadTime(article.word_count)} to stillread</span>
            <span className="article-dot" aria-hidden="true">|</span>
            <span className="article-score-label">score {score}</span>
          </div>
        </div>
        <div className="article-card-footer">
          <div className="article-vote" onClick={(e) => e.preventDefault()}>
            <button
              type="button"
              className={`vote-btn vote-up ${voted === "up" ? "voted" : ""}`}
              onClick={(e) => { e.preventDefault(); vote("up"); }}
              disabled={voted !== null}
              aria-label="Upvote"
            >
              ▲
            </button>
            <span className="vote-score">{score}</span>
            <button
              type="button"
              className={`vote-btn vote-down ${voted === "down" ? "voted" : ""}`}
              onClick={(e) => { e.preventDefault(); vote("down"); }}
              disabled={voted !== null}
              aria-label="Downvote"
            >
              ▼
            </button>
          </div>
          <span className="article-play-label" aria-label="Read article">
            read now →
          </span>
        </div>
      </div>
    </Link>
  );
}
