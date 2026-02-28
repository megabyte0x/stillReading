import { loadFont as loadMonoFont } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSansFont } from "@remotion/google-fonts/DMSans";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily: sansFont } = loadSansFont("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});
const { fontFamily: monoFont } = loadMonoFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

const INTRO_FRAMES = 90;
const HERO_FRAMES = 108;
const DISCOVERY_FRAMES = 144;
const READER_PLAY_FRAMES = 114;
const CTA_FRAMES = 90;
const TRANSITION_FRAMES = 18;

export const READ_THIS_LAUNCH_FPS = 30;

const transitionTiming = linearTiming({ durationInFrames: TRANSITION_FRAMES });
const transitionOverlap = transitionTiming.getDurationInFrames({
  fps: READ_THIS_LAUNCH_FPS,
});

export const READ_THIS_LAUNCH_DURATION =
  INTRO_FRAMES +
  HERO_FRAMES +
  DISCOVERY_FRAMES +
  READER_PLAY_FRAMES +
  CTA_FRAMES -
  transitionOverlap * 4;

const PLAYBACK_WORDS = [
  "The",
  "Network",
  "Effects",
  "Playbook",
  "for",
  "Product",
  "Teams",
];

export type ReadThisLaunchMetric = {
  label: string;
  value: string;
};

export type ReadThisLaunchCard = {
  title: string;
  tag: string;
  rank: number;
  readTime: string;
  score: number;
};

export type ReadThisLaunchVideoProps = {
  productName: string;
  headline: string;
  subheadline: string;
  metrics: ReadThisLaunchMetric[];
  tags: string[];
  cards: ReadThisLaunchCard[];
  cta: string;
  url: string;
};

export const defaultReadThisLaunchProps: ReadThisLaunchVideoProps = {
  productName: "You Should Read This",
  headline: "Pick your next high-signal read in seconds.",
  subheadline:
    "Better contrast, faster scanning, and focused filters so you can spend less time searching and more time reading.",
  metrics: [
    { label: "Articles", value: "87" },
    { label: "Reading time", value: "~463m" },
    { label: "Library size", value: "87 items" },
  ],
  tags: ["ai", "startups", "design", "systems"],
  cards: [
    {
      rank: 1,
      tag: "systems",
      title: "The Network Effects Playbook for Product Teams",
      readTime: "12m to stillread",
      score: 291,
    },
    {
      rank: 2,
      tag: "design",
      title: "Interaction Design for Focused Interfaces",
      readTime: "9m to stillread",
      score: 248,
    },
    {
      rank: 3,
      tag: "ai",
      title: "Agents, Context Windows, and Real Product Velocity",
      readTime: "11m to stillread",
      score: 233,
    },
  ],
  cta: "Launch your next reading sprint.",
  url: "stillreading.xyz/readthis",
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const getPivotIndex = (word: string) => {
  if (word.length <= 1) return 0;
  return Math.max(0, Math.min(word.length - 1, Math.floor((word.length - 1) * 0.35)));
};

const toSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const ReadThisLaunchVideo: React.FC<ReadThisLaunchVideoProps> = (
  props
) => {
  const selectedCard = props.cards[0];
  const selectedSlug = selectedCard ? toSlug(selectedCard.title) : "featured-read";
  const selectedTitle = selectedCard ? selectedCard.title : "Featured Read";

  return (
    <AbsoluteFill style={styles.canvas}>
      <MovingBackdrop />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO_FRAMES}>
          <IntroScene productName={props.productName} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence durationInFrames={HERO_FRAMES}>
          <HeroScene
            headline={props.headline}
            subheadline={props.subheadline}
            metrics={props.metrics}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence durationInFrames={DISCOVERY_FRAMES}>
          <DiscoveryScene tags={props.tags} cards={props.cards} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence durationInFrames={READER_PLAY_FRAMES}>
          <ReaderPlayScene selectedTitle={selectedTitle} selectedSlug={selectedSlug} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={transitionTiming}
        />

        <TransitionSeries.Sequence durationInFrames={CTA_FRAMES}>
          <CtaScene cta={props.cta} url={props.url} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

const MovingBackdrop: React.FC = () => {
  const frame = useCurrentFrame();

  const driftX = interpolate(frame, [0, READ_THIS_LAUNCH_DURATION], [0, -120], {
    easing: Easing.inOut(Easing.sin),
  });
  const driftY = interpolate(frame, [0, READ_THIS_LAUNCH_DURATION], [0, -72], {
    easing: Easing.inOut(Easing.sin),
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(58rem 34rem at 12% 8%, rgba(239, 68, 68, 0.22), transparent 72%), radial-gradient(46rem 28rem at 90% 12%, rgba(56, 189, 248, 0.16), transparent 74%), #07070a",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.28,
          backgroundImage:
            "linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)",
          backgroundSize: "88px 88px",
          backgroundPosition: `${driftX}px ${driftY}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 40%), linear-gradient(180deg, rgba(7,7,10,0), rgba(7,7,10,0.52) 80%)",
        }}
      />
    </AbsoluteFill>
  );
};

const IntroScene: React.FC<{ productName: string }> = ({ productName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reveal = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 40,
  });

  const typedChars = Math.floor(
    interpolate(frame, [8, 8 + Math.round(1.5 * fps)], [0, productName.length], clamp)
  );
  const visibleTitle = productName.slice(0, typedChars);

  const subtitleOpacity = interpolate(frame, [36, 56], [0, 1], clamp);
  const badgeScale = interpolate(reveal, [0, 1], [0.9, 1]);
  const badgeOpacity = interpolate(reveal, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={styles.scene}>
      <AbsoluteFill style={styles.centeredStack}>
        <div
          style={{
            ...styles.launchBadge,
            transform: `scale(${badgeScale})`,
            opacity: badgeOpacity,
          }}
        >
          Feature Launch
        </div>
        <div style={styles.logoLine}>
          <span style={styles.logoIcon}>◉</span>
          <span style={styles.logoMain}>still</span>
          <span style={styles.logoSub}>Reading</span>
        </div>
        <h1 style={styles.introTitle}>{visibleTitle}</h1>
        <p style={{ ...styles.introSubtitle, opacity: subtitleOpacity }}>
          Curated reading queue for high-signal articles.
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const HeroScene: React.FC<{
  headline: string;
  subheadline: string;
  metrics: ReadThisLaunchMetric[];
}> = ({ headline, subheadline, metrics }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn = spring({
    frame: frame - 6,
    fps,
    config: { damping: 200 },
    durationInFrames: 42,
  });

  const titleChars = Math.floor(
    interpolate(frame, [12, 12 + Math.round(1.9 * fps)], [0, headline.length], clamp)
  );
  const visibleHeadline = headline.slice(0, titleChars);

  const subtitleOpacity = interpolate(frame, [34, 52], [0, 1], clamp);

  return (
    <AbsoluteFill style={styles.scene}>
      <AbsoluteFill style={styles.contentWrap}>
        <section
          style={{
            ...styles.heroPanel,
            transform: `translateY(${interpolate(panelIn, [0, 1], [22, 0])}px)`,
            opacity: panelIn,
          }}
        >
          <p style={styles.kicker}>Curated Reading Queue</p>
          <h2 style={styles.heroTitle}>{visibleHeadline}</h2>
          <p style={{ ...styles.heroSubtitle, opacity: subtitleOpacity }}>{subheadline}</p>

          <div style={styles.metricsGrid}>
            {metrics.map((metric, index) => {
              const cardIn = spring({
                frame: frame - (24 + index * 6),
                fps,
                config: { damping: 200 },
                durationInFrames: 28,
              });
              return (
                <MetricTile
                  key={`${metric.label}-${index}`}
                  label={metric.label}
                  value={metric.value}
                  progress={cardIn}
                />
              );
            })}
          </div>
        </section>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const DiscoveryScene: React.FC<{
  tags: string[];
  cards: ReadThisLaunchCard[];
}> = ({ tags, cards }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 34,
  });

  const searchQuery = "systems design";
  const typedChars = Math.floor(
    interpolate(frame, [12, 12 + Math.round(1.1 * fps)], [0, searchQuery.length], clamp)
  );

  const upvotePulse = interpolate(frame, [44, 48, 54], [0, 1, 0], clamp);
  const downvotePulse = interpolate(frame, [72, 76, 82], [0, 1, 0], clamp);
  const readPulse = interpolate(frame, [108, 112, 118], [0, 1, 0], clamp);

  const upvoteActive = frame >= 48;
  const downvoteActive = frame >= 76;
  const readActive = frame >= 112;

  const cursorX = interpolate(
    frame,
    [20, 44, 60, 76, 94, 112, 132],
    [420, 420, 420, 915, 915, 390, 390],
    clamp
  );
  const cursorY = interpolate(
    frame,
    [20, 44, 60, 76, 94, 112, 132],
    [278, 278, 278, 278, 278, 328, 328],
    clamp
  );
  const cursorPress = Math.max(upvotePulse, downvotePulse, readPulse);

  return (
    <AbsoluteFill style={styles.scene}>
      <AbsoluteFill style={styles.contentWrap}>
        <section
          style={{
            ...styles.discoveryPanel,
            transform: `translateY(${interpolate(panelIn, [0, 1], [20, 0])}px)`,
            opacity: panelIn,
          }}
        >
          <div style={styles.searchBar}>
            <span style={styles.searchIcon}>⌕</span>
            <span style={styles.searchText}>
              {searchQuery.slice(0, typedChars)}
              <span style={styles.cursor}>|</span>
            </span>
          </div>

          <div style={styles.tagsRow}>
            {tags.map((tag, index) => {
              const tagIn = spring({
                frame: frame - (24 + index * 4),
                fps,
                config: { damping: 200 },
                durationInFrames: 24,
              });
              return (
                <span
                  key={`${tag}-${index}`}
                  style={{
                    ...styles.tagPill,
                    opacity: tagIn,
                    transform: `translateY(${interpolate(tagIn, [0, 1], [10, 0])}px)`,
                    background:
                      index === 0
                        ? "linear-gradient(135deg, #ef4444, #f97316)"
                        : "rgba(22, 22, 28, 0.9)",
                    borderColor: index === 0 ? "#ef4444" : "rgba(148, 163, 184, 0.22)",
                    color: index === 0 ? "#fff" : "#a5adc3",
                  }}
                >
                  {tag}
                </span>
              );
            })}
          </div>

          <div style={styles.cardsRow}>
            {cards.slice(0, 3).map((card, index) => {
              const cardIn = spring({
                frame: frame - (34 + index * 7),
                fps,
                config: { damping: 200 },
                durationInFrames: 34,
              });
              return (
                <ArticlePreview
                  key={card.title}
                  card={card}
                  progress={cardIn}
                  scoreDelta={index === 0 && upvoteActive ? 1 : index === 1 && downvoteActive ? -1 : 0}
                  upvoteActive={index === 0 && upvoteActive}
                  downvoteActive={index === 1 && downvoteActive}
                  upvotePulse={index === 0 ? upvotePulse : 0}
                  downvotePulse={index === 1 ? downvotePulse : 0}
                  readPulse={index === 0 ? readPulse : 0}
                  selected={index === 0 && readActive}
                />
              );
            })}
          </div>

          <AnimatedCursor x={cursorX} y={cursorY} press={cursorPress} />

          <p style={styles.sceneCallout}>
            Upvote and downvote, then tap read now to jump straight into playback.
          </p>
        </section>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ReaderPlayScene: React.FC<{
  selectedTitle: string;
  selectedSlug: string;
}> = ({ selectedTitle, selectedSlug }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 34,
  });

  const redirectOpacity = interpolate(frame, [0, 6, 22, 28], [0, 1, 1, 0], clamp);
  const redirectY = interpolate(frame, [0, 8, 28], [12, 0, -8], clamp);

  const playStart = 24;
  const playEnd = READER_PLAY_FRAMES - 12;
  const wordIndex = Math.floor(
    interpolate(frame, [playStart, playEnd], [0, PLAYBACK_WORDS.length - 1], clamp)
  );
  const activeWord = PLAYBACK_WORDS[wordIndex] ?? PLAYBACK_WORDS[0];
  const pivotIndex = getPivotIndex(activeWord);
  const before = activeWord.slice(0, pivotIndex);
  const pivot = activeWord[pivotIndex] ?? "";
  const after = activeWord.slice(pivotIndex + 1);

  const progress = interpolate(frame, [playStart, playEnd], [0, 100], clamp);
  const focusGlow = 0.5 + Math.sin((frame / fps) * Math.PI * 3.2) * 0.14;

  return (
    <AbsoluteFill style={styles.scene}>
      <AbsoluteFill style={styles.contentWrap}>
        <section
          style={{
            ...styles.readerPanel,
            opacity: panelIn,
            transform: `translateY(${interpolate(panelIn, [0, 1], [20, 0])}px)`,
          }}
        >
          <div
            style={{
              ...styles.redirectBanner,
              opacity: redirectOpacity,
              transform: `translateY(${redirectY}px)`,
            }}
          >
            /readthis/{selectedSlug} → / (playback started)
          </div>

          <div style={styles.readerTop}>
            <div style={styles.readerLogo}>
              <span style={styles.logoIcon}>◉</span>
              <span style={styles.logoMain}>still</span>
              <span style={styles.logoSub}>Reading</span>
            </div>
            <div style={styles.readerNav}>
              <span style={styles.readerTabActive}>Read</span>
              <span style={styles.readerReadThisTab}>you should read this</span>
            </div>
          </div>

          <div style={styles.readerTitleCard}>
            <span style={styles.readerTitleKicker}>Now Reading</span>
            <span style={styles.readerTitleText}>{selectedTitle}</span>
          </div>

          <div
            style={{
              ...styles.readerRedicleShell,
              boxShadow: `0 0 0 1px rgba(239, 68, 68, 0.18), 0 24px 42px rgba(2, 6, 23, 0.52), 0 0 42px rgba(239, 68, 68, ${focusGlow})`,
            }}
          >
            <div style={styles.readerGuides}>
              <div style={styles.readerGuideMark} />
              <div style={styles.readerGuideMark} />
            </div>
            <div style={styles.readerWordLine}>
              <span style={styles.readerWordBefore}>{before}</span>
              <span style={styles.readerWordPivot}>{pivot}</span>
              <span style={styles.readerWordAfter}>{after}</span>
            </div>
          </div>

          <div style={styles.readerConsole}>
            <div style={styles.readerProgress}>
              <div
                style={{
                  ...styles.readerProgressFill,
                  width: `${progress}%`,
                }}
              />
            </div>
            <div style={styles.readerControls}>
              <span style={styles.readerStats}>
                {Math.round(progress)}% · 300 wpm
              </span>
              <span style={styles.readerControlPill}>⟲</span>
              <span style={styles.readerPlayButton}>❚❚</span>
              <span style={styles.readerControlPill}>voice</span>
            </div>
          </div>
        </section>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CtaScene: React.FC<{ cta: string; url: string }> = ({ cta, url }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 42,
  });

  const urlChars = Math.floor(
    interpolate(frame, [20, 20 + Math.round(1.1 * fps)], [0, url.length], clamp)
  );

  const pulse =
    1 +
    Math.sin((frame / fps) * Math.PI * 2) * 0.025 * interpolate(frame, [18, 34], [0, 1], clamp);

  return (
    <AbsoluteFill style={styles.scene}>
      <AbsoluteFill style={styles.centeredStack}>
        <section
          style={{
            ...styles.ctaPanel,
            opacity: panelIn,
            transform: `translateY(${interpolate(panelIn, [0, 1], [22, 0])}px)`,
          }}
        >
          <p style={styles.kicker}>Now Live</p>
          <h2 style={styles.ctaTitle}>{cta}</h2>
          <p style={styles.ctaBody}>
            Curate the best reads, vote the queue up or down, and jump straight into a live reader session.
          </p>
          <button style={{ ...styles.ctaButton, transform: `scale(${pulse})` }}>
            Open You Should Read This
          </button>
          <p style={styles.ctaUrl}>{url.slice(0, urlChars)}</p>
        </section>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const MetricTile: React.FC<{
  label: string;
  value: string;
  progress: number;
}> = ({ label, value, progress }) => {
  return (
    <div
      style={{
        ...styles.metricTile,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [14, 0])}px)`,
      }}
    >
      <span style={styles.metricLabel}>{label}</span>
      <span style={styles.metricValue}>{value}</span>
    </div>
  );
};

const ArticlePreview: React.FC<{
  card: ReadThisLaunchCard;
  progress: number;
  scoreDelta: number;
  upvoteActive: boolean;
  downvoteActive: boolean;
  upvotePulse: number;
  downvotePulse: number;
  readPulse: number;
  selected: boolean;
}> = ({
  card,
  progress,
  scoreDelta,
  upvoteActive,
  downvoteActive,
  upvotePulse,
  downvotePulse,
  readPulse,
  selected,
}) => {
  return (
    <article
      style={{
        ...styles.articleCard,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [12, 0])}px)`,
        borderColor: selected ? "rgba(239, 68, 68, 0.52)" : "rgba(148, 163, 184, 0.2)",
        boxShadow: selected
          ? "0 18px 30px rgba(2,6,23,0.42), 0 0 0 1px rgba(239, 68, 68, 0.24)"
          : "none",
      }}
    >
      <div style={styles.cardAccent} />
      <div style={styles.cardBody}>
        <div style={styles.cardMetaRow}>
          <span style={styles.cardTag}>{card.tag}</span>
          <span style={styles.cardRank}>#{card.rank}</span>
        </div>
        <h3 style={styles.cardTitle}>{card.title}</h3>
        <p style={styles.cardMeta}>{card.readTime}</p>
        <div style={styles.cardFooter}>
          <div style={styles.voteGroup}>
            <span
              style={{
                ...styles.voteBtn,
                color: upvoteActive ? "#22c55e" : "#a5adc3",
                background: upvoteActive ? "rgba(34, 197, 94, 0.16)" : "transparent",
                transform: `scale(${1 - upvotePulse * 0.13})`,
              }}
            >
              ▲
            </span>
            <span style={styles.voteScore}>{card.score + scoreDelta}</span>
            <span
              style={{
                ...styles.voteBtn,
                color: downvoteActive ? "#ef4444" : "#a5adc3",
                background: downvoteActive ? "rgba(239, 68, 68, 0.16)" : "transparent",
                transform: `scale(${1 - downvotePulse * 0.13})`,
              }}
            >
              ▼
            </span>
          </div>
          <span
            style={{
              ...styles.readLabel,
              opacity: selected ? 1 : 0.84,
              background: selected ? "rgba(239, 68, 68, 0.24)" : "rgba(239, 68, 68, 0.12)",
              transform: `scale(${1 - readPulse * 0.1})`,
            }}
          >
            read now →
          </span>
        </div>
      </div>
    </article>
  );
};

const AnimatedCursor: React.FC<{
  x: number;
  y: number;
  press: number;
}> = ({ x, y, press }) => {
  return (
    <div
      style={{
        ...styles.cursorPointer,
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${1 - press * 0.14})`,
      }}
    >
      <div style={styles.cursorInner} />
    </div>
  );
};

const styles: Record<string, CSSProperties> = {
  canvas: {
    fontFamily: `${sansFont}, sans-serif`,
    color: "#f8f8fd",
  },
  scene: {
    padding: "74px 92px",
  },
  contentWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  centeredStack: {
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    textAlign: "center",
  },
  launchBadge: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 20,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    border: "1px solid rgba(239, 68, 68, 0.45)",
    background: "rgba(239, 68, 68, 0.12)",
    color: "#fecaca",
    borderRadius: 999,
    padding: "10px 18px",
  },
  logoLine: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: `${monoFont}, monospace`,
  },
  logoIcon: {
    fontSize: 20,
    color: "#ef4444",
  },
  logoMain: {
    fontSize: 34,
    fontWeight: 700,
    color: "#fafafa",
    letterSpacing: "-0.03em",
  },
  logoSub: {
    fontSize: 32,
    color: "#a1a1aa",
    letterSpacing: "-0.01em",
  },
  introTitle: {
    margin: 0,
    fontSize: 82,
    letterSpacing: "-0.03em",
    lineHeight: 1.04,
    maxWidth: 1200,
  },
  introSubtitle: {
    margin: 0,
    fontSize: 30,
    color: "#d4d4d8",
    maxWidth: 980,
    lineHeight: 1.4,
  },
  heroPanel: {
    width: "100%",
    maxWidth: 1380,
    borderRadius: 32,
    border: "1px solid rgba(148, 163, 184, 0.24)",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.07), transparent 54%), linear-gradient(180deg, rgba(148,163,184,0.06), transparent 62%), rgba(18,18,24,0.86)",
    boxShadow: "0 32px 60px rgba(2, 6, 23, 0.42)",
    backdropFilter: "blur(12px)",
    padding: "44px 48px 40px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  kicker: {
    margin: 0,
    fontFamily: `${monoFont}, monospace`,
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#fca5a5",
  },
  heroTitle: {
    margin: 0,
    fontSize: 68,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    maxWidth: "23ch",
  },
  heroSubtitle: {
    margin: 0,
    fontSize: 27,
    color: "#dbe0ef",
    lineHeight: 1.5,
    maxWidth: "66ch",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
    marginTop: 8,
  },
  metricTile: {
    borderRadius: 16,
    border: "1px solid rgba(148, 163, 184, 0.2)",
    background: "rgba(9, 9, 14, 0.52)",
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  metricLabel: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#a5adc3",
  },
  metricValue: {
    fontSize: 34,
    lineHeight: 1.1,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#f8f8fd",
  },
  discoveryPanel: {
    width: "100%",
    maxWidth: 1500,
    borderRadius: 30,
    border: "1px solid rgba(148, 163, 184, 0.24)",
    background:
      "linear-gradient(165deg, rgba(255,255,255,0.05), transparent 52%), rgba(15, 15, 20, 0.86)",
    boxShadow: "0 30px 58px rgba(2, 6, 23, 0.44)",
    padding: "30px 30px 34px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    position: "relative",
  },
  searchBar: {
    height: 70,
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.24)",
    background: "rgba(21, 21, 30, 0.95)",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 18px",
  },
  searchIcon: {
    color: "#a5adc3",
    fontSize: 24,
  },
  searchText: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 24,
    letterSpacing: "0.01em",
    color: "#e2e8f0",
  },
  cursor: {
    color: "#ef4444",
    marginLeft: 2,
  },
  tagsRow: {
    display: "flex",
    gap: 10,
  },
  tagPill: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 16,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    borderRadius: 999,
    border: "1px solid",
    padding: "8px 14px",
  },
  cardsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  articleCard: {
    display: "flex",
    minHeight: 238,
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    background:
      "linear-gradient(165deg, rgba(255, 255, 255, 0.05), transparent 52%), rgba(21, 21, 32, 0.96)",
  },
  cardAccent: {
    width: 5,
    background: "linear-gradient(180deg, #ef4444 0%, #fb7185 52%, #f97316 100%)",
  },
  cardBody: {
    padding: "16px 16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flex: 1,
  },
  cardMetaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTag: {
    fontFamily: `${monoFont}, monospace`,
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: "0.05em",
    padding: "4px 7px",
    borderRadius: 8,
    border: "1px solid rgba(148,163,184,0.2)",
    color: "#a5adc3",
    background: "rgba(2, 6, 23, 0.42)",
  },
  cardRank: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    letterSpacing: "0.06em",
    borderRadius: 999,
    border: "1px solid rgba(239, 68, 68, 0.35)",
    background: "rgba(239, 68, 68, 0.12)",
    color: "#fecaca",
    padding: "4px 8px",
  },
  cardTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.25,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    color: "#f5f7ff",
  },
  cardMeta: {
    margin: 0,
    fontFamily: `${monoFont}, monospace`,
    fontSize: 14,
    color: "#a5adc3",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    borderTop: "1px solid rgba(148,163,184,0.18)",
    paddingTop: 10,
  },
  voteGroup: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  voteBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    border: "1px solid rgba(148,163,184,0.16)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    fontWeight: 700,
  },
  voteScore: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 13,
    color: "#dbe0ef",
    minWidth: 26,
    textAlign: "center",
  },
  readLabel: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#fecaca",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(239, 68, 68, 0.3)",
    background: "rgba(239, 68, 68, 0.12)",
  },
  sceneCallout: {
    margin: "2px 0 0",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 14,
    color: "#fecaca",
    letterSpacing: "0.02em",
  },
  cursorPointer: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "2px solid rgba(248,250,252,0.95)",
    background: "rgba(15, 23, 42, 0.55)",
    boxShadow: "0 8px 18px rgba(2,6,23,0.45)",
    zIndex: 20,
  },
  cursorInner: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#f8fafc",
    margin: "9px auto 0",
  },
  readerPanel: {
    width: "100%",
    maxWidth: 1420,
    borderRadius: 28,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    background:
      "linear-gradient(165deg, rgba(255, 255, 255, 0.04), transparent 56%), rgba(13, 13, 20, 0.9)",
    boxShadow: "0 30px 60px rgba(2, 6, 23, 0.48)",
    padding: "28px 30px 30px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    position: "relative",
  },
  redirectBanner: {
    position: "absolute",
    top: -16,
    left: "50%",
    transform: "translateX(-50%)",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 13,
    letterSpacing: "0.03em",
    borderRadius: 999,
    border: "1px solid rgba(56, 189, 248, 0.42)",
    background: "rgba(56, 189, 248, 0.14)",
    color: "#bae6fd",
    padding: "8px 14px",
  },
  readerTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  readerLogo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: `${monoFont}, monospace`,
  },
  readerNav: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  readerTabActive: {
    fontFamily: `${sansFont}, sans-serif`,
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 8,
    background: "rgba(39,39,42,0.9)",
    border: "1px solid rgba(148,163,184,0.2)",
    color: "#f8fafc",
    padding: "7px 12px",
  },
  readerReadThisTab: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    letterSpacing: "0.02em",
    borderRadius: 8,
    border: "1px solid rgba(239, 68, 68, 0.3)",
    background: "rgba(239, 68, 68, 0.12)",
    color: "#fecaca",
    padding: "7px 12px",
  },
  readerTitleCard: {
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.2)",
    background:
      "linear-gradient(140deg, rgba(255,255,255,0.05), transparent 54%), rgba(15, 15, 24, 0.85)",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  readerTitleKicker: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#fca5a5",
  },
  readerTitleText: {
    fontSize: 20,
    color: "#f8fafc",
    lineHeight: 1.3,
    fontWeight: 600,
  },
  readerRedicleShell: {
    borderRadius: 20,
    border: "1px solid rgba(148, 163, 184, 0.24)",
    background: "rgba(10, 10, 16, 0.92)",
    minHeight: 290,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  readerGuides: {
    display: "flex",
    flexDirection: "column",
    gap: 66,
    position: "absolute",
    width: 1,
    height: 190,
  },
  readerGuideMark: {
    width: 1,
    height: 56,
    background: "rgba(239, 68, 68, 0.45)",
  },
  readerWordLine: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 96,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: "-0.03em",
  },
  readerWordBefore: {
    width: 300,
    textAlign: "right",
    color: "#e2e8f0",
  },
  readerWordPivot: {
    color: "#ef4444",
  },
  readerWordAfter: {
    width: 300,
    textAlign: "left",
    color: "#e2e8f0",
  },
  readerConsole: {
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.2)",
    background: "rgba(8, 8, 13, 0.86)",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  readerProgress: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    background: "rgba(148, 163, 184, 0.2)",
    overflow: "hidden",
  },
  readerProgressFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, #ef4444, #f97316)",
  },
  readerControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  readerStats: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 13,
    color: "#a5adc3",
    letterSpacing: "0.02em",
  },
  readerControlPill: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 13,
    color: "#dbe0ef",
    borderRadius: 8,
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(39,39,42,0.7)",
    padding: "6px 12px",
  },
  readerPlayButton: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 16,
    color: "#fff",
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,0.36)",
    background: "linear-gradient(135deg, #ef4444, #f97316)",
    padding: "7px 14px",
    minWidth: 60,
    textAlign: "center",
  },
  ctaPanel: {
    width: "100%",
    maxWidth: 1260,
    borderRadius: 32,
    border: "1px solid rgba(148, 163, 184, 0.24)",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.07), transparent 54%), rgba(17, 17, 24, 0.9)",
    boxShadow: "0 32px 60px rgba(2, 6, 23, 0.44)",
    padding: "46px 56px",
    textAlign: "center",
  },
  ctaTitle: {
    margin: "8px 0 0",
    fontSize: 72,
    lineHeight: 1.04,
    letterSpacing: "-0.03em",
  },
  ctaBody: {
    margin: "14px auto 0",
    maxWidth: 940,
    fontSize: 27,
    lineHeight: 1.45,
    color: "#dbe0ef",
  },
  ctaButton: {
    marginTop: 24,
    border: "1px solid rgba(239, 68, 68, 0.36)",
    borderRadius: 999,
    background: "linear-gradient(135deg, #ef4444, #f97316)",
    color: "#fff",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    padding: "16px 34px",
  },
  ctaUrl: {
    margin: "16px 0 0",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 24,
    color: "#fecaca",
    letterSpacing: "0.03em",
  },
};
