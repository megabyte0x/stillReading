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
};

export default nextConfig;
