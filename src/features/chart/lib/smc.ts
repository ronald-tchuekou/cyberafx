import { ema, type Candle } from "./candles";

type Swing = { i: number; price: number };
export type Zone = { kind: "FVG" | "OB" | "OTE"; side: "bull" | "bear"; top: number; bottom: number; i: number };
export type Pillar = { name: string; pass: boolean; detail: string };
export type Analysis = {
  trend: "bullish" | "bearish" | "ranging";
  structure: "BOS" | "CHoCH" | "none";
  zones: Zone[];
  idea: null | { side: "BUY" | "SELL"; entry: number; stopLoss: number; takeProfit: number; rr: number };
  atr: number;
  pillars: Pillar[];
  score: number; // 0-6
  levels: { support: number; resistance: number };
};

function swings(c: Candle[], n = 3) {
  const highs: Swing[] = [], lows: Swing[] = [];
  for (let i = n; i < c.length - n; i++) {
    const win = c.slice(i - n, i + n + 1);
    if (c[i].high === Math.max(...win.map((x) => x.high))) highs.push({ i, price: c[i].high });
    if (c[i].low === Math.min(...win.map((x) => x.low))) lows.push({ i, price: c[i].low });
  }
  return { highs, lows };
}

/** Analyse Smart Money Concepts : structure, FVG, order blocks, OTE, idée de trade + 6 piliers. */
export function analyze(c: Candle[]): Analysis {
  const closes = c.map((x) => x.close);
  const last = c[c.length - 1];
  const atr = c.slice(-14).reduce((s, x) => s + (x.high - x.low), 0) / 14;
  const { highs, lows } = swings(c);
  const [h1, h2] = [highs.at(-2), highs.at(-1)];
  const [l1, l2] = [lows.at(-2), lows.at(-1)];

  const hh = !!h1 && !!h2 && h2.price > h1.price, hl = !!l1 && !!l2 && l2.price > l1.price;
  const lh = !!h1 && !!h2 && h2.price < h1.price, ll = !!l1 && !!l2 && l2.price < l1.price;
  const trend = hh && hl ? "bullish" : lh && ll ? "bearish" : "ranging";

  // Cassure du dernier swing : dans le sens de la tendance = BOS, contre = CHoCH.
  let structure: Analysis["structure"] = "none";
  if (h2 && last.close > h2.price) structure = trend === "bearish" ? "CHoCH" : "BOS";
  else if (l2 && last.close < l2.price) structure = trend === "bullish" ? "CHoCH" : "BOS";

  const zones: Zone[] = [];
  for (let i = c.length - 60; i < c.length; i++) {
    if (i < 2) continue;
    const [a, , z] = [c[i - 2], c[i - 1], c[i]];
    if (z.low > a.high && !c.slice(i + 1).some((x) => x.low <= a.high)) zones.push({ kind: "FVG", side: "bull", top: z.low, bottom: a.high, i });
    if (z.high < a.low && !c.slice(i + 1).some((x) => x.high >= a.low)) zones.push({ kind: "FVG", side: "bear", top: a.low, bottom: z.high, i });
  }
  // Order block : dernière bougie opposée avant une impulsion > 1.5 ATR.
  for (let i = c.length - 60; i < c.length - 1; i++) {
    if (i < 1) continue;
    const move = c[i + 1].close - c[i + 1].open;
    if (Math.abs(move) < atr * 1.5) continue;
    const bull = move > 0, o = c[i];
    if ((bull && o.close < o.open) || (!bull && o.close > o.open)) zones.push({ kind: "OB", side: bull ? "bull" : "bear", top: o.high, bottom: o.low, i });
  }

  const dir = trend === "bearish" ? "SELL" : "BUY";
  let idea: Analysis["idea"] = null;
  const hi = h2?.price ?? last.high, lo = l2?.price ?? last.low;
  if (trend !== "ranging" && hi > lo) {
    const range = hi - lo;
    const entry = dir === "BUY" ? hi - range * 0.705 : lo + range * 0.705; // milieu de l'OTE 0.62–0.79
    const stopLoss = dir === "BUY" ? lo - atr * 0.2 : hi + atr * 0.2;
    const takeProfit = dir === "BUY" ? hi + range * 0.27 : lo - range * 0.27;
    const risk = Math.abs(entry - stopLoss);
    if (risk > 0) idea = { side: dir, entry, stopLoss, takeProfit, rr: Math.round((Math.abs(takeProfit - entry) / risk) * 100) / 100 };
    zones.push({ kind: "OTE", side: dir === "BUY" ? "bull" : "bear", top: dir === "BUY" ? hi - range * 0.62 : lo + range * 0.79, bottom: dir === "BUY" ? hi - range * 0.79 : lo + range * 0.62, i: c.length - 1 });
  }

  const e20 = ema(closes, 20), e50 = ema(closes, 50);
  const aligned = (dir === "BUY" ? e20.at(-1)! > e50.at(-1)! : e20.at(-1)! < e50.at(-1)!);
  const sameSideZones = zones.filter((z) => z.kind !== "OTE" && z.side === (dir === "BUY" ? "bull" : "bear"));
  const pillars: Pillar[] = [
    { name: "Market Structure", pass: trend !== "ranging", detail: `Trend ${trend}, ${structure === "none" ? "pas de cassure récente" : structure}` },
    { name: "Liquidity Sweep", pass: structure !== "none", detail: structure !== "none" ? "Swing récent pris" : "Aucun sweep" },
    { name: "Imbalance (FVG)", pass: sameSideZones.some((z) => z.kind === "FVG"), detail: `${zones.filter((z) => z.kind === "FVG").length} FVG ouverts` },
    { name: "Order Block", pass: sameSideZones.some((z) => z.kind === "OB"), detail: `${zones.filter((z) => z.kind === "OB").length} OB valides` },
    { name: "Momentum (EMA 20/50)", pass: trend !== "ranging" && aligned, detail: aligned ? "EMA alignées" : "EMA contraires" },
    { name: "Risk / Reward ≥ 2", pass: (idea?.rr ?? 0) >= 2, detail: idea ? `R:R ${idea.rr}` : "Aucune idée" },
  ];
  return {
    trend, structure, zones: zones.slice(-8), idea, atr, pillars,
    score: pillars.filter((p) => p.pass).length,
    levels: { support: lo, resistance: hi },
  };
}
