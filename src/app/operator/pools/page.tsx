import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db, pools } from "@/db";
import { PoolForm } from "@/features/pools/components/pool-form";
import { usd } from "@/lib/format";

export const metadata: Metadata = { title: "Trade Pools" };

export default async function PoolsAdmin() {
  const rows = await db.select().from(pools).orderBy(desc(pools.createdAt));
  return (
    <>
      <PageHeader title="Trade Pools" description="Pools de capital ; les engagements se valident dans Payments." actions={<PoolForm />} />
      <Table>
        <TableHeader><TableRow>{["Nom", "Objectif", "Min", "Profit share", "Serveur", "Statut", ""].map((h) => <TableHead key={h}>{h || <span className="sr-only">Actions</span>}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{rows.map((p) => (
          <TableRow key={p.id}><TableCell className="font-medium">{p.name}</TableCell><TableCell>{usd(p.targetUsd)}</TableCell><TableCell>{usd(p.minPledgeUsd)}</TableCell><TableCell>{Number(p.profitSharePct)}%</TableCell>
            <TableCell>{p.brokerServer}</TableCell><TableCell><StatusBadge status={p.status} /></TableCell><TableCell className="text-right"><PoolForm pool={p} /></TableCell></TableRow>
        ))}</TableBody>
      </Table>
    </>
  );
}
