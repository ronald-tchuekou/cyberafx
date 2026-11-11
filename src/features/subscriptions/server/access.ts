import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { cache } from "react";
import { db, packages, subscriptions } from "@/db";

export const FREE_PREVIEW_SCANS = 0;

/** Forfaits actifs de l'utilisateur et droits dérivés (signaux, scans IA / jour). */
export const getAccess = cache(async (userId: string) => {
  const active = await db
    .select({ sub: subscriptions, pkg: packages })
    .from(subscriptions)
    .innerJoin(packages, eq(subscriptions.packageId, packages.id))
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"), gt(subscriptions.expiresAt, new Date())));
  const vip = active.length > 0;
  const unlimited = active.some((a) => a.pkg.scansPerDay == null);
  const scansLimit = unlimited ? null : Math.max(FREE_PREVIEW_SCANS, ...active.map((a) => a.pkg.scansPerDay ?? 0));
  return { active, vip, scansLimit };
});
