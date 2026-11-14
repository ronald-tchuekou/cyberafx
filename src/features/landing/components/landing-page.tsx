import { CheckCircle2, ExternalLink, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SignalCard } from "@/features/signals/components/signal-card";
import type { Signal } from "@/features/signals/queries";
import type { Package } from "@/features/packages/queries";
import type { SETTING_DEFAULTS } from "@/features/settings/queries";
import { durationLabel, usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LEGAL_PAGES } from "@/features/legal/data";
import { FAQ, FEATURES, MYFXBOOK, RISK_WARNING, STATS, STEPS, TICKER } from "../data";
import { parseLandingGrid } from "@/features/settings/queries";
import { LandingJsonLd } from "./json-ld";

type S = typeof SETTING_DEFAULTS;
/** Liens vers des sites tiers : ouverts à part, sans fuite de référent ni accès à window.opener. */
const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const sky = "bg-sky-700 text-white hover:bg-sky-600";
const lime = "bg-brand text-brand-foreground hover:bg-brand/85";
const h2 = "text-3xl font-extrabold tracking-tight sm:text-4xl";
const eyebrow = "text-[11px] font-bold uppercase tracking-[0.25em] text-brand";

function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div aria-hidden="true" className="overflow-hidden border-b bg-card/50 py-1.5 font-mono text-[11px]">
      <div className="animate-marquee flex w-max gap-8 whitespace-nowrap">
        {items.map(([s, p, c], i) => (
          <span key={i} className="flex gap-2"><b>{s}</b><span className="text-muted-foreground">{p}</span><span className={c.startsWith("-") ? "text-destructive" : "text-success"}>{c}</span></span>
        ))}
      </div>
    </div>
  );
}

export function LandingPage({ signals, packages, settings, signedIn }: { signals: Signal[]; packages: Package[]; settings: S; signedIn: boolean }) {
  const grid = parseLandingGrid(settings.landingGrid);
  const portal = signedIn ? "/client" : "/auth";
  const signalPlans = packages.filter((p) => p.kind === "signal");
  const mentorPlans = packages.filter((p) => p.kind === "mentorship");
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.05_265),transparent_60%)]">
      <LandingJsonLd packages={packages} sameAs={[settings.telegramFreeUrl, settings.myfxbookUrl]} />
      <Ticker />
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="leading-none"><span className="text-lg font-extrabold">CYBER<span className="text-brand">AFX</span></span><span className="block text-[11px] tracking-[0.3em] text-muted-foreground">TRADE TO ELEVATE</span></Link>
          <nav aria-label="Main" className="hidden gap-6 text-xs font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Forex Features</a><a href="#pricing" className="hover:text-foreground">VIP Packages</a><a href="#faq" className="hover:text-foreground">FAQ</a>
            <a href={settings.telegramContactUrl} {...ext} className="text-sky-400">Contact Telegram</a>
          </nav>
          <div className="flex gap-2">
            <Link href={portal} className={buttonVariants({ variant: "outline", size: "sm" })}>{signedIn ? "Dashboard" : "Sign In"}</Link>
            <Link href={portal} className={cn(buttonVariants({ size: "sm" }), lime)}>Join VIP</Link>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
      <section aria-labelledby="hero-title" className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center">
        <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand">● Trade to elevate</span>
        <h1 id="hero-title" className="mt-6 text-5xl font-extrabold tracking-tight sm:text-7xl">CYBER<span className="text-brand">AFX</span></h1>
        <p className="mt-2 text-3xl font-bold tracking-wide text-muted-foreground sm:text-4xl">VIP MEMBERSHIP</p>
        <p aria-hidden="true" className="mt-2 text-amber-500">★★★</p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Exclusive access. Premium signals. Maximum results.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#pricing" className={cn(buttonVariants({ size: "lg" }), lime, "h-10 px-5")}>Explore VIP Access</a>
          <a href={settings.telegramFreeUrl} {...ext} className={cn(buttonVariants({ size: "lg" }), "h-10 px-5", sky)}><Send />Join Free Channel</a>
          <Link href={portal} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 px-5")}>Access Client Portal</Link>
        </div>
        <dl className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map(([v, k]) => <div key={k} className="sm:border-l sm:first:border-0"><dt className="text-3xl font-extrabold text-brand">{v}</dt><dd className="mt-1 text-[11px] font-semibold tracking-widest text-muted-foreground">{k}</dd></div>)}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-8 rounded-3xl border bg-card/60 p-6 lg:grid-cols-2 lg:p-10">
          <div>
            <p className={eyebrow}>Verified track record</p>
            <h2 className={cn(h2, "mt-3")}>PROVEN PERFORMANCE ON MYFXBOOK</h2>
            <p className="mt-4 text-sm text-muted-foreground">Transparency is our core value. Our signals are backed by live, audited trading accounts showing consistent monthly growth, low drawdowns, and verified track records. Check our real-time statistics directly on Myfxbook.</p>
            <div className="mt-6 flex gap-3">
              <a href={settings.myfxbookUrl} {...ext} className={cn(buttonVariants(), lime)}><ExternalLink />Explore Live Portfolio</a>
              <a href={settings.telegramFreeUrl} {...ext} className={buttonVariants({ variant: "outline" })}>Join Free Channel</a>
            </div>
          </div>
          <div className="rounded-2xl border bg-background/60 p-4">
            <div className="flex items-center justify-between"><div><p className="font-bold">CYBERAFX</p><p className="text-[11px] text-muted-foreground">Myfxbook System #12107250</p></div>
              <div className="text-[11px] text-success"><p><ShieldCheck className="mr-1 inline size-3" />Track Record Verified</p><p><ShieldCheck className="mr-1 inline size-3" />Trading Privileges Verified</p></div></div>
            <div className="mt-4 grid grid-cols-4 gap-2">{MYFXBOOK.map(([k, v]) => <div key={k} className="rounded-lg bg-muted/50 p-2"><p className="text-[11px] text-muted-foreground">{k}</p><p className="text-sm font-bold text-success">{v}</p></div>)}</div>
            <p className="mt-4 text-[11px] font-semibold tracking-widest text-muted-foreground">GROWTH CURVE PREVIEW</p>
            <svg role="img" aria-label="Illustrative growth curve preview" viewBox="0 0 300 80" className="mt-1 h-24 w-full"><polyline fill="none" stroke="var(--brand)" strokeWidth="2.5" points="0,76 40,70 80,66 120,58 160,48 200,38 240,22 300,4" /></svg>
            <div className="flex justify-between text-[11px] text-muted-foreground"><span>PEPPERSTONE LIVE MT4</span><span>0.0% Initial · 23975% Peak</span></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <p className={eyebrow}>Live public feed</p>
        <h2 className={cn(h2, "mt-2")}>REAL-TIME TELEGRAM FREE SIGNALS</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Get a preview of the trades shared in our public Telegram channel. Tap any card below to join the community and copy our real-time updates.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {signals.length === 0 && <p className="text-sm text-muted-foreground">Aucun signal gratuit publié pour le moment.</p>}
          {signals.map((s) => (
            <a key={s.id} href={settings.telegramFreeUrl} {...ext}><SignalCard s={s} footer={<p className="mt-3 rounded-lg bg-sky-500/15 py-1.5 text-center text-xs font-semibold text-sky-400">Copy on Telegram</p>} /></a>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">💡 How to get started: Tap any card to join the public channel. We send daily entry coordinates, target completions, and trading analysis absolutely free. For institutional accounts and maximum speed, check out our VIP Packages.</p>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-16 px-4 pb-20">
        <p className={eyebrow}>VIP membership subscriptions</p>
        <h2 className={cn(h2, "mt-2")}>Choose the tier that fits your capital</h2>
        {[["SIGNALS ACCESS PLANS", signalPlans, "JOIN THE VIP TIER"], ["MENTORSHIP PROGRAMS", mentorPlans, "APPLY FOR MENTORSHIP"]].map(([title, list, cta]) => (
          <div key={title as string} className="mt-8">
            <h3 className="mb-3 text-xs font-bold tracking-[0.25em] text-muted-foreground">{title as string}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {(list as Package[]).map((p) => (
                <div key={p.id} className="flex flex-col rounded-2xl border bg-card p-6">
                  <h4 className="text-sm font-bold tracking-wide">{p.name}</h4>
                  <p className="mt-3 text-4xl font-extrabold text-brand">{usd(p.priceUsd)}</p>
                  <p className="text-[11px] font-semibold tracking-widest text-muted-foreground">{p.durationMonths === 1 ? "PER MONTH" : p.durationMonths >= 12000 ? "ONE-TIME PAYMENT" : durationLabel(p.durationMonths).toUpperCase().replace(" ACCESS", "") + " COMPLETE ACCESS"}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>
                  <ul className="my-4 flex-1 space-y-1.5 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />{f}</li>)}</ul>
                  <Link href={`/auth?pkg=${p.slug}`} className={cn(buttonVariants({ size: "lg" }), lime, "h-10 font-bold")}>{cta as string}</Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-16 px-4 pb-20">
        <p className={eyebrow}>Core infrastructure</p>
        <h2 className={cn(h2, "mt-2")}>TRADING PLATFORM FEATURES</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([t, d, e]) => <div key={t} className="rounded-2xl border bg-card p-5"><span aria-hidden="true" className="text-2xl">{e}</span><h3 className="mt-3 text-sm font-bold">{t}</h3><p className="mt-2 text-xs text-muted-foreground">{d}</p></div>)}
        </div>
      </section>

      {grid.items.length > 0 && (
        <section aria-labelledby="grid-title" className="mx-auto max-w-6xl px-4 pb-20">
          {grid.title && <h2 id="grid-title" className={h2}>{grid.title}</h2>}
          {grid.subtitle && <p className="mt-2 text-muted-foreground">{grid.subtitle}</p>}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grid.items.map((it, i) => (
              <figure key={i} className="overflow-hidden rounded-2xl border bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element -- URL https libre saisie par l'admin */}
                <img src={it.imageUrl} alt={it.title} loading="lazy" className="aspect-video w-full object-cover" />
                <figcaption className="p-4"><h3 className="text-sm font-bold">{it.title}</h3>{it.text && <p className="mt-1 text-xs text-muted-foreground">{it.text}</p>}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <p className={eyebrow}>Process flow</p>
        <h2 className={cn(h2, "mt-2")}>HOW TO GET STARTED</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {STEPS.map(([n, t, d]) => <div key={n} className="relative overflow-hidden rounded-2xl border bg-card p-6"><span aria-hidden="true" data-n={n} className="absolute right-4 top-2 text-6xl font-black text-muted/60 select-none before:content-[attr(data-n)]" /><h3 className="font-bold">{t}</h3><p className="mt-2 max-w-sm text-sm text-muted-foreground">{d}</p></div>)}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-16 px-4 pb-20">
        <p className={eyebrow}>Common inquiries</p>
        <h2 className={cn(h2, "mt-2")}>FREQUENTLY ASKED QUESTIONS</h2>
        <div className="mt-6 space-y-2">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-xl border bg-card px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden">{q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20 text-center">
        <div className="rounded-3xl border bg-card/60 p-10">
          <p className={eyebrow}>Ready to start?</p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">Gain immediate entry to our high-win-rate Forex Signals and VIP Mentorship modules. Build a sustainable trading roadmap today.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/auth?pkg=monthly" className={cn(buttonVariants({ size: "lg" }), lime, "h-10 px-5")}>Start VIP Signals</Link>
            <a href={settings.telegramFreeUrl} {...ext} className={cn(buttonVariants({ size: "lg" }), "h-10 px-5", sky)}>Join Free Channel</a>
            <Link href="/auth" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 px-5")}>Mentorship Program</Link>
          </div>
        </div>
      </section>

      </main>

      <footer className="border-t px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <span className="text-base font-extrabold text-foreground">CYBER<span className="text-brand">AFX</span></span>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2"><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a><a href={settings.telegramContactUrl} {...ext}>Telegram Contact</a>{LEGAL_PAGES.map((p) => <Link key={p.slug} href={`/legal/${p.slug}`}>{p.title}</Link>)}</nav>
          </div>
          <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">{RISK_WARNING}</p>
          <p className="mt-4 text-[11px] text-muted-foreground">© {new Date().getFullYear()} CyberAFX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
