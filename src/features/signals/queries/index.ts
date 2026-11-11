import "server-only";
import { desc, eq, isNotNull, ne, and } from "drizzle-orm";
import { db, signals } from "@/db";
import { cachedPublic } from "@/lib/cache";
import { computeStats } from "../lib/stats";

export type Signal = typeof signals.$inferSelect;

export const listFreeSignals = cachedPublic("signals:free", () =>
  db.select().from(signals).where(eq(signals.isFree, true)).orderBy(desc(signals.isFeatured), desc(signals.createdAt)).limit(6));

export const listSignals = (limit = 50) => db.select().from(signals).orderBy(desc(signals.createdAt)).limit(limit);

export async function getTrackRecord() {
  const rows = await db.select().from(signals)
    .where(and(ne(signals.status, "active"), isNotNull(signals.pips))).orderBy(signals.createdAt);
  return computeStats(rows.map((r) => ({ symbol: r.symbol, setup: r.setup, status: r.status, pips: Number(r.pips) })));
}
