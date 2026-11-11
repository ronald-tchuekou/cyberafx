"use server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, signals } from "@/db";
import { createAction } from "@/lib/action";
import { notify } from "@/features/notifications/server/notify";
import { signalFormSchema } from "../schemas";

export const saveSignal = createAction(signalFormSchema, async ({ id, ...v }) => {
  if (id) return void (await db.update(signals).set(v).where(eq(signals.id, id)));
  await db.insert(signals).values(v);
  if (!v.isFree) await notify(null, `Nouveau signal ${v.symbol} ${v.side}`, `Entry ${v.entry} · TP ${v.takeProfit} · SL ${v.stopLoss}`);
}, { admin: true });

export const deleteSignal = createAction(z.object({ id: z.uuid() }), async ({ id }) => {
  await db.delete(signals).where(eq(signals.id, id));
}, { admin: true });
