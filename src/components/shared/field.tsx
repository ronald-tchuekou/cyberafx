"use client";
import { cloneElement, isValidElement, useId } from "react";
import { Label } from "@/components/ui/label";

/**
 * Champ de formulaire accessible : relie le libellé au contrôle (htmlFor/id),
 * et branche l'aide / l'erreur via aria-describedby + aria-invalid.
 */
export function Field({ label, error, hint, children }: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  const id = useId();
  const messageId = `${id}-msg`;
  const hasMessage = !!(error || hint);
  const control = isValidElement<Record<string, unknown>>(children)
    ? cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": hasMessage ? messageId : undefined,
      })
    : children;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {control}
      {error ? <p id={messageId} role="alert" className="text-xs text-destructive">{error}</p>
        : hint ? <p id={messageId} className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export const selectClass =
  "h-8 w-full rounded-lg border border-input bg-input/30 px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";
