import "server-only";
import { and, count, eq, gt } from "drizzle-orm";
import { db, paymentHashes } from "@/db";
import { ActionError } from "@/lib/action";

/**
 * Réserve un hash de transaction pour cet utilisateur (anti-rejeu + limite de débit).
 * À appeler juste avant d'enregistrer le paiement : le hash est consommé même si la demande est ensuite refusée.
 */
export async function claimTxHash(userId: string, txHash: string) {
  const [recent] = await db.select({ n: count() }).from(paymentHashes)
    .where(and(eq(paymentHashes.userId, userId), gt(paymentHashes.createdAt, new Date(Date.now() - 60_000))));
  if (recent.n >= 3) throw new ActionError("Trop de soumissions, réessayez dans une minute.");
  const claimed = await db.insert(paymentHashes).values({ hash: txHash.toLowerCase().replace(/^0x/, ""), userId }).onConflictDoNothing().returning({ hash: paymentHashes.hash });
  if (!claimed.length) throw new ActionError("Ce hash de transaction a déjà été utilisé.");
}
