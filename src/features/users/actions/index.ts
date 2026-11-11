"use server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, users } from "@/db";
import { ActionError, createAction } from "@/lib/action";

export const setUserRole = createAction(z.object({ userId: z.string(), role: z.enum(["admin", "user"]) }), async ({ userId, role }, me) => {
  if (userId === me.id) throw new ActionError("Vous ne pouvez pas modifier votre propre rôle.");
  await db.update(users).set({ role }).where(eq(users.id, userId));
  return `Rôle : ${role}`;
}, { admin: true });
