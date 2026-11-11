export type ResolvedSignal = { symbol: string; setup: string | null; status: string; pips: number };

const MIN_SAMPLES = 20;

/** Statistiques de track record sur les signaux résolus (tp_hit / sl_hit / closed avec pips). */
export function computeStats(signals: ResolvedSignal[]) {
  const total = signals.length;
  const cumPips = signals.reduce((s, x) => s + x.pips, 0);
  const wins = signals.filter((x) => x.pips > 0);
  const grossWin = wins.reduce((s, x) => s + x.pips, 0);
  const grossLoss = Math.abs(signals.filter((x) => x.pips < 0).reduce((s, x) => s + x.pips, 0));
  let equity = 0, peak = 0, maxDrawdown = 0;
  for (const x of signals) {
    equity += x.pips;
    peak = Math.max(peak, equity);
    maxDrawdown = Math.max(maxDrawdown, peak - equity);
  }
  const group = (key: "symbol" | "setup") => {
    const map = new Map<string, { w: number; n: number }>();
    for (const x of signals) {
      const k = x[key];
      if (!k) continue;
      const g = map.get(k) ?? { w: 0, n: 0 };
      g.n++;
      if (x.pips > 0) g.w++;
      map.set(k, g);
    }
    return [...map].map(([name, g]) => ({
      name, samples: g.n,
      winRate: g.n >= MIN_SAMPLES ? Math.round((g.w / g.n) * 100) : null, // garde statistique
    }));
  };
  return {
    total,
    cumPips: Math.round(cumPips * 10) / 10,
    winRate: total ? Math.round((wins.length / total) * 100) : 0,
    profitFactor: grossLoss ? Math.round((grossWin / grossLoss) * 100) / 100 : grossWin ? Infinity : 0,
    expectancy: total ? Math.round(cumPips / total) : 0,
    maxDrawdown: Math.round(maxDrawdown * 10) / 10,
    bySymbol: group("symbol"),
    bySetup: group("setup"),
    minSamples: MIN_SAMPLES,
  };
}
