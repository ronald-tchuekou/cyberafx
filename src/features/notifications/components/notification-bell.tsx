"use client";
import { Bell } from "lucide-react";
import { useSyncExternalStore } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { timeAgo } from "@/lib/format";

type Item = { id: string; title: string; body: string; createdAt: string };
const KEY = "cyberafx:notif-seen";
const EVENT = "cyberafx:notif-seen-change";

// Source externe (localStorage) lue via useSyncExternalStore : 0 côté serveur, valeur réelle après hydratation, sans décalage.
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => { window.removeEventListener("storage", cb); window.removeEventListener(EVENT, cb); };
};
const getSeen = () => { try { return Number(localStorage.getItem(KEY) ?? 0); } catch { return 0; } };

/** "Non lu" = plus récent que la dernière ouverture (stockée localement, les diffusions sont partagées). */
export function NotificationBell({ items }: { items: Item[] }) {
  const seen = useSyncExternalStore(subscribe, getSeen, () => 0);
  const unread = items.filter((i) => new Date(i.createdAt).getTime() > seen).length;
  return (
    <DropdownMenu onOpenChange={(o) => {
      if (o) return;
      try { localStorage.setItem(KEY, String(Date.now())); } catch {}
      window.dispatchEvent(new Event(EVENT));
    }}>
      <DropdownMenuTrigger className="relative rounded-md p-1.5 text-muted-foreground outline-none hover:bg-muted" aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}>
        <Bell aria-hidden="true" className="size-4" />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{unread}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <p className="border-b px-3 py-2 text-xs font-semibold">Notifications</p>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">Aucune notification</p>}
          {items.map((i) => (
            <div key={i.id} className="border-b px-3 py-2 last:border-0">
              <p className="text-xs font-medium">{i.title}</p>
              {i.body && <p className="text-[11px] text-muted-foreground">{i.body}</p>}
              <p className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(i.createdAt)}</p>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
