"use server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { communities, communityMembers, db, users } from "@/db";
import { ActionError, createAction } from "@/lib/action";
import { notify } from "@/features/notifications/server/notify";
import { paymentSchema } from "@/features/payments/schemas";
import { claimTxHash } from "@/features/payments/server/claim-hash";
import { communityFormSchema, usernameSchema } from "../schemas";

const ids = z.object({ communityId: z.uuid() });

export const joinPublicCommunity = createAction(ids, async ({ communityId }, user) => {
  const [c] = await db.select().from(communities).where(eq(communities.id, communityId));
  if (c?.type !== "public") throw new ActionError("Communauté introuvable.");
  await db.insert(communityMembers).values({ communityId, userId: user.id, status: "active" }).onConflictDoNothing();
  return "Bienvenue dans la communauté !";
});

export const requestPrivateAccess = createAction(paymentSchema.extend(ids.shape), async ({ communityId, txHash }, user) => {
  const [c] = await db.select().from(communities).where(eq(communities.id, communityId));
  if (c?.type !== "private") throw new ActionError("Communauté introuvable.");
  const [m] = await db.select().from(communityMembers).where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, user.id)));
  if (m && m.status !== "rejected") throw new ActionError("Demande déjà envoyée ou accès actif.");
  await claimTxHash(user.id, txHash);
  if (m) await db.update(communityMembers).set({ status: "pending", txHash }).where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, user.id)));
  else await db.insert(communityMembers).values({ communityId, userId: user.id, status: "pending", txHash });
  return "Paiement soumis. Un opérateur va le vérifier.";
});

export const updateUsername = createAction(usernameSchema, async ({ username }, user) => {
  const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.username, username));
  if (taken && taken.id !== user.id) throw new ActionError("Ce pseudo est déjà pris.");
  await db.update(users).set({ username }).where(eq(users.id, user.id));
  return "Profil mis à jour.";
});

export const saveCommunity = createAction(communityFormSchema, async ({ id, ...v }) => {
  if (id) await db.update(communities).set(v).where(eq(communities.id, id));
  else await db.insert(communities).values(v);
}, { admin: true });

export const reviewMembership = createAction(ids.extend({ userId: z.string(), approve: z.boolean() }), async ({ communityId, userId, approve }) => {
  const [m] = await db.update(communityMembers).set({ status: approve ? "active" : "rejected" })
    .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, userId), eq(communityMembers.status, "pending"))).returning();
  if (!m) throw new ActionError("Déjà traité.");
  await notify(userId, approve ? "Accès communauté activé" : "Accès communauté refusé");
  return approve ? "Accès activé." : "Refusé.";
}, { admin: true });
