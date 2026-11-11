"use client";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import type { ActionResult } from "@/lib/action";
import { usd } from "@/lib/format";
import { txHashSchema } from "../schemas";
import { usePaymentSettings } from "./payment-settings";

/** Dialogue de paiement USDT : adresse + saisie du hash, validé ensuite par un admin. */
export function PaymentDialog({ open, onOpenChange, title, amountUsd, submit }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  amountUsd: number;
  submit: (v: { txHash: string }) => Promise<ActionResult>;
}) {
  const { usdtAddress, usdtNetwork } = usePaymentSettings();
  const { form, onSubmit, pending } = useActionForm(z.object({ txHash: txHashSchema }), submit, {
    onSuccess: () => onOpenChange(false),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Envoyez exactement <b>{usd(amountUsd, 2)} USDT</b> ({usdtNetwork}) à l&apos;adresse ci-dessous, puis collez le hash de la transaction. Un opérateur validera votre accès.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-2.5">
          <code className="flex-1 break-all text-xs">{usdtAddress}</code>
          <Button type="button" size="icon-sm" variant="ghost" aria-label="Copy USDT address" onClick={() => { void navigator.clipboard.writeText(usdtAddress); toast.success("Adresse copiée"); }}>
            <Copy />
          </Button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Hash de transaction (TxID)" error={form.formState.errors.txHash?.message as string | undefined}>
            <Input placeholder="0x… ou 64 caractères hex" {...form.register("txHash")} />
          </Field>
          <Button type="submit" className="w-full" disabled={pending}>{pending ? "Envoi…" : "Soumettre pour validation"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
