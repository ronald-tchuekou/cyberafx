import type { Metadata } from "next";
import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPayments } from "@/features/admin/queries";
import { reviewMembership } from "@/features/communities/actions";
import { reviewStrategySub } from "@/features/copytrading/actions";
import { reviewPledge } from "@/features/pools/actions";
import { reviewSubscription } from "@/features/subscriptions/actions";
import { dateFr, usd } from "@/lib/format";

export const metadata: Metadata = { title: "Payments" };

const Hash = ({ h }: { h: string | null }) => <code className="block max-w-[10rem] truncate text-[11px]" title={h ?? ""}>{h}</code>;

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return <section className="mb-8"><h2 className="mb-2 text-sm font-bold">{title} <span className="text-muted-foreground">({count})</span></h2>{count === 0 ? <p className="text-xs text-muted-foreground">Rien à traiter.</p> : children}</section>;
}
const Head = ({ cols }: { cols: string[] }) => <TableHeader><TableRow>{cols.map((c) => <TableHead key={c}>{c}</TableHead>)}</TableRow></TableHeader>;

export default async function PaymentsAdmin() {
  const { subs, strat, pledges, members } = await getPayments();
  const pending = subs.filter((s) => s.sub.status === "pending");
  return (
    <>
      <PageHeader title="Payments" description="Validez les hash USDT reçus : l'accès est activé à l'approbation." />
      <Section title="Abonnements en attente" count={pending.length}>
        <Table><Head cols={["Client", "Offre", "Montant", "TxID", "Date", ""]} /><TableBody>
          {pending.map(({ sub, email, pkg }) => (
            <TableRow key={sub.id}><TableCell>{email}</TableCell><TableCell>{pkg}</TableCell><TableCell>{usd(sub.amountUsd, 2)}</TableCell><TableCell><Hash h={sub.txHash} /></TableCell><TableCell>{dateFr(sub.createdAt)}</TableCell>
              <TableCell className="flex justify-end gap-1"><ActionButton action={reviewSubscription} args={{ id: sub.id, approve: true }} variant="default">Approuver</ActionButton><ActionButton action={reviewSubscription} args={{ id: sub.id, approve: false, note: "Transaction non vérifiée" }} variant="destructive">Refuser</ActionButton></TableCell></TableRow>
          ))}
        </TableBody></Table>
      </Section>
      <Section title="Copy trading en attente" count={strat.length}>
        <Table><Head cols={["Client", "Stratégie", "Plan", "TxID", ""]} /><TableBody>
          {strat.map(({ sub, email, name }) => (
            <TableRow key={sub.id}><TableCell>{email}</TableCell><TableCell>{name}</TableCell><TableCell>{sub.plan}</TableCell><TableCell><Hash h={sub.txHash} /></TableCell>
              <TableCell className="flex justify-end gap-1"><ActionButton action={reviewStrategySub} args={{ id: sub.id, approve: true }} variant="default">Approuver</ActionButton><ActionButton action={reviewStrategySub} args={{ id: sub.id, approve: false }} variant="destructive">Refuser</ActionButton></TableCell></TableRow>
          ))}
        </TableBody></Table>
      </Section>
      <Section title="Engagements de pools en attente" count={pledges.length}>
        <Table><Head cols={["Client", "Pool", "Montant", "TxID", ""]} /><TableBody>
          {pledges.map(({ pl, email, name }) => (
            <TableRow key={pl.id}><TableCell>{email}</TableCell><TableCell>{name}</TableCell><TableCell>{usd(pl.amountUsd, 2)}</TableCell><TableCell><Hash h={pl.txHash} /></TableCell>
              <TableCell className="flex justify-end gap-1"><ActionButton action={reviewPledge} args={{ id: pl.id, approve: true }} variant="default">Approuver</ActionButton><ActionButton action={reviewPledge} args={{ id: pl.id, approve: false }} variant="destructive">Refuser</ActionButton></TableCell></TableRow>
          ))}
        </TableBody></Table>
      </Section>
      <Section title="Accès communautés privées en attente" count={members.length}>
        <Table><Head cols={["Client", "Communauté", "TxID", ""]} /><TableBody>
          {members.map(({ m, email, name }) => (
            <TableRow key={m.communityId + m.userId}><TableCell>{email}</TableCell><TableCell>{name}</TableCell><TableCell><Hash h={m.txHash} /></TableCell>
              <TableCell className="flex justify-end gap-1"><ActionButton action={reviewMembership} args={{ communityId: m.communityId, userId: m.userId, approve: true }} variant="default">Approuver</ActionButton><ActionButton action={reviewMembership} args={{ communityId: m.communityId, userId: m.userId, approve: false }} variant="destructive">Refuser</ActionButton></TableCell></TableRow>
          ))}
        </TableBody></Table>
      </Section>
      <Section title="Historique des abonnements" count={subs.length}>
        <Table><Head cols={["Client", "Offre", "Montant", "Statut", "Expire"]} /><TableBody>
          {subs.map(({ sub, email, pkg }) => <TableRow key={sub.id}><TableCell>{email}</TableCell><TableCell>{pkg}</TableCell><TableCell>{usd(sub.amountUsd, 2)}</TableCell><TableCell><StatusBadge status={sub.status} /></TableCell><TableCell>{dateFr(sub.expiresAt)}</TableCell></TableRow>)}
        </TableBody></Table>
      </Section>
    </>
  );
}
