"use client";
import { CheckCircle2, CreditCard, Zap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentDialog } from "@/features/payments/components/payment-dialog";
import { durationLabel, usd } from "@/lib/format";
import { submitPackagePayment } from "../actions";

type Pkg = { id: string; name: string; description: string; priceUsd: string; durationMonths: number; scansPerDay: number | null; features: string[] };

export function PackageCard({ pkg, autoOpen }: { pkg: Pkg; autoOpen?: boolean }) {
  const [open, setOpen] = useState(!!autoOpen);
  const price = Number(pkg.priceUsd);
  return (
    <div className="flex flex-col rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-link"><Zap className="size-4" /></div>
        <span className="text-2xl font-bold">{usd(price)}</span>
      </div>
      <h2 className="mt-4 text-sm font-bold uppercase tracking-wide">{pkg.name}</h2>
      <p className="mt-0.5 text-[11px] uppercase text-muted-foreground">{durationLabel(pkg.durationMonths)}</p>
      <p className="mt-3 text-sm text-muted-foreground">{pkg.description}</p>
      <div className="mt-3 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand">
        <Zap className="mr-1.5 inline size-3.5" />
        {pkg.scansPerDay == null ? "Unlimited" : pkg.scansPerDay} AI Chart Scans / Day + ⌘K Strategy Composer
      </div>
      <ul className="mt-4 flex-1 space-y-1.5 text-xs">
        {pkg.features.map((f) => (
          <li key={f} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />{f}</li>
        ))}
      </ul>
      <Button variant="outline" className="mt-5 w-full" onClick={() => setOpen(true)}><CreditCard /> Buy Access</Button>
      <PaymentDialog
        open={open} onOpenChange={setOpen} title={pkg.name} amountUsd={price}
        submit={({ txHash }) => submitPackagePayment({ packageId: pkg.id, txHash })}
      />
    </div>
  );
}
