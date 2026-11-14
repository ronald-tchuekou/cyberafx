"use client";
import { Copy, Lightbulb, Loader2, Radio, Wifi } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { z } from "zod";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import type { ActionResult } from "@/lib/action";
import { usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import { txHashSchema } from "../schemas";
import { usePaymentSettings } from "./payment-settings";

/** Dialogue de paiement multi-coin : adresse + QR + hash, validé ensuite par un admin. */
export function PaymentDialog({ open, onOpenChange, title, amountUsd, submit }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  amountUsd: number;
  submit: (v: { txHash: string }) => Promise<ActionResult>;
}) {
  const { methods } = usePaymentSettings();
  const [selected, setSelected] = useState(0);
  const m = methods[selected] ?? methods[0];
  const { form, onSubmit, pending } = useActionForm(z.object({ txHash: txHashSchema }), submit, {
    onSuccess: () => onOpenChange(false),
  });
  if (!m) return null;
  const { address, ticker: coin } = m;
  const network = `${m.network} Network`;
  const hash = form.watch("txHash");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Purchase Signal Access</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Package: <span className="font-semibold uppercase text-primary">{title}</span> ({usd(amountUsd, 0)})
          </p>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Select payment coin</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-2" role="radiogroup" aria-label="Payment coin">
            {methods.map((c, i) => (
              <button
                key={`${c.ticker}-${i}`}
                type="button"
                role="radio"
                aria-checked={i === selected}
                onClick={() => setSelected(i)}
                className={cn(
                  "rounded-lg border px-2 py-2.5 text-xs font-semibold transition-colors",
                  i === selected ? "border-primary/60 bg-primary/15 text-primary" : "bg-card hover:bg-muted",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="text-foreground">{coin} address</span>
            <span>{network}</span>
          </div>
          <div className="mx-auto w-fit rounded-xl bg-white p-3">
            <QRCodeSVG value={address || " "} size={134} aria-label={`QR code ${coin}`} />
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded-lg border bg-background px-3 py-2.5 text-xs">{address}</code>
            <Button type="button" size="icon" variant="outline" aria-label={`Copy ${coin} address`} onClick={() => { void navigator.clipboard.writeText(address); toast.success("Adresse copiée"); }}>
              <Copy />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Make a payment of <b className="text-foreground">{usd(amountUsd, 0)} USD equivalent</b> in <b className="text-foreground">{coin}</b> to the address above. Then paste your transaction hash below.
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/10 p-3">
          <div className="flex items-center gap-3">
            <Radio className="size-4 text-primary" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-semibold">Listening for your transaction</p>
              <p className="text-[11px] text-primary">Scanning {m.network} network for incoming transactions…</p>
            </div>
            <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
          </div>
          <p className="flex gap-1.5 border-t border-primary/20 pt-2 text-[11px] text-muted-foreground">
            <Lightbulb className="mt-0.5 size-3 shrink-0 text-amber-400" aria-hidden />
            <span><b className="text-foreground">Note:</b> After your payment is received and approved by our team, you will receive a confirmation email.</span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Transaction ID (TX Hash)" error={form.formState.errors.txHash?.message as string | undefined}>
            <Input placeholder="0x… ou 64 caractères hex" {...form.register("txHash")} />
          </Field>
          <Button type="submit" size="lg" variant="outline" className="h-11 w-full" disabled={pending || !hash}>
            {pending ? "Envoi…" : <><Wifi aria-hidden /> {hash ? "Submit for validation" : "Waiting for Transaction…"}</>}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Your payment will be reviewed by our team and activated within minutes after verification. Once approved, you will receive a confirmation email.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
