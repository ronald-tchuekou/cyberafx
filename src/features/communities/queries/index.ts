import "server-only";
import { asc, eq } from "drizzle-orm";
import { communities, communityMembers, db } from "@/db";

export async function listCommunitiesFor(userId: string) {
  const [all, mine] = await Promise.all([
    db.select().from(communities).orderBy(asc(communities.createdAt)),
    db.select().from(communityMembers).where(eq(communityMembers.userId, userId)),
  ]);
  return all.map((c) => ({ community: c, status: mine.find((m) => m.communityId === c.id)?.status ?? null }));
}
