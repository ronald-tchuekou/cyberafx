import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, supportMessages } from "@/db";
import { getCurrentUser } from "@/features/auth/server/current-user";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "private, no-store" };

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse(null, { status: 401 });
  const asked = new URL(req.url).searchParams.get("userId");
  const threadOwner = user.role === "admin" && asked ? asked : user.id;
  const rows = await db.select().from(supportMessages).where(eq(supportMessages.userId, threadOwner)).orderBy(asc(supportMessages.createdAt)).limit(200);
  const viewerIsAdmin = user.role === "admin" && threadOwner !== user.id;
  return NextResponse.json(rows.map((m) => ({
    id: m.id, body: m.body, createdAt: m.createdAt, staff: m.fromAdmin,
    mine: viewerIsAdmin ? m.fromAdmin : !m.fromAdmin,
    author: m.fromAdmin ? "CyberAFX Support" : "Client",
  })), { headers: NO_STORE });
}
