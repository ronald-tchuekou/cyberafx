"use client";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentDialog } from "@/features/payments/components/payment-dialog";
import { usd } from "@/lib/format";
import { pledgeToPool } from "../actions";

export type PoolView = {
  pool: { id: string; name: string; description: string; targetUsd: string; minPledgeUsd: string; profitSharePct: string; brokerServer: string; status: string };
  raised: number;
  mine: { id: string; amountUsd: string; status: string }[];
  credentials: { login: string; password: string } | null;
};

export function PoolCard({ v, mode }: { v: PoolView; mode: "mine" | "open" }) {
  const { pool: p } = v;
  const [amount, setAmount] = useState(p.minPledgeUsd);
  const [pay, setPay] = useState(false), [reveal, setReveal] = useState(false);
  const pct = Math.min(100, Math.round((v.raised / Number(p.targetUsd)) * 100));
  const pledged = v.mine.reduce((s, x) => s + Number(x.amountUsd), 0);
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold">{p.name}</h3>
        <Badge variant={p.status === "open" ? "secondary" : "outline"}>{p.status.toUpperCase()}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-brand" style={{ width: `${pct}%` }} /></div>
      <p className="mt-1 text-[11px] text-muted-foreground">{usd(v.raised)} / {usd(p.targetUsd)} ({pct}%) · Profit share {Number(p.profitSharePct)}% · Server {p.brokerServer}</p>

      {mode === "mine" ? (
        <div className="mt-3 space-y-2 text-sm">
          <p>Votre engagement : <b>{usd(pledged)}</b> · {v.mine.map((m) => m.status).join(", ")}</p>
          {v.credentials ? (
            <div className="rounded-lg border bg-muted/40 p-3 font-mono text-xs">
              <p className="mb-1 flex items-center gap-1.5 font-sans font-semibold"><KeyRound className="size-3.5" />Live broker credentials (investor)</p>
              <p>Login: {v.credentials.login}</p>
              <p className="flex items-center gap-2">Password: {reveal ? v.credentials.password : "••••••••"}
                <button onClick={() => setReveal((r) => !r)} aria-label="Afficher">{reveal ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}</button>
              </p>
            </div>
          ) : <p className="text-xs text-muted-foreground">En attente de validation par un opérateur.</p>}
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <Input aria-label="Pledge amount (USD)" type="number" min={Number(p.minPledgeUsd)} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-32" />
          <Button onClick={() => (Number(amount) >= Number(p.minPledgeUsd) ? setPay(true) : toast.error(`Minimum ${usd(p.minPledgeUsd)}`))}>Pledge</Button>
          <span className="text-[11px] text-muted-foreground">min {usd(p.minPledgeUsd)}</span>
        </div>
      )}
      <PaymentDialog open={pay} onOpenChange={setPay} title={`Pledge — ${p.name}`} amountUsd={Number(amount)} submit={({ txHash }) => pledgeToPool({ poolId: p.id, amountUsd: Number(amount), txHash })} />
    </div>
  );
}
