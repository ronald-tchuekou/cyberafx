"use client";
import { Activity, BrainCircuit, CreditCard, Link2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Field } from "@/components/shared/field";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PaymentDialog } from "@/features/payments/components/payment-dialog";
import { useActionForm } from "@/hooks/use-action-form";
import { usd } from "@/lib/format";
import { connectBroker, subscribeStrategy } from "../actions";
import { PLANS, PLAN_LABEL, brokerSchema } from "../schemas";

type Props = {
  strategy: {
    id: string; name: string; asset: string; magic: number; description: string; avgMonthlyPct: string; winRatePct: string; profitFactor: string;
    maxDdPct: string; expectancyR: string; minCapital: number; prices: Record<(typeof PLANS)[number], number>;
  };
  sub: { status: string; plan: string; brokerLogin: string | null } | null;
};

const PILLARS = ["Market Structure", "Liquidity Sweep", "Imbalance (FVG)", "Order Block", "Momentum (EMA 20/50)", "Risk / Reward ≥ 2"];

function Sparkline({ seed }: { seed: string }) {
  let h = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  const pts: number[] = [];
  for (let i = 0; i < 12; i++) {
    h = (Math.imul(h, 1103515245) + 12345) | 0;
    pts.push(30 - i * 2 - ((h >>> 8) % 5));
  }
  return <svg viewBox="0 0 120 34" className="h-10 w-full"><polyline fill="none" stroke="var(--brand)" strokeWidth="2" points={pts.map((y, i) => `${i * 11},${y}`).join(" ")} /></svg>;
}

export function StrategyCard({ strategy: s, sub }: Props) {
  const [plan, setPlan] = useState<(typeof PLANS)[number]>("monthly");
  const [pay, setPay] = useState(false), [logic, setLogic] = useState(false), [broker, setBroker] = useState(false);
  const active = sub?.status === "active";
  const { form, onSubmit, pending } = useActionForm(brokerSchema, connectBroker, {
    defaultValues: { strategyId: s.id, brokerLogin: sub?.brokerLogin ?? "", brokerServer: "" }, onSuccess: () => setBroker(false),
  });
  return (
    <div className="flex max-w-sm flex-col rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold">{s.name}</h3>
          <div className="mt-1 flex gap-1.5"><Badge variant="outline" className="text-[11px]">Asset: {s.asset}</Badge><Badge variant="outline" className="font-mono text-[11px]">Magic #{s.magic}</Badge></div>
        </div>
        <div className="text-right"><p className="font-bold text-success">+{Number(s.avgMonthlyPct)}%</p><p className="text-[11px] text-muted-foreground">Avg. Monthly</p></div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{s.description}</p>
      <div className="mt-3 rounded-lg border p-2">
        <div className="flex justify-between text-[11px] font-semibold"><span className="text-brand"><BrainCircuit className="mr-1 inline size-3" />6-PILLAR ENGINE V3</span><span>{Number(s.winRatePct)}% WR · PF {Number(s.profitFactor)}</span></div>
        <Sparkline seed={s.id} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg border p-2 text-center">
        {[["MAX DD", `${Number(s.maxDdPct)}%`], ["EXPECTANCY", `+${Number(s.expectancyR)}R`], ["MIN CAP", usd(s.minCapital)]].map(([k, v]) => (
          <div key={k}><p className="text-[11px] text-muted-foreground">{k}</p><p className="text-xs font-bold">{v}</p></div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border p-2 text-center">
        <p className="text-[11px] font-bold text-amber-400">VIP STRATEGY (IB REQUIRED)</p>
        <p className="text-[11px] font-bold">{PLANS.map((p) => `${usd(s.prices[p], 2)}${PLAN_LABEL[p]}`).join(" · ")}</p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => setLogic(true)}><Activity />6-Pillar Logic</Button>
        <Link href="/client/chart" className={buttonVariants({ variant: "outline", size: "sm" })}>Live AI Chart</Link>
      </div>
      {active ? (
        <Button className="mt-2 bg-brand text-brand-foreground hover:bg-brand/80" onClick={() => setBroker(true)}><Link2 />{sub?.brokerLogin ? `Exness #${sub.brokerLogin}` : "Connect Exness Broker"}</Button>
      ) : sub?.status === "pending" ? (
        <Button className="mt-2" variant="secondary" disabled>Paiement en cours de validation…</Button>
      ) : (
        <>
          <select aria-label="Billing plan" value={plan} onChange={(e) => setPlan(e.target.value as typeof plan)} className="mt-2 h-8 rounded-lg border bg-input/30 px-2 text-xs">
            {PLANS.map((p) => <option key={p} value={p}>{p} — {usd(s.prices[p], 2)}</option>)}
          </select>
          <Button className="mt-2 bg-amber-500/90 text-black hover:bg-amber-500" onClick={() => setPay(true)}><CreditCard />Subscribe Plan ({usd(s.prices[plan], 2)}{PLAN_LABEL[plan]})</Button>
        </>
      )}
      <PaymentDialog open={pay} onOpenChange={setPay} title={`${s.name} — ${plan}`} amountUsd={s.prices[plan]} submit={({ txHash }) => subscribeStrategy({ strategyId: s.id, plan, txHash })} />
      <Dialog open={logic} onOpenChange={setLogic}>
        <DialogContent>
          <DialogHeader><DialogTitle>6-Pillar Strategy Engine v3</DialogTitle><DialogDescription>Un trade n&apos;est copié que si la confluence est suffisante.</DialogDescription></DialogHeader>
          <ol className="list-decimal space-y-1 pl-5 text-sm">{PILLARS.map((p) => <li key={p}>{p}</li>)}</ol>
        </DialogContent>
      </Dialog>
      <Dialog open={broker} onOpenChange={setBroker}>
        <DialogContent>
          <DialogHeader><DialogTitle>Connect Exness (MT4/MT5)</DialogTitle><DialogDescription>Aucun VPS requis. Identifiants du compte enregistrés pour l&apos;autopilot (connexion simulée).</DialogDescription></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <Field label="Numéro de compte" error={form.formState.errors.brokerLogin?.message as string}><Input inputMode="numeric" {...form.register("brokerLogin")} /></Field>
            <Field label="Serveur" error={form.formState.errors.brokerServer?.message as string}><Input placeholder="Exness-MT5Real8" {...form.register("brokerServer")} /></Field>
            <Button type="submit" className="w-full" disabled={pending}>Enregistrer</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
