import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RSVPEngineLoader from "@/components/RSVPEngineLoader";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "stillReading",
    url: "https://stillreading.xyz",
    description:
      "Speed read anything. Paste markdown or load via URL — words appear one at a time with ORP highlighting.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "RSVP (Rapid Serial Visual Presentation) speed reading",
      "ORP (Optimal Recognition Point) highlighting",
      "Adjustable reading speed (WPM)",
      "Markdown URL ingestion",
      "Text-to-speech mode",
    ],
    isPartOf: { "@id": "https://stillreading.xyz/#website" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div data-view="reader" className="rsvp-shell" id="rsvp-shell">
        <Header activePage="reader" showEditTab />

        <main id="reader-view" className="reader-with-onboarding">
          <div id="onboarding-slot" />

          <div id="content-title" style={{ display: "none" }}>
            <span className="content-title-kicker">Now Reading</span>
            <span className="content-title-text" id="content-title-text" />
          </div>

          <div className="redicle-container">
            <div className="redicle">
              <div className="guide-top" />
              <div className="guide-bottom" />
              <div className="word-wrapper">
                <span className="word-text" id="word-text">
                  <span id="w-before" />
                  <span id="w-pivot" style={{ opacity: 0.2 }}>▶</span>
                  <span id="w-after" />
                </span>
              </div>
            </div>
          </div>

          <div className="reader-console">
            <div className="progress-container" id="progress-bar">
              <div className="progress-fill" id="progress-fill" />
            </div>
            <div className="controls">
              <div className="console-toolbar">
                <div className="stats" aria-live="polite">
                  <span id="stat-pos">0 / 0</span>
                  <span className="stat-divider">·</span>
                  <span id="stat-eta">0s remaining</span>
                </div>
                <div className="speed-controls" role="group" aria-label="Reading speed controls">
                  <button type="button" className="speed-btn" id="btn-slower" title="Slower (←)" aria-label="Decrease speed by 50 words per minute">−</button>
                  <div className="wpm-display" aria-live="polite" aria-atomic="true">
                    <span id="wpm-number">300</span>
                    <span className="wpm-label">wpm</span>
                  </div>
                  <button type="button" className="speed-btn" id="btn-faster" title="Faster (→)" aria-label="Increase speed by 50 words per minute">+</button>
                </div>
              </div>
              <div className="transport-row">
                <button type="button" className="ctrl-btn restart-btn" id="btn-restart" title="Restart (R)" aria-label="Restart reading from the beginning">
                  <span className="btn-icon" aria-hidden="true">⟲</span>
                </button>
                <button type="button" className="play-btn" id="btn-play" aria-label="Start playback">
                  <span className="play-icon" id="play-icon" aria-hidden="true">▶</span>
                </button>
                <button type="button" className="ctrl-btn voice-btn" id="btn-voice" title="Speech (S)" aria-label="Enable speech mode" aria-pressed="false">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>

        <div id="editor-slot" />
        <div id="wpm-popup-slot" />

        <Footer />
      </div>
      <RSVPEngineLoader showEditor showOnboarding />
    </>
  );
}
