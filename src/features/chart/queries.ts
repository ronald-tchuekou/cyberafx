import "server-only";
import { and, eq } from "drizzle-orm";
import { chartScans, db } from "@/db";
import { getAccess } from "@/features/subscriptions/server/access";

export const scanDay = () => new Date().toISOString().slice(0, 10);

export async function getScanUsage(userId: string) {
  const [[row], access] = await Promise.all([
    db.select().from(chartScans).where(and(eq(chartScans.userId, userId), eq(chartScans.day, scanDay()))),
    getAccess(userId),
  ]);
  return { used: row?.count ?? 0, limit: access.scansLimit, vip: access.vip };
}
