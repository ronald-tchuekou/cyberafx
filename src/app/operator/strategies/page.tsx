import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db, strategies } from "@/db";
import { StrategyForm } from "@/features/copytrading/components/strategy-form";
import { usd } from "@/lib/format";

export const metadata: Metadata = { title: "Copy Trading" };

export default async function StrategiesAdmin() {
  const rows = await db.select().from(strategies).orderBy(desc(strategies.createdAt));
  return (
    <>
      <PageHeader title="Copy Trading" description="Stratégies autopilot proposées aux clients." actions={<StrategyForm />} />
      <Table>
        <TableHeader><TableRow>{["Nom", "Actif", "Magic", "Win rate", "Mensuel", "Prix /mois", "Statut", ""].map((h) => <TableHead key={h}>{h || <span className="sr-only">Actions</span>}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{rows.map((s) => (
          <TableRow key={s.id}><TableCell className="font-medium">{s.name}</TableCell><TableCell>{s.asset}</TableCell><TableCell>#{s.magic}</TableCell><TableCell>{Number(s.winRatePct)}%</TableCell><TableCell>+{Number(s.avgMonthlyPct)}%</TableCell>
            <TableCell>{usd(s.prices.monthly, 2)}</TableCell><TableCell><StatusBadge status={s.isActive ? "active" : "closed"} /></TableCell><TableCell className="text-right"><StrategyForm strategy={s} /></TableCell></TableRow>
        ))}</TableBody>
      </Table>
    </>
  );
}
