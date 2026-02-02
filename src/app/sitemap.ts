import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://standardtx.com";

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/services`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/training`, lastModified: new Date(), priority: 0.9 },
    {
      url: `${baseUrl}/environmental`,
      lastModified: new Date(),
      priority: 0.8,
    },
    { url: `${baseUrl}/careers`, lastModified: new Date(), priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.7 },
  ];
}
