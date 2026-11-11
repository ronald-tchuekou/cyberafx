import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db, poolPledges, pools } from "@/db";

export async function listPoolsFor(userId: string) {
  const [all, pledges, raised] = await Promise.all([
    db.select().from(pools).orderBy(desc(pools.createdAt)),
    db.select().from(poolPledges).where(eq(poolPledges.userId, userId)),
    db.select({ poolId: poolPledges.poolId, total: sql<string>`coalesce(sum(${poolPledges.amountUsd}), 0)` })
      .from(poolPledges).where(eq(poolPledges.status, "active")).groupBy(poolPledges.poolId),
  ]);
  const raisedBy = new Map(raised.map((r) => [r.poolId, Number(r.total)]));
  const view = all.map((p) => {
    const mine = pledges.filter((x) => x.poolId === p.id);
    const approved = mine.some((x) => x.status === "active");
    // Les identifiants broker ne quittent le serveur que pour un investisseur approuvé.
    const { investorPassword, brokerLogin, ...safe } = p;
    return { pool: safe, raised: raisedBy.get(p.id) ?? 0, mine, credentials: approved ? { login: brokerLogin, password: investorPassword } : null };
  });
  return {
    mine: view.filter((v) => v.mine.some((x) => x.status !== "rejected")),
    open: view.filter((v) => v.pool.status === "open"),
  };
}
