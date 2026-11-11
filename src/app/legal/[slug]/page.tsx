import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LEGAL_PAGES, getLegalPage } from "@/features/legal/data";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => LEGAL_PAGES.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const page = getLegalPage((await params).slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: absoluteUrl(`/legal/${page.slug}`) },
    openGraph: { title: page.title, description: page.description, url: absoluteUrl(`/legal/${page.slug}`), type: "article" },
  };
}

export default async function LegalPageRoute({ params }: PageProps<"/legal/[slug]">) {
  const page = getLegalPage((await params).slug);
  if (!page) notFound();
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-16">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">CyberAFX</Link> / <span aria-current="page">{page.title}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{page.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated <time dateTime={page.updated}>{new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(page.updated))}</time></p>
      <div className="mt-8 space-y-6">
        {page.sections.map(([h, body]) => (
          <section key={h}>
            <h2 className="text-lg font-bold">{h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </section>
        ))}
      </div>
      <nav aria-label="Legal pages" className="mt-12 flex flex-wrap gap-4 border-t pt-6 text-sm">
        {LEGAL_PAGES.filter((p) => p.slug !== page.slug).map((p) => (
          <Link key={p.slug} href={`/legal/${p.slug}`} className="underline-offset-4 hover:underline">{p.title}</Link>
        ))}
      </nav>
    </main>
  );
}
