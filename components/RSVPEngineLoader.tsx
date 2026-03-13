"use client";

import dynamic from "next/dynamic";

const RSVPEngine = dynamic(() => import("@/components/RSVPEngine"), {
  ssr: false,
});

interface RSVPEngineLoaderProps {
  initialMarkdown?: string;
  contentTitle?: string;
  onComplete?: () => void;
  showEditor?: boolean;
  showOnboarding?: boolean;
}

export default function RSVPEngineLoader(props: RSVPEngineLoaderProps) {
  return <RSVPEngine {...props} />;
}
