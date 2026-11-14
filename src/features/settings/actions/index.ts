"use server";
import { db, settings } from "@/db";
import { createAction } from "@/lib/action";
import { landingGridSchema, paymentMethodsSchema, settingsSchema } from "../schemas";

export const saveSettings = createAction(settingsSchema, async (v) => {
  for (const [key, value] of Object.entries(v)) {
    await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } });
  }
}, { admin: true });

export const savePaymentMethods = createAction(paymentMethodsSchema, async ({ methods }) => {
  const value = JSON.stringify(methods);
  await db.insert(settings).values({ key: "paymentMethods", value }).onConflictDoUpdate({ target: settings.key, set: { value } });
}, { admin: true });

export const saveLandingGrid = createAction(landingGridSchema, async (v) => {
  const value = JSON.stringify(v);
  await db.insert(settings).values({ key: "landingGrid", value }).onConflictDoUpdate({ target: settings.key, set: { value } });
}, { admin: true });
