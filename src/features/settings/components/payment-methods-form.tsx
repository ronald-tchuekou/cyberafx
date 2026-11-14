"use client";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import { savePaymentMethods } from "../actions";
import { paymentMethodsSchema, type PaymentMethod } from "../schemas";

/** Moyens de paiement affichés aux clients : l'admin ajoute, modifie ou retire chaque crypto et son adresse de réception. */
export function PaymentMethodsForm({ methods }: { methods: PaymentMethod[] }) {
  const { form, onSubmit, pending } = useActionForm(paymentMethodsSchema, savePaymentMethods, { defaultValues: { methods }, keepValues: true });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "methods" });
  const errs = form.formState.errors.methods;
  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4 rounded-xl border bg-card p-5">
      <h2 className="font-semibold">Moyens de paiement</h2>
      {fields.map((f, i) => (
        <div key={f.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-3">
          <Field label="Nom affiché" error={errs?.[i]?.label?.message}><Input placeholder="USDT (TRC-20)" {...form.register(`methods.${i}.label`)} /></Field>
          <Field label="Ticker" error={errs?.[i]?.ticker?.message}><Input placeholder="USDT" {...form.register(`methods.${i}.ticker`)} /></Field>
          <Field label="Réseau" error={errs?.[i]?.network?.message}><Input placeholder="TRON" {...form.register(`methods.${i}.network`)} /></Field>
          <div className="sm:col-span-3">
            <Field label="Adresse de réception" error={errs?.[i]?.address?.message}><Input {...form.register(`methods.${i}.address`)} /></Field>
          </div>
          <Button type="button" variant="ghost" size="sm" className="w-fit text-destructive sm:col-span-3" onClick={() => remove(i)}>
            <Trash2 /> Retirer
          </Button>
        </div>
      ))}
      {form.formState.errors.methods?.root?.message && <p role="alert" className="text-sm text-destructive">{form.formState.errors.methods.root.message}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => append({ label: "", ticker: "", network: "", address: "" })}><Plus /> Ajouter</Button>
        <Button type="submit" disabled={pending}>Enregistrer</Button>
      </div>
    </form>
  );
}
