"use server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, packages, subscriptions } from "@/db";
import { ActionError, createAction } from "@/lib/action";
import { paymentSchema } from "@/features/payments/schemas";
import { claimTxHash } from "@/features/payments/server/claim-hash";
import { packageFormSchema } from "../schemas";

export const submitPackagePayment = createAction(
  paymentSchema.extend({ packageId: z.uuid() }),
  async ({ packageId, txHash }, user) => {
    const [pkg] = await db.select().from(packages).where(and(eq(packages.id, packageId), eq(packages.isActive, true)));
    if (!pkg) throw new ActionError("Offre introuvable.");
    const [pending] = await db.select({ id: subscriptions.id }).from(subscriptions)
      .where(and(eq(subscriptions.userId, user.id), eq(subscriptions.packageId, packageId), eq(subscriptions.status, "pending")));
    if (pending) throw new ActionError("Un paiement est déjà en attente de validation pour cette offre.");
    await claimTxHash(user.id, txHash);
    await db.insert(subscriptions).values({ userId: user.id, packageId, txHash, amountUsd: pkg.priceUsd });
    return "Paiement soumis. Un opérateur va le vérifier.";
  },
);

export const savePackage = createAction(packageFormSchema, async ({ id, ...v }) => {
  if (id) await db.update(packages).set(v).where(eq(packages.id, id));
  else await db.insert(packages).values(v);
}, { admin: true });

export const deletePackage = createAction(z.object({ id: z.uuid() }), async ({ id }) => {
  await db.update(packages).set({ isActive: false }).where(eq(packages.id, id)); // archivage : l'historique reste
  return "Offre archivée.";
}, { admin: true });
