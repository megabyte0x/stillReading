import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/:path(https?\\:.*)",
          destination: "/",
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "img-src 'self' data: https:",
              "connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
