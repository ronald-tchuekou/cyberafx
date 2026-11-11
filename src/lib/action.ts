import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_TAG } from "@/lib/cache";
import type { z } from "zod";
import { getCurrentUser, type AppUser } from "@/features/auth/server/current-user";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

/** Erreur "attendue" dont le message est affiché tel quel à l'utilisateur. */
export class ActionError extends Error {}

/**
 * Fabrique de server action : auth + rôle + validation Zod + revalidation.
 * Le même schéma Zod sert côté client (react-hook-form) et ici (confiance zéro).
 */
export function createAction<S extends z.ZodType>(
  schema: S,
  handler: (input: z.output<S>, user: AppUser) => Promise<string | void>,
  opts: { admin?: boolean } = {},
) {
  return async (input: unknown): Promise<ActionResult> => {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Session expirée, reconnectez-vous." };
    if (opts.admin && user.role !== "admin") return { ok: false, error: "Accès refusé." };
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
    try {
      const message = await handler(parsed.data, user);
      if (opts.admin) revalidateTag(PUBLIC_TAG, { expire: 0 }); // offres/signaux/réglages visibles par tous : effet immédiat
      revalidatePath("/", "layout");
      return { ok: true, message: message || undefined };
    } catch (e) {
      if (e instanceof ActionError) return { ok: false, error: e.message };
      console.error(e);
      return { ok: false, error: "Erreur serveur, réessayez." };
    }
  };
}
