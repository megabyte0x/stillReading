"use client";

import { useState } from "react";
import Link from "next/link";
import { formatReadTime } from "@/lib/rsvp-engine";
import type { Article } from "@/lib/types";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
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
    <div className="article-card">
      <div className="article-vote">
        <button
          className={`vote-btn vote-up ${voted === "up" ? "voted" : ""}`}
          onClick={() => vote("up")}
          disabled={voted !== null}
          aria-label="Upvote"
        >
          ▲
        </button>
        <span className="vote-score">{score}</span>
        <button
          className={`vote-btn vote-down ${voted === "down" ? "voted" : ""}`}
          onClick={() => vote("down")}
          disabled={voted !== null}
          aria-label="Downvote"
        >
          ▼
        </button>
      </div>
      <div className="article-info">
        <h3 className="article-title">{article.title}</h3>
        <span className="article-readtime">{formatReadTime(article.word_count)} to stillread</span>
      </div>
      <Link href={`/readthis/${article.slug}`} className="article-play" aria-label="Read article">
        ▶
      </Link>
    </div>
  );
}
