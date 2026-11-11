export type Candle = { time: number; open: number; high: number; low: number; close: number };

export const SYMBOLS = [
  { id: "XAUUSD", name: "Gold/USD", group: "commodities", base: 4050, vol: 0.0016, digits: 2 },
  { id: "EURUSD", name: "Euro/US Dollar", group: "forex", base: 1.0842, vol: 0.0004, digits: 5 },
  { id: "GBPUSD", name: "Pound/US Dollar", group: "forex", base: 1.2654, vol: 0.0005, digits: 5 },
  { id: "USDJPY", name: "US Dollar/Yen", group: "forex", base: 156.45, vol: 0.0005, digits: 3 },
  { id: "GBPJPY", name: "Pound/Yen", group: "forex", base: 198.15, vol: 0.0007, digits: 3 },
  { id: "BTCUSD", name: "Bitcoin/USD", group: "crypto", base: 64850, vol: 0.0035, digits: 2 },
  { id: "ETHUSD", name: "Ethereum/USD", group: "crypto", base: 3480, vol: 0.004, digits: 2 },
  { id: "SOLUSD", name: "Solana/USD", group: "crypto", base: 138, vol: 0.006, digits: 2 },
] as const;

export const TIMEFRAMES = { M1: 60, M5: 300, M15: 900, M30: 1800, H1: 3600, H4: 14400, D1: 86400 } as const;
export type Timeframe = keyof typeof TIMEFRAMES;

// PRNG déterministe : la forme du graphe est stable pour (symbole, timeframe).
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

/** Marche aléatoire à régimes de tendance, ancrée sur "maintenant". Données simulées (pas de flux marché réel). */
export function generateCandles(symbol: string, tf: Timeframe, count = 400): Candle[] {
  const meta = SYMBOLS.find((s) => s.id === symbol) ?? SYMBOLS[0];
  const step = TIMEFRAMES[tf];
  const rnd = mulberry32(hash(`${symbol}${tf}`));
  const vol = meta.vol * Math.sqrt(step / 3600) ** 0.8;
  const end = Math.floor(Date.now() / 1000 / step) * step;
  let price: number = meta.base;
  let drift = 0;
  const out: Candle[] = [];
  for (let i = 0; i < count; i++) {
    if (i % 35 === 0) drift = (rnd() - 0.5) * vol * 0.6; // nouveau régime
    const open = price;
    const body = (rnd() - 0.5 + drift / vol) * vol * price * 1.4;
    const close = open + body;
    const high = Math.max(open, close) + rnd() * vol * price * 0.7;
    const low = Math.min(open, close) - rnd() * vol * price * 0.7;
    out.push({ time: end - (count - 1 - i) * step, open, high, low, close });
    price = close;
  }
  return out;
}

export function ema(values: number[], period: number) {
  const k = 2 / (period + 1);
  const out: number[] = [];
  values.forEach((v, i) => out.push(i === 0 ? v : v * k + out[i - 1] * (1 - k)));
  return out;
}
