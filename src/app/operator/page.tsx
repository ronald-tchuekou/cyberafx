import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { BroadcastForm } from "@/features/notifications/components/broadcast-form";
import { getOverview } from "@/features/admin/queries";
import { usd } from "@/lib/format";

export const metadata: Metadata = { title: "Operator Console" };

export default async function OperatorHome() {
  const o = await getOverview();
  const cards = [["Utilisateurs", o.users], ["Abonnements actifs", o.activeSubs], ["Paiements à valider", o.pendingPayments], ["Revenu (abonnements actifs)", usd(o.revenue)], ["Signaux publiés", o.signals]];
  return (
    <>
      <PageHeader title="Operator Console" description="Vue d'ensemble de la plateforme." actions={<BroadcastForm />} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([k, v]) => <div key={k as string} className="rounded-xl border bg-card p-4"><p className="text-[11px] font-semibold uppercase text-muted-foreground">{k}</p><p className="mt-1 text-2xl font-bold">{v}</p></div>)}
      </div>
    </>
  );
}
