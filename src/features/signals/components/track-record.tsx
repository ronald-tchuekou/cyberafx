import { ShieldCheck } from "lucide-react";
import type { getTrackRecord } from "../queries";

type Stats = Awaited<ReturnType<typeof getTrackRecord>>;

export function TrackRecord({ stats }: { stats: Stats }) {
  const items = [
    ["CUMULATIVE PIPS", `${stats.cumPips > 0 ? "+" : ""}${stats.cumPips.toLocaleString("fr-FR")} pips`],
    ["WIN RATE", `${stats.winRate}%`],
    ["RESOLVED SIGNALS", String(stats.total)],
    ["PROFIT FACTOR", Number.isFinite(stats.profitFactor) ? String(stats.profitFactor) : "∞"],
    ["EXPECTANCY / SIGNAL", `${stats.expectancy > 0 ? "+" : ""}${stats.expectancy} pips`],
    ["MAX DRAWDOWN", `${stats.maxDrawdown} pips`],
  ];
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold"><ShieldCheck className="size-4 text-success" />Verified Signal Track Record</h2>
        <span className="rounded bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">LIVE AUDIT</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Independently tracked cumulative performance across resolved signals (min {stats.minSamples}-sample statistical guard).</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(([k, v]) => (
          <div key={k} className="rounded-lg bg-muted/40 p-3"><p className="text-[11px] text-muted-foreground">{k}</p><p className="mt-1 text-lg font-bold">{v}</p></div>
        ))}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">By market &amp; setup:</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {[...stats.bySymbol, ...stats.bySetup].map((g) => (
          <span key={g.name} className="rounded-md border px-2 py-1 text-xs">
            {g.name} <b className="ml-1">{g.winRate != null ? `${g.winRate}%` : `${g.samples}/${stats.minSamples} samples`}</b>
          </span>
        ))}
      </div>
    </section>
  );
}
