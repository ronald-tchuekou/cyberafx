"use server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, strategies, strategySubscriptions } from "@/db";
import { ActionError, createAction } from "@/lib/action";
import { notify } from "@/features/notifications/server/notify";
import { paymentSchema } from "@/features/payments/schemas";
import { claimTxHash } from "@/features/payments/server/claim-hash";
import { PLANS, brokerSchema, strategyFormSchema } from "../schemas";

export const subscribeStrategy = createAction(
  paymentSchema.extend({ strategyId: z.uuid(), plan: z.enum(PLANS) }),
  async ({ strategyId, plan, txHash }, user) => {
    const [s] = await db.select().from(strategies).where(eq(strategies.id, strategyId));
    if (!s) throw new ActionError("Stratégie introuvable.");
    const [existing] = await db.select().from(strategySubscriptions)
      .where(and(eq(strategySubscriptions.userId, user.id), eq(strategySubscriptions.strategyId, strategyId)));
    if (existing && existing.status !== "rejected" && existing.status !== "expired") throw new ActionError("Abonnement déjà en cours ou actif.");
    await claimTxHash(user.id, txHash);
    const values = { plan, txHash, status: "pending" as const };
    if (existing) await db.update(strategySubscriptions).set(values).where(eq(strategySubscriptions.id, existing.id));
    else await db.insert(strategySubscriptions).values({ userId: user.id, strategyId, ...values });
    return "Paiement soumis. Un opérateur va le vérifier.";
  },
);

/** Connexion broker simulée : on stocke les identifiants du compte, sans appel Exness. */
export const connectBroker = createAction(brokerSchema, async ({ strategyId, brokerLogin, brokerServer }, user) => {
  const [sub] = await db.select().from(strategySubscriptions)
    .where(and(eq(strategySubscriptions.userId, user.id), eq(strategySubscriptions.strategyId, strategyId)));
  if (sub?.status !== "active") throw new ActionError("Abonnez-vous d'abord à cette stratégie.");
  await db.update(strategySubscriptions).set({ brokerLogin, brokerServer }).where(eq(strategySubscriptions.id, sub.id));
  return "Compte broker enregistré. L'autopilot démarrera à la prochaine validation de l'opérateur.";
});

export const saveStrategy = createAction(strategyFormSchema, async ({ id, priceMonthly, priceQuarterly, priceYearly, priceLifetime, ...v }) => {
  const row = { ...v, prices: { monthly: priceMonthly, quarterly: priceQuarterly, yearly: priceYearly, lifetime: priceLifetime } };
  if (id) await db.update(strategies).set(row).where(eq(strategies.id, id));
  else await db.insert(strategies).values(row);
}, { admin: true });

export const reviewStrategySub = createAction(z.object({ id: z.uuid(), approve: z.boolean() }), async ({ id, approve }) => {
  const [sub] = await db.update(strategySubscriptions).set({ status: approve ? "active" : "rejected" })
    .where(and(eq(strategySubscriptions.id, id), eq(strategySubscriptions.status, "pending"))).returning();
  if (!sub) throw new ActionError("Déjà traité.");
  await notify(sub.userId, approve ? "Copy trading activé" : "Paiement copy trading refusé", "Stratégie autopilot");
  return approve ? "Activé." : "Refusé.";
}, { admin: true });
