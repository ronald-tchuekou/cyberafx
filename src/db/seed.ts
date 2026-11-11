// pnpm db:seed — données de DÉMONSTRATION (offres de la plateforme d'origine + signaux fictifs). À remplacer en production.
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import * as s from "./schema";

config({ path: ".env.local" });
const db = drizzle(neon(process.env.DATABASE_URL!));

const signalFeatures = ["Accurate Trading Signals", "High Win Rate", "24/7 Support", "Risk Management", "Premium Insights"];
const packages: (typeof s.packages.$inferInsert)[] = [
  { slug: "lifetime", kind: "signal", name: "LIFETIME VIP MEMBERSHIP", priceUsd: "499", durationMonths: 12000, scansPerDay: null, sortOrder: 1,
    description: "Get lifetime access to premium signals, analyst setups, and our private trading community with a one-time payment.",
    features: [...signalFeatures, "Private Community Access", "Daily signals icluding weekeds", "My full course", "Sniper entries only"] },
  { slug: "monthly", kind: "signal", name: "MONTHLY VIP MEMBERSHIP", priceUsd: "199", durationMonths: 1, scansPerDay: 15, sortOrder: 2,
    description: "Gain exclusive access to high-probability daily signals, professional setups, and priority 24/7 support.", features: signalFeatures },
  { slug: "mentorship-basic", kind: "mentorship", name: "BASIC MENTORSHIP PLAN", priceUsd: "799", durationMonths: 6, scansPerDay: 15, sortOrder: 3,
    description: "Get 6 months access to premium signals, analyst setups, and our private trading community with a one-time payment.",
    features: ["My full course", "3 months free vip access", "2 one on one meeting only", "24/7 active support", "join chat community", "Full Strategy Video Library"] },
  { slug: "mentorship-pro", kind: "mentorship", name: "PRO PLAN MENTORSHIP PROGRAM", priceUsd: "1499", durationMonths: 12, scansPerDay: 50, sortOrder: 4,
    description: "Learn professional charting, trading psychology, and risk management with 1-on-1 sessions and full resources.",
    features: ["Weekly 1-on-1 Coaching Calls", "Full Strategy Video Library", "Custom Indicator Suite Access", "24/7 Dedicated Mentor Q&A", "Free access to my VIP for 1 year"] },
];

// Signaux gratuits visibles sur la landing.
const free: (typeof s.signals.$inferInsert)[] = [
  { symbol: "XAUUSD", side: "SELL", entry: "4447.718", takeProfit: "4360.914", stopLoss: "4451.049", status: "tp_hit", pips: "868", note: "TP HIT", isFree: true },
  { symbol: "XAUUSD", side: "BUY", entry: "3961.121", takeProfit: "4027.280", stopLoss: "3956.594", status: "tp_hit", pips: "634", note: "USE PROPER RISK MANAGEMENT", isFree: true, isFeatured: true },
  { symbol: "EURUSD", side: "BUY", entry: "1.0850", takeProfit: "1.0900", stopLoss: "1.0800", status: "active", isFree: false },
  { symbol: "BTCUSD", side: "SELL", entry: "65400", takeProfit: "63000", stopLoss: "66200", status: "active", isFree: false },
];
// Historique fictif déterministe pour alimenter le track record.
const symbols = ["XAUUSD", "EURUSD", "GBPUSD", "BTCUSD"], setups = ["SMC Professional", "FVG Rebalance + Sweep", "Break of Structure"];
const history: (typeof s.signals.$inferInsert)[] = Array.from({ length: 40 }, (_, i) => {
  const win = i % 5 < 3;
  const base = 1 + (i % 4) * 0.1;
  return { symbol: symbols[i % 4], side: i % 2 ? "BUY" : "SELL", entry: String(base), takeProfit: String(base + 0.005), stopLoss: String(base - 0.003),
    status: win ? "tp_hit" : "sl_hit", pips: String(win ? 50 + (i % 7) * 8 : -(30 + (i % 5) * 4)), setup: setups[i % 3],
    createdAt: new Date(Date.now() - (i + 5) * 86_400_000) };
});

async function main() {
  await db.insert(s.packages).values(packages).onConflictDoNothing();
  if ((await db.select().from(s.signals).limit(1)).length === 0) await db.insert(s.signals).values([...free, ...history]);
  if ((await db.select().from(s.strategies).limit(1)).length === 0) {
    await db.insert(s.strategies).values({
      name: "CyberAFX Gold Scalper Pro", asset: "XAUUSD", magic: 987658, avgMonthlyPct: "98.6", winRatePct: "67.4", profitFactor: "2.18", maxDdPct: "10", expectancyR: "0.52", minCapital: 250,
      description: "High-frequency precision scalping algorithm focused on Gold liquidity grabs.", prices: { monthly: 29.99, quarterly: 79.99, yearly: 249.99, lifetime: 499.99 },
    });
  }
  if ((await db.select().from(s.communities).limit(1)).length === 0) {
    await db.insert(s.communities).values([
      { name: "CYBERAFX PRIVATE", type: "private", monthlyPriceUsd: "200" },
      { name: "CYBERAFX PUBLIC", type: "public" },
    ]);
  }
  if ((await db.select().from(s.pools).limit(1)).length === 0) {
    await db.insert(s.pools).values({
      name: "Institutional Gold Pool #1", description: "Pool de capital géré sur compte maître XAUUSD.", targetUsd: "50000", minPledgeUsd: "500", profitSharePct: "70",
      brokerServer: "Exness-MT5Real8", brokerLogin: "12345678", investorPassword: "demo-investor-pass",
    });
  }
  console.log("Seed OK");
}
main().catch((e) => { console.error(e); process.exit(1); });
