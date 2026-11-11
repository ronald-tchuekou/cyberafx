"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import type { ActionResult } from "@/lib/action";

/** react-hook-form + schéma Zod + server action, avec toasts. */
export function useActionForm<S extends z.ZodType<FieldValues, FieldValues>>(
  schema: S,
  action: (values: z.output<S>) => Promise<ActionResult>,
  opts: { defaultValues?: DefaultValues<z.input<S>>; onSuccess?: () => void; keepValues?: boolean } = {},
) {
  const form = useForm<z.input<S>, unknown, z.output<S>>({
    resolver: zodResolver(schema as never) as never,
    defaultValues: opts.defaultValues,
  });
  const onSubmit = form.handleSubmit(async (values) => {
    const r = await action(values);
    if (!r.ok) return void toast.error(r.error);
    toast.success(r.message ?? "Enregistré");
    if (!opts.keepValues) form.reset(opts.defaultValues);
    opts.onSuccess?.();
  });
  return { form, onSubmit, pending: form.formState.isSubmitting };
}
