import type { CSSProperties } from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import {
  defaultReadThisLaunchProps,
  READ_THIS_LAUNCH_DURATION,
  READ_THIS_LAUNCH_FPS,
  ReadThisLaunchVideo,
  type ReadThisLaunchVideoProps,
} from "./ReadThisLaunchVideo";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

export const STILL_READING_LAUNCH_4K_WIDTH = 3840;
export const STILL_READING_LAUNCH_4K_HEIGHT = 2160;
export const STILL_READING_LAUNCH_4K_FPS = READ_THIS_LAUNCH_FPS;
export const STILL_READING_LAUNCH_4K_DURATION = READ_THIS_LAUNCH_DURATION;

export type StillReadingLaunchVideo4KProps = ReadThisLaunchVideoProps;

export const defaultStillReadingLaunchProps: StillReadingLaunchVideo4KProps = {
  ...defaultReadThisLaunchProps,
  productName: "stillReading",
  headline: "Read faster and retain more with guided focus.",
  subheadline:
    "Paste any long-form article into stillReading and jump into ORP playback with a redicle tuned for sustained concentration.",
  metrics: [
    { label: "Session speed", value: "300 wpm" },
    { label: "Focus mode", value: "ORP + redicle" },
    { label: "Avg. setup", value: "<30s" },
  ],
  tags: ["productivity", "learning", "research", "ai"],
  cards: [
    {
      rank: 1,
      tag: "research",
      title: "How Teams Build Better Thinking Through Deliberate Reading",
      readTime: "8m in reader mode",
      score: 314,
    },
    {
      rank: 2,
      tag: "productivity",
      title: "Focus Systems That Survive Notification Overload",
      readTime: "10m in reader mode",
      score: 276,
    },
    {
      rank: 3,
      tag: "learning",
      title: "Retention by Design: Turning Notes into Practical Memory",
      readTime: "11m in reader mode",
      score: 249,
    },
  ],
  cta: "Start your first focused reading session.",
  url: "stillreading.xyz",
};

export const StillReadingLaunchVideo4K: React.FC<
  StillReadingLaunchVideo4KProps
> = (props) => {
  const { width, height } = useVideoConfig();

  const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
  const frameWidth = BASE_WIDTH * scale;
  const frameHeight = BASE_HEIGHT * scale;
  const offsetX = (width - frameWidth) / 2;
  const offsetY = (height - frameHeight) / 2;

  return (
    <AbsoluteFill style={styles.canvas}>
      <div
        style={{
          ...styles.frame,
          left: offsetX,
          top: offsetY,
          transform: `scale(${scale})`,
        }}
      >
        <ReadThisLaunchVideo {...props} />
      </div>
    </AbsoluteFill>
  );
};

const styles: Record<string, CSSProperties> = {
  canvas: {
    backgroundColor: "#07070a",
  },
  frame: {
    position: "absolute",
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    transformOrigin: "top left",
    overflow: "hidden",
  },
};
