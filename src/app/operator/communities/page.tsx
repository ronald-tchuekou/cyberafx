import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { communities, db } from "@/db";
import { CommunityForm } from "@/features/communities/components/community-form";
import { ChatPanel } from "@/features/chat/components/chat-panel";
import { sendCommunityMessage } from "@/features/chat/actions";
import { usd } from "@/lib/format";

export const metadata: Metadata = { title: "Communities" };

export default async function CommunitiesAdmin({ searchParams }: PageProps<"/operator/communities">) {
  const { c } = await searchParams;
  const rows = await db.select().from(communities).orderBy(asc(communities.createdAt));
  const open = rows.find((r) => r.id === c);
  return (
    <>
      <PageHeader title="Communities" description="Canaux publics et privés. Les accès payants se valident dans Payments." actions={<CommunityForm />} />
      <Table>
        <TableHeader><TableRow>{["Nom", "Type", "Prix /mois", "", ""].map((h, i) => <TableHead key={i}>{h}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{rows.map((r) => (
          <TableRow key={r.id}><TableCell className="font-medium">{r.name}</TableCell><TableCell>{r.type}</TableCell><TableCell>{r.monthlyPriceUsd ? usd(r.monthlyPriceUsd) : "—"}</TableCell>
            <TableCell><Link className="text-xs text-link" href={`?c=${r.id}`}>Ouvrir le chat</Link></TableCell><TableCell className="text-right"><CommunityForm community={r} /></TableCell></TableRow>
        ))}</TableBody>
      </Table>
      {open && (
        <div className="mt-6 flex h-[28rem] flex-col overflow-hidden rounded-xl border bg-card">
          <p className="border-b px-4 py-2 text-sm font-bold">{open.name}</p>
          <ChatPanel key={open.id} url={`/api/chat/community/${open.id}`} send={sendCommunityMessage} extra={{ communityId: open.id }} />
        </div>
      )}
    </>
  );
}
