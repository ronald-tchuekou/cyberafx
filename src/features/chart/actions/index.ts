"use server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { chartScans, db } from "@/db";
import { ActionError, createAction } from "@/lib/action";
import { getScanUsage, scanDay } from "../queries";

/** Consomme un scan du quota journalier ; l'analyse elle-même tourne ensuite côté client. */
export const consumeScan = createAction(z.object({}), async (_, user) => {
  const { used, limit } = await getScanUsage(user.id);
  if (limit !== null && used >= limit) {
    throw new ActionError(limit === 0 ? "Free preview épuisé : abonnez-vous pour scanner." : `Limite de ${limit} scans/jour atteinte.`);
  }
  await db.insert(chartScans).values({ userId: user.id, day: scanDay(), count: 1 })
    .onConflictDoUpdate({ target: [chartScans.userId, chartScans.day], set: { count: sql`${chartScans.count} + 1` } });
});
