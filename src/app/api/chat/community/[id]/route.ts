import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { communityMembers, communityMessages, db, users } from "@/db";
import { getCurrentUser } from "@/features/auth/server/current-user";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "private, no-store" };

export async function GET(_: Request, { params }: RouteContext<"/api/chat/community/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return new NextResponse(null, { status: 401 });
  if (!z.uuid().safeParse(id).success) return new NextResponse(null, { status: 404 });
  if (user.role !== "admin") {
    const [m] = await db.select().from(communityMembers)
      .where(and(eq(communityMembers.communityId, id), eq(communityMembers.userId, user.id), eq(communityMembers.status, "active")));
    if (!m) return new NextResponse(null, { status: 403 });
  }
  const rows = await db
    .select({ m: communityMessages, name: users.name, handle: users.username, role: users.role })
    .from(communityMessages).innerJoin(users, eq(users.id, communityMessages.userId))
    .where(eq(communityMessages.communityId, id)).orderBy(asc(communityMessages.createdAt)).limit(200);
  return NextResponse.json(rows.map(({ m, name, handle, role }) => ({
    id: m.id, body: m.body, createdAt: m.createdAt, mine: m.userId === user.id,
    author: handle ? `@${handle}` : name, staff: role === "admin",
  })), { headers: NO_STORE });
}
