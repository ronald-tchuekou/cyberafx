import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Signal } from "../queries";

const STATUS: Record<Signal["status"], string> = { active: "ACTIVE", tp_hit: "TP HIT 🎯", sl_hit: "SL HIT", closed: "CLOSED" };

export function SignalCard({ s, footer }: { s: Signal; footer?: React.ReactNode }) {
  const buy = s.side === "BUY";
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold">{s.symbol}</span>
          <Badge className={cn("gap-0.5", buy ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
            {buy ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{s.side}
          </Badge>
          {s.isFeatured && <Badge variant="secondary">📌 FEATURED</Badge>}
        </div>
        <Badge variant={s.status === "active" ? "outline" : "secondary"}>{STATUS[s.status]}</Badge>
      </div>
      {s.note && <p className="mt-2 text-sm italic text-muted-foreground">“{s.note}”</p>}
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center font-mono text-xs">
        {[["ENTRY", s.entry], ["TAKE PROFIT", s.takeProfit], ["STOP LOSS", s.stopLoss]].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-muted/50 p-2"><dt className="text-[11px] text-muted-foreground">{k}</dt><dd className="mt-0.5 font-semibold">{Number(v)}</dd></div>
        ))}
      </dl>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{timeAgo(s.createdAt)}{s.setup ? ` · ${s.setup}` : ""}</span>
        {s.pips && <span className={Number(s.pips) >= 0 ? "text-success" : "text-destructive"}>{Number(s.pips) > 0 ? "+" : ""}{Number(s.pips)} pips</span>}
      </div>
      {footer}
    </div>
  );
}
