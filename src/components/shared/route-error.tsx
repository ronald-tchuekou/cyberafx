"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Écran d'erreur commun : message neutre (jamais de détail technique) + nouvelle tentative. `digest` sert à retrouver l'erreur dans les logs. */
export function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">An unexpected error occurred while loading this page. Please try again.</p>
      {error.digest && <p className="font-mono text-[11px] text-muted-foreground">Reference: {error.digest}</p>}
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
