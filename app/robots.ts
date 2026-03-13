import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/http"],
      },
    ],
    sitemap: "https://stillreading.xyz/sitemap.xml",
  };
}
