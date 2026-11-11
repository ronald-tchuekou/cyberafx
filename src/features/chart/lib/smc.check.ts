// pnpm tsx src/features/chart/lib/smc.check.ts
import assert from "node:assert/strict";
import { generateCandles } from "./candles";
import { analyze } from "./smc";

const c = generateCandles("XAUUSD", "H1");
assert.equal(c.length, 400);
assert.deepEqual(generateCandles("XAUUSD", "H1").map((x) => x.close), c.map((x) => x.close)); // déterministe
const a = analyze(c);
assert.ok(a.score >= 0 && a.score <= 6);
if (a.idea) assert.ok(a.idea.side === "BUY" ? a.idea.stopLoss < a.idea.entry : a.idea.stopLoss > a.idea.entry);
console.log("smc OK", a.trend, a.structure, a.score);
