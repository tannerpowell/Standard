import type { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/data/navigation";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE_BASE_URL, lastModified: now, priority: 1.0 },
    { url: `${SITE_BASE_URL}/services`, lastModified: now, priority: 0.9 },
    { url: `${SITE_BASE_URL}/training`, lastModified: now, priority: 0.9 },
    {
      url: `${SITE_BASE_URL}/environmental`,
      lastModified: now,
      priority: 0.8,
    },
    { url: `${SITE_BASE_URL}/careers`, lastModified: now, priority: 0.7 },
    { url: `${SITE_BASE_URL}/contact`, lastModified: now, priority: 0.7 },
  ];
}
