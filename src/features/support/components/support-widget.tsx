"use client";
import { Headset, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { sendSupportMessage } from "@/features/chat/actions";
import { ChatPanel } from "@/features/chat/components/chat-panel";

const SUGGESTED = ["💳 Deposit Help", "⚡ VIP Signals", "📈 Trade Pools", "👤 Account Verification"];

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {open && (
        <div className="flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b bg-secondary/60 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Headset className="size-5 text-link" />
              <div><p className="text-sm font-semibold">CyberAFX Priority Desk</p><p className="text-[11px] text-success">Online • Typically replies in &lt; 3 mins</p></div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fermer"><X className="size-4" /></button>
          </div>
          <ChatPanel
            url="/api/chat/support" send={sendSupportMessage} placeholder="Ask your support question…"
            empty={
              <div className="space-y-3 py-4 text-center">
                <p className="text-xs font-bold tracking-wider">DIRECT SUPPORT DESK</p>
                <p className="text-xs text-muted-foreground">Connect instantly with certified CyberAFX trade specialists and account operators.</p>
                <p className="text-left text-[11px] font-semibold text-muted-foreground">SUGGESTED QUERIES:</p>
                {SUGGESTED.map((s) => (
                  <button key={s} onClick={() => void sendSupportMessage({ body: s })} className="block w-full rounded-lg border px-3 py-2 text-left text-xs hover:bg-muted">{s}</button>
                ))}
              </div>
            }
          />
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 shadow-lg">
        <span className="text-left text-[11px] leading-tight"><b className="block text-xs">Live Support</b><span className="text-success">Desk Online</span></span>
        <span className="flex size-8 items-center justify-center rounded-full bg-brand text-brand-foreground"><MessageCircle className="size-4" /></span>
      </button>
    </div>
  );
}
