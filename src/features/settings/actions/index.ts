"use server";
import { db, settings } from "@/db";
import { createAction } from "@/lib/action";
import { settingsSchema } from "../schemas";

export const saveSettings = createAction(settingsSchema, async (v) => {
  for (const [key, value] of Object.entries(v)) {
    await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } });
  }
}, { admin: true });
