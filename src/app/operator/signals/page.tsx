import type { Metadata } from "next";
import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteSignal } from "@/features/signals/actions";
import { SignalForm } from "@/features/signals/components/signal-form";
import { listSignals } from "@/features/signals/queries";
import { dateFr } from "@/lib/format";

export const metadata: Metadata = { title: "Signals" };

export default async function SignalsAdmin() {
  const rows = await listSignals(200);
  return (
    <>
      <PageHeader title="Signals" description="Publiez les signaux, résolvez-les avec leur résultat en pips : le track record est calculé automatiquement." actions={<SignalForm />} />
      <Table>
        <TableHeader><TableRow>{["Date", "Symbole", "Sens", "Entry", "TP", "SL", "Statut", "Pips", "Visibilité", ""].map((h) => <TableHead key={h}>{h || <span className="sr-only">Actions</span>}</TableHead>)}</TableRow></TableHeader>
        <TableBody>
          {rows.map((s) => (
            <TableRow key={s.id}><TableCell className="text-xs">{dateFr(s.createdAt)}</TableCell><TableCell className="font-semibold">{s.symbol}</TableCell><TableCell>{s.side}</TableCell>
              <TableCell>{Number(s.entry)}</TableCell><TableCell>{Number(s.takeProfit)}</TableCell><TableCell>{Number(s.stopLoss)}</TableCell><TableCell><StatusBadge status={s.status} /></TableCell>
              <TableCell>{s.pips ? Number(s.pips) : "—"}</TableCell><TableCell>{s.isFree ? "Gratuit + landing" : "VIP"}</TableCell>
              <TableCell className="flex justify-end gap-1"><SignalForm signal={s} /><ActionButton action={deleteSignal} args={{ id: s.id }} variant="ghost" confirm="Supprimer ce signal ?">Suppr.</ActionButton></TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
