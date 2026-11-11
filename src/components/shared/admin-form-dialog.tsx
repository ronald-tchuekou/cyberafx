"use client";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import type { z } from "zod";
import { Field, selectClass } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionForm } from "@/hooks/use-action-form";
import type { ActionResult } from "@/lib/action";

export type FieldDef = {
  name: string; label: string; hint?: string; wide?: boolean;
  kind?: "text" | "number" | "textarea" | "select" | "checkbox" | "password";
  options?: readonly string[]; step?: string;
};

/** Dialogue création/édition piloté par un schéma Zod et une liste de champs. */
export function AdminFormDialog<S extends z.ZodType<FieldValues, FieldValues>>({ title, schema, action, fields, defaultValues, edit }: {
  title: string; schema: S; action: (v: z.output<S>) => Promise<ActionResult>;
  fields: FieldDef[]; defaultValues?: Record<string, unknown>; edit?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { form, onSubmit, pending } = useActionForm(schema, action, {
    defaultValues: defaultValues as never, onSuccess: () => setOpen(false), keepValues: edit,
  });
  const errors = form.formState.errors as Record<string, { message?: string } | undefined>;
  return (
    <>
      <Button size={edit ? "icon-sm" : "sm"} variant={edit ? "ghost" : "default"} onClick={() => setOpen(true)} aria-label={title}>
        {edit ? <Pencil /> : <><Plus />{title}</>}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => {
              const reg = form.register(f.name as never);
              const wide = f.wide || f.kind === "textarea";
              return (
                <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
                  {f.kind === "checkbox" ? (
                    <label className="flex items-center gap-2 pt-5 text-sm"><input type="checkbox" className="size-4 accent-[var(--primary)]" {...reg} />{f.label}</label>
                  ) : (
                    <Field label={f.label} hint={f.hint} error={errors[f.name]?.message}>
                      {f.kind === "textarea" ? <Textarea rows={4} {...reg} />
                        : f.kind === "select" ? <select className={selectClass} {...reg}>{f.options!.map((o) => <option key={o} value={o}>{o}</option>)}</select>
                        : <Input type={f.kind ?? "text"} step={f.step ?? (f.kind === "number" ? "any" : undefined)} {...reg} />}
                    </Field>
                  )}
                </div>
              );
            })}
            <Button type="submit" className="sm:col-span-2" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
