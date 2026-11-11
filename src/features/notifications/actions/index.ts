"use server";
import { createAction } from "@/lib/action";
import { broadcastSchema } from "../schemas";
import { notify } from "../server/notify";

export const sendBroadcast = createAction(broadcastSchema, async ({ title, body }) => {
  await notify(null, title, body);
  return "Notification envoyée à tous les utilisateurs.";
}, { admin: true });
