"use client";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionForm } from "@/hooks/use-action-form";
import type { ActionResult } from "@/lib/action";
import { cn } from "@/lib/utils";
import { messageSchema } from "../schemas";

export type ChatMessage = { id: string; body: string; createdAt: string; mine: boolean; author: string; staff?: boolean };

/** Chat par polling (4 s) : suffisant ici, remplaçable par SSE/websocket sans toucher aux appelants. */
/**
 * `send` doit être une server action (référence sérialisable) : les paramètres fixes (ex. communityId)
 * passent par `extra`, jamais par une fermeture, qui ne peut pas traverser la frontière serveur → client.
 */
export function ChatPanel({ url, send, extra, placeholder = "Écrire un message…", empty, className }: {
  url: string; send: (v: { body: string } & Record<string, string>) => Promise<ActionResult>; extra?: Record<string, string>;
  placeholder?: string; empty?: React.ReactNode; className?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const load = useCallback(async () => {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (r.ok) setMessages(await r.json());
    } catch { /* réseau coupé : on réessaiera au prochain tick */ }
  }, [url]);

  useEffect(() => {
    const first = setTimeout(load, 0);
    // Pas de requêtes pour un onglet caché ; rechargement immédiat au retour.
    const t = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 4000);
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearTimeout(first); clearInterval(t); document.removeEventListener("visibilitychange", onVisible); };
  }, [load]);
  useEffect(() => {
    // Bloc (et non flèche) : un effet ne doit jamais renvoyer autre chose qu'une fonction de nettoyage.
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  const { form, onSubmit, pending } = useActionForm(messageSchema, (v) => send({ ...v, ...extra }), {
    defaultValues: { body: "" }, onSuccess: load,
  });

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div role="log" aria-live="polite" aria-label="Messages" className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages?.length === 0 && empty}
        {messages?.map((m) => (
          <div key={m.id} className={cn("flex flex-col", m.mine ? "items-end" : "items-start")}>
            {m.mine ? <span className="sr-only">You</span> : <span className="mb-0.5 text-[11px] text-muted-foreground">{m.author}{m.staff && " · staff"}</span>}
            <div className={cn("max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-1.5 text-sm", m.mine ? "bg-primary text-primary-foreground" : "bg-muted")}>{m.body}</div>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <form onSubmit={onSubmit} className="flex gap-2 border-t p-2">
        <Input aria-label="Message" placeholder={placeholder} autoComplete="off" maxLength={1000} {...form.register("body")} />
        <Button type="submit" size="icon" disabled={pending} aria-label="Send message"><Send aria-hidden="true" /></Button>
      </form>
    </div>
  );
}
