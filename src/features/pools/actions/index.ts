"use server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, poolPledges, pools } from "@/db";
import { ActionError, createAction } from "@/lib/action";
import { notify } from "@/features/notifications/server/notify";
import { paymentSchema } from "@/features/payments/schemas";
import { claimTxHash } from "@/features/payments/server/claim-hash";
import { poolFormSchema } from "../schemas";

export const pledgeToPool = createAction(
  paymentSchema.extend({ poolId: z.uuid(), amountUsd: z.coerce.number().positive("Montant invalide").max(10_000_000, "Montant trop élevé") }),
  async ({ poolId, amountUsd, txHash }, user) => {
    const [p] = await db.select().from(pools).where(eq(pools.id, poolId));
    if (!p || p.status !== "open") throw new ActionError("Pool fermé ou introuvable.");
    if (amountUsd < Number(p.minPledgeUsd)) throw new ActionError(`Engagement minimum : ${p.minPledgeUsd} $.`);
    await claimTxHash(user.id, txHash);
    await db.insert(poolPledges).values({ poolId, userId: user.id, amountUsd: String(amountUsd), txHash });
    return "Engagement soumis. Les identifiants investisseur seront révélés après validation.";
  },
);

export const savePool = createAction(poolFormSchema, async ({ id, ...v }) => {
  if (id) await db.update(pools).set(v).where(eq(pools.id, id));
  else await db.insert(pools).values(v);
}, { admin: true });

export const reviewPledge = createAction(z.object({ id: z.uuid(), approve: z.boolean() }), async ({ id, approve }) => {
  const [pl] = await db.update(poolPledges).set({ status: approve ? "active" : "rejected" })
    .where(and(eq(poolPledges.id, id), eq(poolPledges.status, "pending"))).returning();
  if (!pl) throw new ActionError("Déjà traité.");
  await notify(pl.userId, approve ? "Engagement pool validé" : "Engagement pool refusé", approve ? "Vos identifiants investisseur sont disponibles." : "");
  return approve ? "Validé." : "Refusé.";
}, { admin: true });
