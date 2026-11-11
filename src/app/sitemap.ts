import type { MetadataRoute } from "next";
import { LEGAL_PAGES } from "@/features/legal/data";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Pas de lastModified sur l'accueil : une date qui change à chaque requête serait ignorée par Google.
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    ...LEGAL_PAGES.map((p) => ({ url: absoluteUrl(`/legal/${p.slug}`), lastModified: new Date(p.updated), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
