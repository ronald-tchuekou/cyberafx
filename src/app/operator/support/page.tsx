import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { listSupportThreads } from "@/features/admin/queries";
import { sendSupportMessage } from "@/features/chat/actions";
import { ChatPanel } from "@/features/chat/components/chat-panel";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Support Desk" };

export default async function SupportAdmin({ searchParams }: PageProps<"/operator/support">) {
  const { u } = await searchParams;
  const threads = await listSupportThreads();
  const current = threads.find((t) => t.m.userId === u);
  return (
    <>
      <PageHeader title="Support Desk" description="Messages envoyés depuis le widget Live Support." />
      <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
        <ul className="space-y-1">
          {threads.length === 0 && <li className="text-sm text-muted-foreground">Aucun message.</li>}
          {threads.map((t) => (
            <li key={t.m.userId}><Link href={`?u=${t.m.userId}`} className={cn("block rounded-lg border px-3 py-2 hover:bg-muted", t.m.userId === u && "border-primary bg-primary/10")}>
              <p className="text-sm font-semibold">{t.name || t.email}</p><p className="truncate text-xs text-muted-foreground">{t.m.fromAdmin ? "Vous : " : ""}{t.m.body}</p><p className="text-[11px] text-muted-foreground">{timeAgo(t.m.createdAt)}</p>
            </Link></li>
          ))}
        </ul>
        <div className="flex h-[32rem] flex-col overflow-hidden rounded-xl border bg-card">
          {current ? (
            <>
              <p className="border-b px-4 py-2 text-sm font-bold">{current.name} <span className="font-normal text-muted-foreground">{current.email}</span></p>
              <ChatPanel key={u as string} url={`/api/chat/support?userId=${current.m.userId}`} send={sendSupportMessage} extra={{ userId: current.m.userId }} placeholder="Répondre au client…" />
            </>
          ) : <p className="m-auto text-sm text-muted-foreground">Sélectionnez une conversation.</p>}
        </div>
      </div>
    </>
  );
}
