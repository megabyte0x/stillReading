import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "stillReading",
  description:
    "RSVP speed reader. Paste markdown, read word-by-word with ORP highlighting.",
  openGraph: {
    type: "website",
    title: "stillReading",
    description:
      "Speed read anything. Paste markdown or load via URL — words appear one at a time with ORP highlighting.",
    url: "https://stillreading.xyz",
    images: [{ url: "https://stillreading.xyz/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "stillReading",
    description:
      "Speed read anything. Paste markdown or load via URL — words appear one at a time with ORP highlighting.",
    images: ["https://stillreading.xyz/api/og"],
  },
  icons: {
    icon: {
      url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%2309090b'/><line x1='4' y1='8' x2='28' y2='8' stroke='%23222228' stroke-width='1'/><line x1='4' y1='24' x2='28' y2='24' stroke='%23222228' stroke-width='1'/><line x1='16' y1='2' x2='16' y2='8' stroke='%23dc2626' stroke-width='1.5' opacity='0.7'/><line x1='16' y1='24' x2='16' y2='30' stroke='%23dc2626' stroke-width='1.5' opacity='0.7'/><text x='16' y='19' text-anchor='middle' font-family='monospace' font-size='14' font-weight='700' fill='%23dc2626'>R</text></svg>",
      type: "image/svg+xml",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600&display=swap"
          rel="stylesheet"
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
