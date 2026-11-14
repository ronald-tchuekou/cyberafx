"use client";
import { Field } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import { saveSettings } from "../actions";
import { settingsSchema } from "../schemas";

type V = { telegramFreeUrl: string; telegramContactUrl: string; myfxbookUrl: string };

export function SettingsForm({ values }: { values: V }) {
  const { form, onSubmit, pending } = useActionForm(settingsSchema, saveSettings, { defaultValues: values as never, keepValues: true });
  const e = form.formState.errors;
  return (
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2">
      <Field label="Canal Telegram gratuit" error={e.telegramFreeUrl?.message}><Input {...form.register("telegramFreeUrl")} /></Field>
      <Field label="Contact Telegram" error={e.telegramContactUrl?.message}><Input {...form.register("telegramContactUrl")} /></Field>
      <div className="sm:col-span-2"><Field label="Lien Myfxbook" error={e.myfxbookUrl?.message}><Input {...form.register("myfxbookUrl")} /></Field></div>
      <Button type="submit" className="sm:col-span-2" disabled={pending}>Enregistrer</Button>
    </form>
  );
}
