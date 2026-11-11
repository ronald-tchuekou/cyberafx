"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/action";

/** Bouton qui exécute une server action avec arguments, confirmation accessible optionnelle et toast. */
export function ActionButton({ action, args, children, variant = "outline", confirm }: {
  action: (args: never) => Promise<ActionResult>; args: unknown; children: React.ReactNode;
  variant?: "default" | "outline" | "destructive" | "ghost" | "secondary"; confirm?: string;
}) {
  const [pending, start] = useTransition();
  const [asking, setAsking] = useState(false);

  const run = () =>
    start(async () => {
      const r = await action(args as never);
      setAsking(false);
      if (r.ok) toast.success(r.message ?? "Fait");
      else toast.error(r.error);
    });

  return (
    <>
      <Button size="sm" variant={variant} disabled={pending} onClick={() => (confirm ? setAsking(true) : run())}>{children}</Button>
      {confirm && (
        <Dialog open={asking} onOpenChange={(o) => !pending && setAsking(o)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirmation</DialogTitle>
              <DialogDescription>{confirm}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAsking(false)} disabled={pending}>Annuler</Button>
              <Button variant={variant === "outline" ? "default" : variant} onClick={run} disabled={pending}>{pending ? "En cours…" : "Confirmer"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
