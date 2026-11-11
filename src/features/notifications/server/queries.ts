import "server-only";
import { desc, eq, isNull, or } from "drizzle-orm";
import { db, notifications } from "@/db";

export const listNotifications = (userId: string) =>
  db.select().from(notifications).where(or(eq(notifications.userId, userId), isNull(notifications.userId))).orderBy(desc(notifications.createdAt)).limit(15);
