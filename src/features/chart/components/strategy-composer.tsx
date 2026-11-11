"use client";
import { Copy, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const PILLARS = ["Market Structure", "Liquidity Sweep", "Imbalance (FVG)", "Order Block", "Momentum (EMA 20/50)", "Risk / Reward ≥ 2"];

/** Composer ⌘K : assemble une spécification de stratégie (6 piliers + risque) à copier. */
export function StrategyComposer({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [on, setOn] = useState<Record<string, boolean>>(Object.fromEntries(PILLARS.map((p) => [p, true])));
  const [risk, setRisk] = useState("1");
  const [rr, setRr] = useState("2");

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); onOpenChange(!open); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onOpenChange]);

  const spec = JSON.stringify({ engine: "6-pillar-v3", pillars: PILLARS.filter((p) => on[p]), riskPerTradePct: Number(risk), minRR: Number(rr) }, null, 2);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Wand2 className="size-4" />Strategy Composer</DialogTitle>
          <DialogDescription>Choisissez les piliers de confluence et le risque ; copiez la spécification.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {PILLARS.map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm"><Checkbox checked={on[p]} onCheckedChange={(v) => setOn((s) => ({ ...s, [p]: !!v }))} />{p}</label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <label>Risque / trade (%)<Input type="number" step="0.1" min="0.1" value={risk} onChange={(e) => setRisk(e.target.value)} /></label>
          <label>R:R minimum<Input type="number" step="0.5" min="1" value={rr} onChange={(e) => setRr(e.target.value)} /></label>
        </div>
        <pre className="max-h-40 overflow-auto rounded-lg bg-muted p-3 text-[11px]">{spec}</pre>
        <Button onClick={() => { void navigator.clipboard.writeText(spec); toast.success("Spécification copiée"); }}><Copy />Copier</Button>
      </DialogContent>
    </Dialog>
  );
}
