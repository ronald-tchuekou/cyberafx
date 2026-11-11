"use client";
import { SignOutButton } from "@clerk/nextjs";
import {
  Bell, Building2, ClipboardCheck, CreditCard, Layers, LayoutDashboard, LifeBuoy, LineChart, LogOut, Menu, MessagesSquare,
  Package, Radio, Settings, ShoppingBag, Sparkles, TrendingUp, UserRound, Users, Zap, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  panel: UserRound, chart: Sparkles, pools: Layers, copy: TrendingUp, chat: MessagesSquare, buy: ShoppingBag, signals: Zap,
  dashboard: LayoutDashboard, packages: Package, payments: ClipboardCheck, users: Users, support: LifeBuoy, settings: Settings,
  strategies: LineChart, communities: Building2, notifications: Bell, radio: Radio, card: CreditCard,
};
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; end?: boolean };

export function AppShell({ nav, user, roleLabel, brand, children, topRight, floating }: {
  nav: NavItem[]; user: { name: string; handle: string }; roleLabel: string; brand: string;
  children: React.ReactNode; topRight?: React.ReactNode; floating?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar">
      <Link href="/" aria-label="CyberAFX home" className="rounded-md px-5 py-4 text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-ring">Cyber<span className="text-link">AFX</span></Link>
      <div className="mx-3 mb-3 flex items-center gap-3 rounded-xl border bg-card/60 p-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/20 font-bold text-link">{user.name.slice(0, 1).toUpperCase()}</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">@{user.handle}</p>
          <Badge variant="secondary" className="mt-1 h-4 bg-success/15 text-[11px] text-success">{roleLabel}</Badge>
        </div>
      </div>
      <nav aria-label="Primary" className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map((n) => {
          const Icon = ICONS[n.icon];
          const active = n.end ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
                active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")}>
              <Icon aria-hidden="true" className="size-4" />{n.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <SignOutButton redirectUrl="/">
          <button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-destructive hover:bg-destructive/10 focus-visible:outline-2 focus-visible:outline-ring"><LogOut aria-hidden="true" className="size-4" />Sign Out</button>
        </SignOutButton>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen">
      <aside aria-label="Sidebar" className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r lg:block">{sidebar}</aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-60 p-0"><SheetTitle className="sr-only">Menu</SheetTitle>{sidebar}</SheetContent>
      </Sheet>
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu" onClick={() => setOpen(true)}><Menu aria-hidden="true" /></Button>
            <span aria-hidden="true" className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{brand}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 font-mono text-[11px] text-muted-foreground sm:flex"><span aria-hidden="true" className="size-1.5 rounded-full bg-success" />Connected to API</span>
            {topRight}
          </div>
        </header>
        <main id="main" tabIndex={-1} className="mx-auto max-w-5xl p-4 outline-none sm:p-6">{children}</main>
      </div>
      {floating}
    </div>
  );
}
