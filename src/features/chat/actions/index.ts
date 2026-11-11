"use server";
import { and, count, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { communityMembers, communityMessages, db, supportMessages } from "@/db";
import { ActionError, createAction } from "@/lib/action";
import { messageSchema } from "../schemas";

const MAX_PER_WINDOW = 5; // messages
const WINDOW_MS = 10_000;
const tooFast = () => new ActionError("Doucement : trop de messages en peu de temps.");

/** Utilisateur : écrit dans son propre fil. Admin : répond dans le fil de `userId`. */
export const sendSupportMessage = createAction(messageSchema.extend({ userId: z.string().optional() }), async ({ body, userId }, user) => {
  if (user.role === "admin" && userId) await db.insert(supportMessages).values({ userId, body, fromAdmin: true });
  else {
    const [r] = await db.select({ n: count() }).from(supportMessages)
      .where(and(eq(supportMessages.userId, user.id), eq(supportMessages.fromAdmin, false), gt(supportMessages.createdAt, new Date(Date.now() - WINDOW_MS))));
    if (r.n >= MAX_PER_WINDOW) throw tooFast();
    await db.insert(supportMessages).values({ userId: user.id, body });
  }
});

export const sendCommunityMessage = createAction(messageSchema.extend({ communityId: z.uuid() }), async ({ communityId, body }, user) => {
  if (user.role !== "admin") {
    const [m] = await db.select().from(communityMembers)
      .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, user.id), eq(communityMembers.status, "active")));
    if (!m) throw new ActionError("Vous n'êtes pas membre de cette communauté.");
  }
  const [r] = await db.select({ n: count() }).from(communityMessages)
    .where(and(eq(communityMessages.userId, user.id), gt(communityMessages.createdAt, new Date(Date.now() - WINDOW_MS))));
  if (r.n >= MAX_PER_WINDOW) throw tooFast();
  await db.insert(communityMessages).values({ communityId, userId: user.id, body });
});
