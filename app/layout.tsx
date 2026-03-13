import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "stillReading — RSVP Speed Reader for Markdown",
  description:
    "RSVP speed reader. Paste markdown, read word-by-word with ORP highlighting.",
  metadataBase: new URL("https://stillreading.xyz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "stillReading — RSVP Speed Reader",
    description:
      "Speed read anything. Paste markdown or load via URL — words appear one at a time with ORP highlighting.",
    url: "https://stillreading.xyz",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "stillReading — RSVP Speed Reader",
    description:
      "Speed read anything. Paste markdown or load via URL — words appear one at a time with ORP highlighting.",
    images: ["/api/og"],
  },
  icons: {
    icon: {
      url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%2309090b'/><line x1='4' y1='8' x2='28' y2='8' stroke='%23222228' stroke-width='1'/><line x1='4' y1='24' x2='28' y2='24' stroke='%23222228' stroke-width='1'/><line x1='16' y1='2' x2='16' y2='8' stroke='%23dc2626' stroke-width='1.5' opacity='0.7'/><line x1='16' y1='24' x2='16' y2='30' stroke='%23dc2626' stroke-width='1.5' opacity='0.7'/><text x='16' y='19' text-anchor='middle' font-family='monospace' font-size='14' font-weight='700' fill='%23dc2626'>R</text></svg>",
      type: "image/svg+xml",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://stillreading.xyz/#website",
        name: "stillReading",
        url: "https://stillreading.xyz",
        description:
          "RSVP speed reader. Paste markdown, read word-by-word with ORP highlighting.",
        publisher: { "@id": "https://stillreading.xyz/#organization" },
        inLanguage: "en",
      },
      {
        "@type": "Organization",
        "@id": "https://stillreading.xyz/#organization",
        name: "stillReading",
        url: "https://stillreading.xyz",
        sameAs: ["https://github.com/megabyte0x/stillReading"],
      },
    ],
  };

  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
