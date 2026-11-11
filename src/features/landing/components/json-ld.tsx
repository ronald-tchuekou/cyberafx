import type { Package } from "@/features/packages/queries";
import { SITE, absoluteUrl } from "@/lib/site";
import { FAQ } from "../data";

/** Données structurées (schema.org). Le FAQPage reprend exactement la FAQ visible, comme l'exige Google. */
export function LandingJsonLd({ packages, sameAs }: { packages: Package[]; sameAs: string[] }) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: SITE.name,
        url: SITE.url,
        logo: absoluteUrl("/apple-icon"),
        description: SITE.description,
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        inLanguage: "en",
        publisher: { "@id": absoluteUrl("/#organization") },
      },
      {
        "@type": "WebPage",
        "@id": absoluteUrl("/#webpage"),
        url: SITE.url,
        name: SITE.title,
        isPartOf: { "@id": absoluteUrl("/#website") },
        about: { "@id": absoluteUrl("/#organization") },
        inLanguage: "en",
      },
      {
        "@type": "ItemList",
        name: "CyberAFX memberships and mentorship programs",
        itemListElement: packages.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: p.name,
            description: p.description,
            brand: { "@type": "Brand", name: SITE.name },
            offers: {
              "@type": "Offer",
              price: Number(p.priceUsd).toFixed(2),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: absoluteUrl(`/auth?pkg=${p.slug}`),
            },
          },
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
  };
  // "<" échappé : empêche toute fermeture prématurée de la balise <script>.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />;
}
