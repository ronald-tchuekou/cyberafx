import "server-only";
import { db, notifications } from "@/db";

export const notify = (userId: string | null, title: string, body = "") =>
  db.insert(notifications).values({ userId, title, body });
