import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db, users } from "@/db";
import { env } from "@/env";

export type AppUser = typeof users.$inferSelect;

const isListedAdmin = (email: string) => env.ADMIN_EMAILS.includes(email.toLowerCase());

/**
 * Un email ne donne le rôle admin que s'il est vérifié chez Clerk :
 * sinon quiconque s'inscrirait avec l'adresse d'un admin pourrait s'octroyer ses droits.
 */
const hasVerifiedEmail = (cu: Awaited<ReturnType<typeof currentUser>>) => cu?.primaryEmailAddress?.verification?.status === "verified";

/** Utilisateur DB lié à la session Clerk (créé à la volée). null si non connecté. */
export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const { userId } = await auth();
  if (!userId) return null;

  const [existing] = await db.select().from(users).where(eq(users.id, userId));
  if (existing) {
    // ADMIN_EMAILS reste la source pour promouvoir un compte existant (jamais de rétrogradation).
    if (existing.role !== "admin" && isListedAdmin(existing.email) && hasVerifiedEmail(await currentUser())) {
      const [promoted] = await db.update(users).set({ role: "admin" }).where(eq(users.id, userId)).returning();
      return promoted;
    }
    return existing;
  }

  const cu = await currentUser();
  const email = cu?.primaryEmailAddress?.emailAddress ?? "";
  const name = [cu?.firstName, cu?.lastName].filter(Boolean).join(" ") || cu?.username || email.split("@")[0];
  const [created] = await db
    .insert(users)
    .values({
      id: userId,
      email,
      name,
      username: `trader_${Math.floor(10_000_000 + Math.random() * 89_999_999)}`,
      role: isListedAdmin(email) && hasVerifiedEmail(cu) ? "admin" : "user",
    })
    .onConflictDoNothing()
    .returning();
  return created ?? (await db.select().from(users).where(eq(users.id, userId)))[0];
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  return user;
}

/** Non-admin → renvoyé vers le portail client (comme la plateforme d'origine). */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/client");
  return user;
}
