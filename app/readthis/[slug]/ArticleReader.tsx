"use client";

import { useState } from "react";
import RSVPEngineLoader from "@/components/RSVPEngineLoader";
import VoteModal from "@/components/VoteModal";
import type { Article } from "@/lib/types";

interface ArticleReaderProps {
  article: Article;
  markdown: string;
}

export default function ArticleReader({ article, markdown }: ArticleReaderProps) {
  const [showVoteModal, setShowVoteModal] = useState(false);

  return (
    <>
      <RSVPEngineLoader
        initialMarkdown={markdown}
        contentTitle={article.title}
        showEditor={false}
        showOnboarding={false}
        onComplete={() => setShowVoteModal(true)}
      />
      {showVoteModal && <VoteModal articleId={article.id} />}
    </>
  );
}
