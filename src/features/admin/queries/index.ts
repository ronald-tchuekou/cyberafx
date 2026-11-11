import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import {
  communities, communityMembers, db, packages, poolPledges, pools, strategies, strategySubscriptions, subscriptions, supportMessages, users, signals,
} from "@/db";

export async function getOverview() {
  const [[u], [s], [pending], [rev], [sig]] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(users),
    db.select({ n: sql<number>`count(*)::int` }).from(subscriptions).where(eq(subscriptions.status, "active")),
    db.select({ n: sql<number>`count(*)::int` }).from(subscriptions).where(eq(subscriptions.status, "pending")),
    db.select({ n: sql<string>`coalesce(sum(${subscriptions.amountUsd}), 0)` }).from(subscriptions).where(eq(subscriptions.status, "active")),
    db.select({ n: sql<number>`count(*)::int` }).from(signals),
  ]);
  const [sp] = await db.select({ n: sql<number>`count(*)::int` }).from(strategySubscriptions).where(eq(strategySubscriptions.status, "pending"));
  const [pp] = await db.select({ n: sql<number>`count(*)::int` }).from(poolPledges).where(eq(poolPledges.status, "pending"));
  const [cp] = await db.select({ n: sql<number>`count(*)::int` }).from(communityMembers).where(eq(communityMembers.status, "pending"));
  return { users: u.n, activeSubs: s.n, pendingPayments: pending.n + sp.n + pp.n + cp.n, revenue: Number(rev.n), signals: sig.n };
}

export async function getPayments() {
  const [subs, strat, pledges, members] = await Promise.all([
    db.select({ sub: subscriptions, email: users.email, name: users.name, pkg: packages.name })
      .from(subscriptions).innerJoin(users, eq(users.id, subscriptions.userId)).innerJoin(packages, eq(packages.id, subscriptions.packageId))
      .orderBy(desc(subscriptions.createdAt)).limit(100),
    db.select({ sub: strategySubscriptions, email: users.email, name: strategies.name })
      .from(strategySubscriptions).innerJoin(users, eq(users.id, strategySubscriptions.userId)).innerJoin(strategies, eq(strategies.id, strategySubscriptions.strategyId))
      .where(eq(strategySubscriptions.status, "pending")),
    db.select({ pl: poolPledges, email: users.email, name: pools.name })
      .from(poolPledges).innerJoin(users, eq(users.id, poolPledges.userId)).innerJoin(pools, eq(pools.id, poolPledges.poolId))
      .where(eq(poolPledges.status, "pending")),
    db.select({ m: communityMembers, email: users.email, name: communities.name })
      .from(communityMembers).innerJoin(users, eq(users.id, communityMembers.userId)).innerJoin(communities, eq(communities.id, communityMembers.communityId))
      .where(eq(communityMembers.status, "pending")),
  ]);
  return { subs, strat, pledges, members };
}

/** Un fil par utilisateur ayant écrit, avec le dernier message. */
export async function listSupportThreads() {
  const rows = await db.select({ m: supportMessages, name: users.name, email: users.email })
    .from(supportMessages).innerJoin(users, eq(users.id, supportMessages.userId)).orderBy(desc(supportMessages.createdAt)).limit(300);
  const seen = new Map<string, (typeof rows)[number]>();
  for (const r of rows) if (!seen.has(r.m.userId)) seen.set(r.m.userId, r);
  return [...seen.values()];
}
