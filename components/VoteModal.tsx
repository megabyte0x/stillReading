"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VoteModalProps {
  articleId: string;
}

export default function VoteModal({ articleId }: VoteModalProps) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  async function handleVote(direction: "up" | "down") {
    if (submitted) return;
    setSubmitted(true);
    const existing = localStorage.getItem(`voted_${articleId}`);
    if (!existing) {
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, direction }),
      });
      localStorage.setItem(`voted_${articleId}`, direction);
    }
    router.push("/readthis");
  }

  function handleSkip() {
    router.push("/readthis");
  }

  return (
    <div className="vote-modal-overlay">
      <div className="vote-modal">
        <h2 className="vote-modal-title">Did you enjoy this?</h2>
        <div className="vote-modal-buttons">
          <button className="vote-modal-btn" onClick={() => handleVote("up")} disabled={submitted}>
            👍
          </button>
          <button className="vote-modal-btn" onClick={() => handleVote("down")} disabled={submitted}>
            👎
          </button>
        </div>
        <button className="vote-modal-skip" onClick={handleSkip}>Skip</button>
      </div>
    </div>
  );
}
