"use server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, packages, subscriptions } from "@/db";
import { ActionError, createAction } from "@/lib/action";
import { notify } from "@/features/notifications/server/notify";

export const reviewSubscription = createAction(
  z.object({ id: z.uuid(), approve: z.boolean(), note: z.string().trim().optional() }),
  async ({ id, approve, note }) => {
    const [row] = await db.select({ sub: subscriptions, pkg: packages }).from(subscriptions)
      .innerJoin(packages, eq(subscriptions.packageId, packages.id)).where(eq(subscriptions.id, id));
    if (!row || row.sub.status !== "pending") throw new ActionError("Paiement déjà traité.");
    const pending = and(eq(subscriptions.id, id), eq(subscriptions.status, "pending")); // mise à jour atomique : un seul gagnant en cas de double clic
    if (approve) {
      const startsAt = new Date();
      const expiresAt = new Date(startsAt);
      expiresAt.setMonth(expiresAt.getMonth() + row.pkg.durationMonths);
      const done = await db.update(subscriptions).set({ status: "active", startsAt, expiresAt, reviewNote: note }).where(pending).returning({ id: subscriptions.id });
      if (!done.length) throw new ActionError("Paiement déjà traité.");
      await notify(row.sub.userId, "Abonnement activé", `${row.pkg.name} est maintenant actif.`);
    } else {
      const done = await db.update(subscriptions).set({ status: "rejected", reviewNote: note }).where(pending).returning({ id: subscriptions.id });
      if (!done.length) throw new ActionError("Paiement déjà traité.");
      await notify(row.sub.userId, "Paiement refusé", `${row.pkg.name} : ${note || "transaction non vérifiée"}.`);
    }
    return approve ? "Abonnement activé." : "Paiement refusé.";
  },
  { admin: true },
);
