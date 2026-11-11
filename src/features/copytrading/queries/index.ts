import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, strategies, strategySubscriptions } from "@/db";

export type Strategy = typeof strategies.$inferSelect;

export async function listStrategiesFor(userId: string) {
  const [all, mine] = await Promise.all([
    db.select().from(strategies).where(eq(strategies.isActive, true)).orderBy(desc(strategies.createdAt)),
    db.select().from(strategySubscriptions).where(eq(strategySubscriptions.userId, userId)),
  ]);
  return all.map((s) => ({ strategy: s, sub: mine.find((m) => m.strategyId === s.id) ?? null }));
}
