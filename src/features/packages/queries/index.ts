import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db, packages } from "@/db";
import { cachedPublic } from "@/lib/cache";

export type Package = typeof packages.$inferSelect;

export const listPackages = cachedPublic("packages:active", (kind?: Package["kind"]) =>
  db.select().from(packages)
    .where(and(eq(packages.isActive, true), kind ? eq(packages.kind, kind) : undefined))
    .orderBy(asc(packages.sortOrder)));

export const listAllPackages = () => db.select().from(packages).orderBy(asc(packages.sortOrder));
