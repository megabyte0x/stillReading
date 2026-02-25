"use client";

import { useState } from "react";
import RSVPReader from "@/components/RSVPReader";
import VoteModal from "@/components/VoteModal";
import type { Article } from "@/lib/types";

interface ArticleReaderProps {
  article: Article;
}

export default function ArticleReader({ article }: ArticleReaderProps) {
  const [showVoteModal, setShowVoteModal] = useState(false);

  return (
    <>
      <RSVPReader
        initialMarkdown={article.markdown_body}
        contentTitle={article.title}
        showEditor={false}
        showOnboarding={false}
        onComplete={() => setShowVoteModal(true)}
      />
      {showVoteModal && <VoteModal articleId={article.id} />}
    </>
  );
}
