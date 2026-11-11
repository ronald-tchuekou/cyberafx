// Vérification rapide : pnpm tsx src/features/signals/lib/stats.check.ts
import assert from "node:assert/strict";
import { computeStats } from "./stats";

const s = computeStats([
  { symbol: "XAUUSD", setup: "SMC", status: "tp_hit", pips: 100 },
  { symbol: "XAUUSD", setup: "SMC", status: "sl_hit", pips: -50 },
  { symbol: "EURUSD", setup: "SMC", status: "sl_hit", pips: -50 },
]);
assert.equal(s.cumPips, 0);
assert.equal(s.winRate, 33);
assert.equal(s.profitFactor, 1);
assert.equal(s.maxDrawdown, 100);
assert.equal(s.bySymbol[0].winRate, null); // < 20 échantillons
console.log("stats OK");
