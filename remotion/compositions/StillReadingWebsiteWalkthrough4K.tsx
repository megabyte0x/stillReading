import { loadFont as loadMonoFont } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSansFont } from "@remotion/google-fonts/DMSans";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import type { CSSProperties, ReactNode } from "react";
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

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

const INTRO_FRAMES = 84;
const HOME_ONBOARDING_FRAMES = 162;
const HOME_READER_FRAMES = 162;
const READTHIS_DISCOVERY_FRAMES = 192;
const ARTICLE_READER_FRAMES = 168;
const CTA_FRAMES = 108;
const TRANSITION_FRAMES = 16;

export const STILL_READING_WALKTHROUGH_4K_FPS = 30;
export const STILL_READING_WALKTHROUGH_4K_WIDTH = 3840;
export const STILL_READING_WALKTHROUGH_4K_HEIGHT = 2160;

const transitionTiming = linearTiming({ durationInFrames: TRANSITION_FRAMES });
const transitionOverlap = transitionTiming.getDurationInFrames({
  fps: STILL_READING_WALKTHROUGH_4K_FPS,
});

export const STILL_READING_WALKTHROUGH_4K_DURATION =
  INTRO_FRAMES +
  HOME_ONBOARDING_FRAMES +
  HOME_READER_FRAMES +
  READTHIS_DISCOVERY_FRAMES +
  ARTICLE_READER_FRAMES +
  CTA_FRAMES -
  transitionOverlap * 5;

const READER_WORDS = [
  "Build",
  "focus",
  "with",
  "intentional",
  "reading",
  "sessions",
];

const ARTICLE_WORDS = [
  "Network",
  "effects",
  "compound",
  "when",
  "teams",
  "share",
  "insights",
];

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const getPivotIndex = (word: string) => {
  if (word.length <= 1) return 0;
  return Math.max(0, Math.min(word.length - 1, Math.floor((word.length - 1) * 0.35)));
};

export type StillReadingWebsiteWalkthrough4KProps = {
  productName: string;
  cta: string;
  url: string;
  featuredTitle: string;
};

export const defaultStillReadingWebsiteWalkthroughProps: StillReadingWebsiteWalkthrough4KProps =
  {
    productName: "stillReading",
    cta: "Read faster and stay focused.",
    url: "stillreading.xyz",
    featuredTitle: "The Network Effects Playbook for Product Teams",
  };

export const StillReadingWebsiteWalkthrough4K: React.FC<
  StillReadingWebsiteWalkthrough4KProps
> = (props) => {
  const { width, height } = useVideoConfig();

  const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
  const stageWidth = BASE_WIDTH * scale;
  const stageHeight = BASE_HEIGHT * scale;
  const offsetX = (width - stageWidth) / 2;
  const offsetY = (height - stageHeight) / 2;

  return (
    <AbsoluteFill style={styles.canvas}>
      <AmbientBackdrop />
      <div
        style={{
          ...styles.stage,
          left: offsetX,
          top: offsetY,
          transform: `scale(${scale})`,
        }}
      >
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={INTRO_FRAMES}>
            <IntroScene productName={props.productName} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

          <TransitionSeries.Sequence durationInFrames={HOME_ONBOARDING_FRAMES}>
            <HomeOnboardingScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={slide({ direction: "from-right" })}
            timing={transitionTiming}
          />

          <TransitionSeries.Sequence durationInFrames={HOME_READER_FRAMES}>
            <HomeReaderScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={slide({ direction: "from-right" })}
            timing={transitionTiming}
          />

          <TransitionSeries.Sequence durationInFrames={READTHIS_DISCOVERY_FRAMES}>
            <ReadThisDiscoveryScene />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={slide({ direction: "from-right" })}
            timing={transitionTiming}
          />

          <TransitionSeries.Sequence durationInFrames={ARTICLE_READER_FRAMES}>
            <ArticleReaderScene featuredTitle={props.featuredTitle} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

          <TransitionSeries.Sequence durationInFrames={CTA_FRAMES}>
            <CtaScene cta={props.cta} url={props.url} />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </div>
    </AbsoluteFill>
  );
};

const AmbientBackdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const driftX = interpolate(
    frame,
    [0, STILL_READING_WALKTHROUGH_4K_DURATION],
    [0, -108],
    { easing: Easing.inOut(Easing.sin) }
  );
  const driftY = interpolate(
    frame,
    [0, STILL_READING_WALKTHROUGH_4K_DURATION],
    [0, -72],
    { easing: Easing.inOut(Easing.sin) }
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(56rem 34rem at 8% 8%, rgba(239, 68, 68, 0.2), transparent 72%), radial-gradient(50rem 30rem at 92% 14%, rgba(56, 189, 248, 0.16), transparent 76%), #07070a",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.24,
          backgroundImage:
            "linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)",
          backgroundSize: "84px 84px",
          backgroundPosition: `${driftX}px ${driftY}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 42%), linear-gradient(180deg, rgba(7,7,10,0), rgba(7,7,10,0.55) 84%)",
        }}
      />
    </AbsoluteFill>
  );
};

const IntroScene: React.FC<{
  productName: string;
}> = ({ productName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const reveal = spring({
    frame,
    fps,
    durationInFrames: 44,
    config: { damping: 200 },
  });

  const typedChars = Math.floor(
    interpolate(frame, [8, 8 + Math.round(1.6 * fps)], [0, productName.length], clamp)
  );
  const visible = productName.slice(0, typedChars);
  return (
    <AbsoluteFill style={styles.scene}>
      <AbsoluteFill style={styles.centerStack}>
        <div style={styles.logoLine}>
          <span style={styles.logoIcon}>◉</span>
          <span style={styles.logoMain}>still</span>
          <span style={styles.logoSub}>Reading</span>
        </div>

        <h1 style={styles.introTitle}>{visible}</h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const HomeOnboardingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn = spring({
    frame,
    fps,
    durationInFrames: 36,
    config: { damping: 200 },
  });
  const humanActive = frame < 64;
  const agentActive = !humanActive;

  const url = "https://example.com/newsletter.md";
  const typedChars = Math.floor(
    interpolate(frame, [36, 36 + Math.round(1.25 * fps)], [0, url.length], clamp)
  );
  const clickPulse = interpolate(frame, [106, 112, 118], [0, 1, 0], clamp);

  return (
    <AbsoluteFill style={styles.scene}>
      <AbsoluteFill style={styles.contentWrap}>
        <BrowserShell frame={frame} route="/" pageLabel="Home · Reader">
          <SiteHeader
            tabs={[
              { label: "Read", active: true },
              { label: "Edit", active: false },
              { label: "you should read this 👇🏻", accent: true },
            ]}
          />

          <section
            style={{
              ...styles.panel,
              opacity: panelIn,
              transform: `translateY(${interpolate(panelIn, [0, 1], [16, 0])}px)`,
            }}
          >
            <div style={styles.onboardingIntro}>
              <p style={styles.kicker}>Focus Mode Reader</p>
              <h2 style={styles.panelHeading}>
                Enter a markdown link and start reading without noise.
              </h2>
            </div>

            <div style={styles.onboardingTabs}>
              <span
                style={{
                  ...styles.onboardingTab,
                  ...(humanActive ? styles.onboardingTabActive : {}),
                }}
              >
                Human
              </span>
              <span
                style={{
                  ...styles.onboardingTab,
                  ...(agentActive ? styles.onboardingTabActive : {}),
                }}
              >
                Agent
              </span>
            </div>

            {humanActive ? (
              <div style={styles.onboardingHuman}>
                <p style={styles.panelBody}>
                  Paste a public raw markdown URL to begin instantly.
                </p>
                <div style={styles.urlRow}>
                  <span style={styles.urlInput}>{url.slice(0, typedChars)}</span>
                  <span
                    style={{
                      ...styles.readButton,
                      transform: `scale(${1 - clickPulse * 0.1})`,
                    }}
                  >
                    read
                  </span>
                </div>
              </div>
            ) : (
              <div style={styles.onboardingAgent}>
                <p style={styles.panelBody}>
                  Ship links from your agent with one install command.
                </p>
                <div style={styles.codeLine}>
                  <span>npx skills add megabyte0x/stillReading --skill still-reading -g</span>
                  <span style={styles.copyPill}>Copy</span>
                </div>
                <div style={styles.codeLine}>
                  <span>curl -fsSL https://stillreading.xyz/install.sh | bash</span>
                  <span style={styles.copyPill}>Copy</span>
                </div>
              </div>
            )}
          </section>
        </BrowserShell>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const HomeReaderScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn = spring({
    frame,
    fps,
    durationInFrames: 34,
    config: { damping: 200 },
  });

  const playStart = 18;
  const playEnd = 104;
  const progress = interpolate(frame, [playStart, playEnd], [0, 100], clamp);
  const wordIndex = Math.floor(
    interpolate(frame, [playStart, playEnd], [0, READER_WORDS.length - 1], clamp)
  );
  const activeWord = READER_WORDS[wordIndex] ?? READER_WORDS[0];
  const pivotIndex = getPivotIndex(activeWord);
  const before = activeWord.slice(0, pivotIndex);
  const pivot = activeWord[pivotIndex] ?? "";
  const after = activeWord.slice(pivotIndex + 1);

  const speedPulse = interpolate(frame, [66, 72, 80], [0, 1, 0], clamp);
  const voiceActive = frame >= 92;
  const editMode = frame >= 112;
  const readerOpacity = interpolate(frame, [106, 120], [1, 0], clamp);
  const editorOpacity = interpolate(frame, [112, 126], [0, 1], clamp);

  return (
    <AbsoluteFill style={styles.scene}>
      <AbsoluteFill style={styles.contentWrap}>
        <BrowserShell frame={frame} route="/" pageLabel="Home · Reader">
          <SiteHeader
            tabs={[
              { label: "Read", active: !editMode },
              { label: "Edit", active: editMode },
              { label: "you should read this 👇🏻", accent: true },
            ]}
          />

          <section
            style={{
              ...styles.panel,
              opacity: panelIn,
              transform: `translateY(${interpolate(panelIn, [0, 1], [16, 0])}px)`,
              gap: 14,
            }}
          >
            <div style={{ ...styles.readerCard, opacity: readerOpacity }}>
              <div style={styles.readerTitleCard}>
                <span style={styles.readerTitleKicker}>Now Reading</span>
                <span style={styles.readerTitleText}>How Teams Learn Faster from Long-form Writing</span>
              </div>
              <div style={styles.readerRedicle}>
                <div style={styles.readerGuideMarkTop} />
                <div style={styles.readerGuideMarkBottom} />
                <div style={styles.readerWordLine}>
                  <span style={styles.readerWordBefore}>{before}</span>
                  <span style={styles.readerWordPivot}>{pivot}</span>
                  <span style={styles.readerWordAfter}>{after}</span>
                </div>
              </div>
              <div style={styles.readerConsole}>
                <div style={styles.readerProgressTrack}>
                  <div style={{ ...styles.readerProgressFill, width: `${progress}%` }} />
                </div>
                <div style={styles.readerControls}>
                  <span style={styles.readerStatText}>
                    {Math.round(progress)}% · {frame >= 72 ? 350 : 300} wpm
                  </span>
                  <span
                    style={{
                      ...styles.controlPill,
                      transform: `scale(${1 - speedPulse * 0.08})`,
                    }}
                  >
                    speed +
                  </span>
                  <span style={styles.playPill}>❚❚</span>
                  <span
                    style={{
                      ...styles.controlPill,
                      borderColor: voiceActive
                        ? "rgba(239,68,68,0.6)"
                        : "rgba(148,163,184,0.24)",
                      color: voiceActive ? "#fecaca" : "#dbe0ef",
                    }}
                  >
                    voice
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                ...styles.editorCard,
                opacity: editorOpacity,
                transform: `translateY(${interpolate(editorOpacity, [0, 1], [18, 0])}px)`,
              }}
            >
              <div style={styles.editorHeader}>
                <span style={styles.editorLabel}>Editor</span>
                <span style={styles.editorCount}>143 words</span>
              </div>
              <div style={styles.editorText}>
                # Build Deep Focus{"\n"}
                Long-form reading is where durable insight compounds.{"\n"}
                Use stillReading to hold attention on one word at a time.
              </div>
              <div style={styles.startReadingButton}>Start Reading →</div>
            </div>
          </section>
        </BrowserShell>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ReadThisDiscoveryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn = spring({
    frame,
    fps,
    durationInFrames: 34,
    config: { damping: 200 },
  });

  const query = "systems design";
  const typedChars = Math.floor(
    interpolate(frame, [18, 18 + Math.round(1.2 * fps)], [0, query.length], clamp)
  );

  const upvotePulse = interpolate(frame, [72, 78, 86], [0, 1, 0], clamp);
  const downvotePulse = interpolate(frame, [108, 114, 122], [0, 1, 0], clamp);
  const readPulse = interpolate(frame, [142, 148, 156], [0, 1, 0], clamp);

  const upvoteActive = frame >= 78;
  const downvoteActive = frame >= 114;
  const readActive = frame >= 148;

  const cursorX = interpolate(
    frame,
    [30, 78, 98, 114, 132, 148, 176],
    [452, 452, 452, 980, 980, 430, 430],
    clamp
  );
  const cursorY = interpolate(
    frame,
    [30, 78, 98, 114, 132, 148, 176],
    [384, 384, 384, 384, 384, 436, 436],
    clamp
  );
  const cursorPress = Math.max(upvotePulse, downvotePulse, readPulse);

  return (
    <AbsoluteFill style={styles.scene}>
      <AbsoluteFill style={styles.contentWrap}>
        <BrowserShell frame={frame} route="/readthis" pageLabel="Curated Queue">
          <SiteHeader
            tabs={[
              { label: "Read", active: false },
              { label: "you should read this", active: true },
            ]}
          />

          <section
            style={{
              ...styles.panel,
              opacity: panelIn,
              transform: `translateY(${interpolate(panelIn, [0, 1], [18, 0])}px)`,
              gap: 14,
              position: "relative",
            }}
          >
            <div style={styles.discoveryHero}>
              <p style={styles.kicker}>Curated Reading Queue</p>
              <h2 style={styles.panelHeading}>Pick your next high-signal read in seconds.</h2>
            </div>

            <div style={styles.searchShell}>
              <span style={styles.searchIcon}>⌕</span>
              <span style={styles.searchText}>
                {query.slice(0, typedChars)}
                <span style={styles.caret}>|</span>
              </span>
            </div>

            <div style={styles.tagRow}>
              {["systems", "design", "ai", "startup"].map((tag, index) => {
                const active = index === 0 || (index === 1 && frame >= 52);
                return (
                  <span
                    key={tag}
                    style={{
                      ...styles.tagPill,
                      background: active
                        ? "linear-gradient(135deg, #ef4444, #f97316)"
                        : "rgba(20,20,28,0.92)",
                      borderColor: active ? "#ef4444" : "rgba(148,163,184,0.2)",
                      color: active ? "#fff" : "#a5adc3",
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>

            <div style={styles.discoveryCards}>
              <DiscoveryCard
                title="The Network Effects Playbook for Product Teams"
                tag="systems"
                rank={1}
                readTime="12m to stillread"
                score={291}
                scoreDelta={upvoteActive ? 1 : 0}
                upvoteActive={upvoteActive}
                downvoteActive={false}
                upvotePulse={upvotePulse}
                downvotePulse={0}
                readPulse={readPulse}
                selected={readActive}
              />
              <DiscoveryCard
                title="Interaction Design for Focused Interfaces"
                tag="design"
                rank={2}
                readTime="9m to stillread"
                score={248}
                scoreDelta={downvoteActive ? -1 : 0}
                upvoteActive={false}
                downvoteActive={downvoteActive}
                upvotePulse={0}
                downvotePulse={downvotePulse}
                readPulse={0}
                selected={false}
              />
              <DiscoveryCard
                title="Agents, Context Windows, and Real Product Velocity"
                tag="ai"
                rank={3}
                readTime="11m to stillread"
                score={233}
                scoreDelta={0}
                upvoteActive={false}
                downvoteActive={false}
                upvotePulse={0}
                downvotePulse={0}
                readPulse={0}
                selected={false}
              />
            </div>

            <div
              style={{
                ...styles.apiBadge,
                opacity: interpolate(frame, [74, 82, 96], [0, 1, 0.72], clamp),
              }}
            >
              POST /api/vote → 200 OK
            </div>

            <AnimatedCursor x={cursorX} y={cursorY} press={cursorPress} />
          </section>
        </BrowserShell>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const ArticleReaderScene: React.FC<{ featuredTitle: string }> = ({ featuredTitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn = spring({
    frame,
    fps,
    durationInFrames: 34,
    config: { damping: 200 },
  });

  const playStart = 16;
  const playEnd = 102;
  const progress = interpolate(frame, [playStart, playEnd], [0, 100], clamp);
  const wordIndex = Math.floor(
    interpolate(frame, [playStart, playEnd], [0, ARTICLE_WORDS.length - 1], clamp)
  );
  const activeWord = ARTICLE_WORDS[wordIndex] ?? ARTICLE_WORDS[0];
  const pivotIndex = getPivotIndex(activeWord);
  const before = activeWord.slice(0, pivotIndex);
  const pivot = activeWord[pivotIndex] ?? "";
  const after = activeWord.slice(pivotIndex + 1);

  const modalIn = interpolate(frame, [102, 120], [0, 1], clamp);
  const votePulse = interpolate(frame, [124, 130, 136], [0, 1, 0], clamp);
  const redirectIn = interpolate(frame, [138, 156], [0, 1], clamp);

  return (
    <AbsoluteFill style={styles.scene}>
      <AbsoluteFill style={styles.contentWrap}>
        <BrowserShell
          frame={frame}
          route="/readthis/network-effects-playbook"
          pageLabel="Article Playback"
        >
          <SiteHeader
            tabs={[
              { label: "Read", active: true },
              { label: "you should read this", accent: true },
            ]}
          />

          <section
            style={{
              ...styles.panel,
              opacity: panelIn,
              transform: `translateY(${interpolate(panelIn, [0, 1], [18, 0])}px)`,
              gap: 14,
              position: "relative",
            }}
          >
            <div style={styles.readerTitleCard}>
              <span style={styles.readerTitleKicker}>Now Reading</span>
              <span style={styles.readerTitleText}>{featuredTitle}</span>
            </div>

            <div style={{ ...styles.readerRedicle, minHeight: 320 }}>
              <div style={styles.readerGuideMarkTop} />
              <div style={styles.readerGuideMarkBottom} />
              <div style={styles.readerWordLine}>
                <span style={styles.readerWordBefore}>{before}</span>
                <span style={styles.readerWordPivot}>{pivot}</span>
                <span style={styles.readerWordAfter}>{after}</span>
              </div>
            </div>

            <div style={styles.readerConsole}>
              <div style={styles.readerProgressTrack}>
                <div style={{ ...styles.readerProgressFill, width: `${progress}%` }} />
              </div>
              <div style={styles.readerControls}>
                <span style={styles.readerStatText}>{Math.round(progress)}% · 300 wpm</span>
                <span style={styles.controlPill}>⟲</span>
                <span style={styles.playPill}>{progress > 94 ? "▶" : "❚❚"}</span>
                <span style={styles.controlPill}>voice</span>
              </div>
            </div>

            <div
              style={{
                ...styles.voteModalOverlay,
                opacity: modalIn,
                pointerEvents: "none",
              }}
            >
              <div style={styles.voteModal}>
                <h3 style={styles.voteModalTitle}>Did you enjoy this?</h3>
                <div style={styles.voteModalButtons}>
                  <span
                    style={{
                      ...styles.voteModalBtn,
                      transform: `scale(${1 - votePulse * 0.1})`,
                      borderColor: "rgba(34,197,94,0.45)",
                    }}
                  >
                    👍
                  </span>
                  <span style={styles.voteModalBtn}>👎</span>
                </div>
                <span style={styles.voteModalSkip}>Skip</span>
              </div>
            </div>

            <div
              style={{
                ...styles.redirectPill,
                opacity: redirectIn,
                transform: `translateY(${interpolate(redirectIn, [0, 1], [8, 0])}px)`,
              }}
            >
              Vote submitted → redirect to /readthis
            </div>
          </section>
        </BrowserShell>
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
    durationInFrames: 40,
    config: { damping: 200 },
  });
  const urlChars = Math.floor(
    interpolate(frame, [24, 24 + Math.round(1.1 * fps)], [0, url.length], clamp)
  );

  return (
    <AbsoluteFill style={styles.scene}>
      <AbsoluteFill style={styles.centerStack}>
        <section
          style={{
            ...styles.ctaPanel,
            opacity: panelIn,
            transform: `translateY(${interpolate(panelIn, [0, 1], [18, 0])}px)`,
          }}
        >
          <p style={styles.kicker}>You Are Ready</p>
          <h2 style={styles.ctaTitle}>{cta}</h2>
          <div style={styles.ctaChecklist}>
            {[
              "Paste any markdown URL and start instantly",
              "Control pace with play, speed, and voice mode",
              "Discover articles using search, tags, and votes",
              "Finish reading, rate the article, and continue",
            ].map((item, index) => {
              const lineIn = spring({
                frame: frame - (14 + index * 4),
                fps,
                durationInFrames: 26,
                config: { damping: 200 },
              });
              return (
                <div
                  key={item}
                  style={{
                    ...styles.ctaChecklistLine,
                    opacity: lineIn,
                    transform: `translateY(${interpolate(lineIn, [0, 1], [8, 0])}px)`,
                  }}
                >
                  <span style={styles.checkIcon}>✓</span>
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
          <div style={styles.ctaUrl}>{url.slice(0, urlChars)}</div>
        </section>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BrowserShell: React.FC<{
  frame: number;
  route: string;
  pageLabel: string;
  children: ReactNode;
}> = ({ frame, route, pageLabel, children }) => {
  const { fps } = useVideoConfig();

  const routeChars = Math.floor(
    interpolate(frame, [6, 6 + Math.round(0.95 * fps)], [0, route.length], clamp)
  );
  const routeText = route.slice(0, routeChars);
  const caretOpacity = Math.sin((frame / 7) * Math.PI) > 0 ? 1 : 0;

  return (
    <section style={styles.browserShell}>
      <div style={styles.browserTop}>
        <div style={styles.browserDots}>
          <span style={{ ...styles.dot, background: "#ef4444" }} />
          <span style={{ ...styles.dot, background: "#f59e0b" }} />
          <span style={{ ...styles.dot, background: "#22c55e" }} />
        </div>
        <div style={styles.addressBar}>
          <span style={styles.addressText}>{routeText}</span>
          {routeChars < route.length && <span style={{ ...styles.caret, opacity: caretOpacity }}>|</span>}
        </div>
        <span style={styles.pageBadge}>{pageLabel}</span>
      </div>
      <div style={styles.browserBody}>{children}</div>
    </section>
  );
};

const SiteHeader: React.FC<{
  tabs: Array<{ label: string; active?: boolean; accent?: boolean }>;
}> = ({ tabs }) => {
  return (
    <header style={styles.header}>
      <div style={styles.logoLine}>
        <span style={styles.logoIcon}>◉</span>
        <span style={styles.logoMain}>still</span>
        <span style={styles.logoSub}>Reading</span>
      </div>
      <div style={styles.navTabs}>
        {tabs.map((tab) => (
          <span
            key={tab.label}
            style={{
              ...styles.navTab,
              ...(tab.active ? styles.navTabActive : {}),
              ...(tab.accent ? styles.navTabAccent : {}),
            }}
          >
            {tab.label}
          </span>
        ))}
      </div>
    </header>
  );
};

const DiscoveryCard: React.FC<{
  title: string;
  tag: string;
  rank: number;
  readTime: string;
  score: number;
  scoreDelta: number;
  upvoteActive: boolean;
  downvoteActive: boolean;
  upvotePulse: number;
  downvotePulse: number;
  readPulse: number;
  selected: boolean;
}> = ({
  title,
  tag,
  rank,
  readTime,
  score,
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
        ...styles.discoveryCard,
        borderColor: selected ? "rgba(239,68,68,0.52)" : "rgba(148,163,184,0.2)",
        boxShadow: selected
          ? "0 20px 32px rgba(2,6,23,0.44), 0 0 0 1px rgba(239,68,68,0.22)"
          : "none",
      }}
    >
      <div style={styles.discoveryAccent} />
      <div style={styles.discoveryCardBody}>
        <div style={styles.discoveryMetaRow}>
          <span style={styles.discoveryTag}>{tag}</span>
          <span style={styles.discoveryRank}>#{rank}</span>
        </div>
        <h3 style={styles.discoveryTitle}>{title}</h3>
        <p style={styles.discoveryMeta}>{readTime}</p>
        <div style={styles.discoveryFooter}>
          <div style={styles.voteCluster}>
            <span
              style={{
                ...styles.voteBtn,
                color: upvoteActive ? "#22c55e" : "#a5adc3",
                background: upvoteActive ? "rgba(34,197,94,0.14)" : "transparent",
                transform: `scale(${1 - upvotePulse * 0.13})`,
              }}
            >
              ▲
            </span>
            <span style={styles.voteScore}>{score + scoreDelta}</span>
            <span
              style={{
                ...styles.voteBtn,
                color: downvoteActive ? "#ef4444" : "#a5adc3",
                background: downvoteActive ? "rgba(239,68,68,0.14)" : "transparent",
                transform: `scale(${1 - downvotePulse * 0.13})`,
              }}
            >
              ▼
            </span>
          </div>
          <span
            style={{
              ...styles.readNowPill,
              background: selected ? "rgba(239,68,68,0.24)" : "rgba(239,68,68,0.12)",
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

const AnimatedCursor: React.FC<{ x: number; y: number; press: number }> = ({
  x,
  y,
  press,
}) => {
  return (
    <div
      style={{
        ...styles.cursorPointer,
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${1 - press * 0.13})`,
      }}
    >
      <div style={styles.cursorInner} />
    </div>
  );
};

const styles: Record<string, CSSProperties> = {
  canvas: {
    backgroundColor: "#07070a",
    fontFamily: `${sansFont}, sans-serif`,
    color: "#f8f8fd",
  },
  stage: {
    position: "absolute",
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    transformOrigin: "top left",
    overflow: "hidden",
  },
  scene: {
    padding: "68px 82px",
  },
  contentWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerStack: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    textAlign: "center",
  },
  launchBadge: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 20,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,0.46)",
    background: "rgba(239,68,68,0.12)",
    color: "#fecaca",
    padding: "10px 18px",
  },
  logoLine: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: `${monoFont}, monospace`,
  },
  logoIcon: {
    color: "#ef4444",
    fontSize: 18,
  },
  logoMain: {
    fontSize: 30,
    fontWeight: 700,
    color: "#fafafa",
    letterSpacing: "-0.03em",
  },
  logoSub: {
    fontSize: 28,
    color: "#a1a1aa",
    letterSpacing: "-0.01em",
  },
  introTitle: {
    margin: 0,
    fontSize: 88,
    lineHeight: 1.04,
    letterSpacing: "-0.03em",
  },
  introSubtitle: {
    margin: 0,
    fontSize: 30,
    color: "#d4d4d8",
    maxWidth: 980,
    lineHeight: 1.45,
  },
  routePills: {
    display: "flex",
    gap: 10,
    marginTop: 6,
  },
  routePill: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 14,
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.28)",
    background: "rgba(8,8,14,0.72)",
    color: "#cbd5e1",
    padding: "7px 12px",
  },
  browserShell: {
    width: "100%",
    maxWidth: 1600,
    borderRadius: 26,
    border: "1px solid rgba(148,163,184,0.24)",
    background:
      "linear-gradient(160deg, rgba(255,255,255,0.06), transparent 56%), rgba(12,12,18,0.9)",
    boxShadow: "0 34px 64px rgba(2,6,23,0.48)",
    overflow: "hidden",
  },
  browserTop: {
    height: 62,
    borderBottom: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(8,8,13,0.86)",
    display: "grid",
    gridTemplateColumns: "86px 1fr auto",
    alignItems: "center",
    gap: 12,
    padding: "0 16px",
  },
  browserDots: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
  },
  addressBar: {
    height: 34,
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,0.26)",
    background: "rgba(15,23,42,0.64)",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    gap: 2,
    overflow: "hidden",
  },
  addressText: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 14,
    color: "#dbe0ef",
  },
  caret: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 14,
    color: "#ef4444",
  },
  pageBadge: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    color: "#fecaca",
    letterSpacing: "0.04em",
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,0.34)",
    background: "rgba(239,68,68,0.12)",
    padding: "7px 10px",
    textTransform: "uppercase",
  },
  browserBody: {
    padding: "16px 18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  navTabs: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    borderRadius: 9,
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(12,12,20,0.78)",
    padding: 3,
  },
  navTab: {
    fontSize: 12,
    color: "#94a3b8",
    borderRadius: 7,
    padding: "5px 12px",
    letterSpacing: "0.01em",
  },
  navTabActive: {
    background: "rgba(39,39,42,0.9)",
    color: "#f8fafc",
  },
  navTabAccent: {
    color: "#ef4444",
  },
  panel: {
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.22)",
    background:
      "linear-gradient(150deg, rgba(255,255,255,0.05), transparent 54%), rgba(15,15,24,0.86)",
    padding: "18px 18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  onboardingIntro: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  kicker: {
    margin: 0,
    fontFamily: `${monoFont}, monospace`,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    color: "#fca5a5",
  },
  panelHeading: {
    margin: 0,
    fontSize: 36,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    maxWidth: "28ch",
  },
  panelBody: {
    margin: 0,
    fontSize: 18,
    color: "#cbd5e1",
    lineHeight: 1.45,
  },
  onboardingTabs: {
    display: "flex",
    gap: 4,
    alignSelf: "flex-start",
    border: "1px solid rgba(148,163,184,0.24)",
    borderRadius: 10,
    padding: 3,
    background: "rgba(2,6,23,0.5)",
  },
  onboardingTab: {
    borderRadius: 8,
    padding: "7px 16px",
    fontSize: 14,
    color: "#94a3b8",
  },
  onboardingTabActive: {
    background: "rgba(15,23,42,0.9)",
    color: "#f8fafc",
  },
  onboardingHuman: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  onboardingAgent: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  urlRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    alignItems: "center",
  },
  urlInput: {
    height: 48,
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,0.24)",
    background: "rgba(2,6,23,0.66)",
    color: "#dbe0ef",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 14,
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
  },
  readButton: {
    height: 48,
    borderRadius: 10,
    border: "1px solid rgba(239,68,68,0.48)",
    background: "rgba(239,68,68,0.2)",
    color: "#fee2e2",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    padding: "0 16px",
    display: "inline-flex",
    alignItems: "center",
  },
  codeLine: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(2,6,23,0.58)",
    padding: "10px 12px",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    color: "#dbe0ef",
  },
  copyPill: {
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.28)",
    color: "#cbd5e1",
    fontSize: 11,
    padding: "4px 8px",
  },
  readerCard: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  readerTitleCard: {
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.2)",
    background:
      "linear-gradient(140deg, rgba(255,255,255,0.05), transparent 54%), rgba(14,14,22,0.84)",
    padding: "10px 12px",
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
    fontSize: 18,
    lineHeight: 1.25,
    color: "#f8fafc",
    fontWeight: 600,
  },
  readerRedicle: {
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.24)",
    background: "rgba(8,8,14,0.92)",
    minHeight: 270,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  readerGuideMarkTop: {
    position: "absolute",
    top: 34,
    left: "50%",
    width: 1,
    height: 58,
    background: "rgba(239,68,68,0.46)",
  },
  readerGuideMarkBottom: {
    position: "absolute",
    bottom: 34,
    left: "50%",
    width: 1,
    height: 58,
    background: "rgba(239,68,68,0.46)",
  },
  readerWordLine: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 88,
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: "-0.03em",
  },
  readerWordBefore: {
    width: 280,
    textAlign: "right",
    color: "#e2e8f0",
  },
  readerWordPivot: {
    color: "#ef4444",
  },
  readerWordAfter: {
    width: 280,
    textAlign: "left",
    color: "#e2e8f0",
  },
  readerConsole: {
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(6,6,10,0.82)",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  readerProgressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
    background: "rgba(148,163,184,0.2)",
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
    gap: 8,
  },
  readerStatText: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 13,
    color: "#a5adc3",
  },
  controlPill: {
    borderRadius: 8,
    border: "1px solid rgba(148,163,184,0.24)",
    background: "rgba(39,39,42,0.72)",
    color: "#dbe0ef",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    padding: "6px 10px",
  },
  playPill: {
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,0.38)",
    background: "linear-gradient(135deg, #ef4444, #f97316)",
    color: "#fff",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 14,
    minWidth: 44,
    textAlign: "center",
    padding: "6px 10px",
  },
  editorCard: {
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(8,8,13,0.86)",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  editorHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editorLabel: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    color: "#fca5a5",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  editorCount: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    color: "#94a3b8",
  },
  editorText: {
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,0.2)",
    background: "rgba(2,6,23,0.66)",
    padding: "12px",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 13,
    lineHeight: 1.55,
    color: "#e2e8f0",
    whiteSpace: "pre-wrap",
  },
  startReadingButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,0.36)",
    background: "rgba(239,68,68,0.16)",
    color: "#fecaca",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "8px 12px",
  },
  discoveryHero: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  searchShell: {
    height: 58,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.24)",
    background: "rgba(16,16,24,0.94)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 14px",
  },
  searchIcon: {
    fontSize: 20,
    color: "#94a3b8",
  },
  searchText: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 20,
    color: "#dbe0ef",
    letterSpacing: "0.01em",
  },
  tagRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  tagPill: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    borderRadius: 999,
    border: "1px solid",
    padding: "7px 11px",
  },
  discoveryCards: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  discoveryCard: {
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(148,163,184,0.2)",
    background:
      "linear-gradient(165deg, rgba(255,255,255,0.05), transparent 52%), rgba(21,21,32,0.95)",
    display: "flex",
    minHeight: 216,
  },
  discoveryAccent: {
    width: 5,
    background: "linear-gradient(180deg, #ef4444 0%, #fb7185 56%, #f97316 100%)",
  },
  discoveryCardBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 9,
    padding: "14px 14px 12px",
  },
  discoveryMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  discoveryTag: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderRadius: 8,
    border: "1px solid rgba(148,163,184,0.22)",
    color: "#a5adc3",
    background: "rgba(2,6,23,0.42)",
    padding: "4px 7px",
  },
  discoveryRank: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 11,
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.12)",
    color: "#fecaca",
    padding: "4px 8px",
  },
  discoveryTitle: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.24,
    color: "#f5f7ff",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  discoveryMeta: {
    margin: 0,
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    color: "#a5adc3",
  },
  discoveryFooter: {
    marginTop: "auto",
    borderTop: "1px solid rgba(148,163,184,0.18)",
    paddingTop: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  voteCluster: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  voteBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    border: "1px solid rgba(148,163,184,0.2)",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 11,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  voteScore: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    color: "#dbe0ef",
    minWidth: 24,
    textAlign: "center",
  },
  readNowPill: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#fecaca",
    borderRadius: 999,
    border: "1px solid rgba(239,68,68,0.32)",
    padding: "5px 9px",
  },
  apiBadge: {
    position: "absolute",
    top: 220,
    right: 22,
    borderRadius: 999,
    border: "1px solid rgba(56,189,248,0.42)",
    background: "rgba(56,189,248,0.14)",
    color: "#bae6fd",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    letterSpacing: "0.03em",
    padding: "8px 12px",
  },
  cursorPointer: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "2px solid rgba(248,250,252,0.95)",
    background: "rgba(15,23,42,0.54)",
    boxShadow: "0 8px 18px rgba(2,6,23,0.45)",
    zIndex: 20,
  },
  cursorInner: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#f8fafc",
    margin: "9px auto 0",
  },
  voteModalOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(2,6,23,0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  voteModal: {
    width: 320,
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.22)",
    background:
      "linear-gradient(150deg, rgba(255,255,255,0.07), transparent 56%), rgba(18,18,26,0.95)",
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  voteModalTitle: {
    margin: 0,
    fontSize: 22,
    color: "#f8fafc",
    letterSpacing: "-0.01em",
  },
  voteModalButtons: {
    display: "flex",
    gap: 10,
  },
  voteModalBtn: {
    width: 56,
    height: 46,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.3)",
    background: "rgba(15,23,42,0.8)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
  },
  voteModalSkip: {
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  redirectPill: {
    alignSelf: "center",
    borderRadius: 999,
    border: "1px solid rgba(56,189,248,0.4)",
    background: "rgba(56,189,248,0.12)",
    color: "#bae6fd",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 12,
    letterSpacing: "0.03em",
    padding: "8px 12px",
  },
  ctaPanel: {
    width: "100%",
    maxWidth: 1280,
    borderRadius: 30,
    border: "1px solid rgba(148,163,184,0.24)",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.08), transparent 56%), rgba(16,16,24,0.92)",
    boxShadow: "0 32px 62px rgba(2,6,23,0.46)",
    padding: "42px 50px",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  ctaTitle: {
    margin: 0,
    fontSize: 72,
    lineHeight: 1.04,
    letterSpacing: "-0.03em",
  },
  ctaChecklist: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  ctaChecklistLine: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#dbe0ef",
    fontSize: 20,
    lineHeight: 1.35,
  },
  checkIcon: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: "1px solid rgba(34,197,94,0.5)",
    background: "rgba(34,197,94,0.18)",
    color: "#86efac",
    fontFamily: `${monoFont}, monospace`,
    fontSize: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ctaUrl: {
    marginTop: 8,
    fontFamily: `${monoFont}, monospace`,
    fontSize: 28,
    color: "#fecaca",
    letterSpacing: "0.03em",
  },
};
