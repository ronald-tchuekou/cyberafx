"use client";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import { saveLandingGrid } from "../actions";
import { landingGridSchema, type LandingGrid } from "../schemas";

/** Section « grille d'images + texte » de la landing : titre, sous-titre et blocs (image https, titre, texte). */
export function LandingGridForm({ grid }: { grid: LandingGrid }) {
  const { form, onSubmit, pending } = useActionForm(landingGridSchema, saveLandingGrid, { defaultValues: grid, keepValues: true });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const e = form.formState.errors;
  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4 rounded-xl border bg-card p-5">
      <div>
        <h2 className="font-semibold">Landing — grille d&apos;images</h2>
        <p className="text-xs text-muted-foreground">Section masquée tant qu&apos;aucun bloc n&apos;est ajouté.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Titre de la section" error={e.title?.message}><Input {...form.register("title")} /></Field>
        <Field label="Sous-titre" error={e.subtitle?.message}><Input {...form.register("subtitle")} /></Field>
      </div>
      {fields.map((f, i) => (
        <div key={f.id} className="grid gap-3 rounded-lg border p-3">
          <Field label="URL de l'image (https)" error={e.items?.[i]?.imageUrl?.message}><Input placeholder="https://…" {...form.register(`items.${i}.imageUrl`)} /></Field>
          <Field label="Titre" error={e.items?.[i]?.title?.message}><Input {...form.register(`items.${i}.title`)} /></Field>
          <Field label="Texte" error={e.items?.[i]?.text?.message}><Input {...form.register(`items.${i}.text`)} /></Field>
          <Button type="button" variant="ghost" size="sm" className="w-fit text-destructive" onClick={() => remove(i)}><Trash2 /> Retirer</Button>
        </div>
      ))}
      {e.items?.root?.message && <p role="alert" className="text-sm text-destructive">{e.items.root.message}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => append({ imageUrl: "", title: "", text: "" })}><Plus /> Ajouter un bloc</Button>
        <Button type="submit" disabled={pending}>Enregistrer</Button>
      </div>
    </form>
  );
}
