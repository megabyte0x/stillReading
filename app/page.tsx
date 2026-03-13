import RSVPReader from "@/components/RSVPReader";

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
      <RSVPReader showEditor={true} showOnboarding={true} />
    </>
  );
}
