import type { Metadata } from "next";
import { CheckCircle2, Lock, Package, Send } from "lucide-react";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { db, packages } from "@/db";
import { requireUser } from "@/features/auth/server/current-user";
import { listSignals } from "@/features/signals/queries";
import { SignalCard } from "@/features/signals/components/signal-card";
import { getAccess } from "@/features/subscriptions/server/access";
import { dateFr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Client Panel" };

export default async function ClientHome() {
  const user = await requireUser();
  const [access, plans, signals] = await Promise.all([
    getAccess(user.id),
    db.select({ id: packages.id }).from(packages).where(eq(packages.isActive, true)),
    listSignals(2),
  ]);
  const stats = [
    { icon: Package, label: "AVAILABLE PLANS", value: `${plans.length} Packages` },
    { icon: CheckCircle2, label: "ACTIVE PLANS", value: `${access.active.length} Subscribed` },
    { icon: Send, label: "TELEGRAM CHANNEL", value: "VIP Access" },
  ];
  return (
    <>
      <PageHeader title={`Welcome back, ${user.name}`} description="Monitor your subscription status, access your Telegram groups, and inspect live trading signals." />
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-link"><s.icon className="size-5" /></div>
            <div><p className="text-[11px] font-semibold text-muted-foreground">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-xl border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-wider">ACTIVE PACKAGES</h2>
          <Link href="/client/buy" className="text-xs font-semibold text-link">Shop Packages →</Link>
        </div>
        {access.active.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10">
            <p className="text-xs text-muted-foreground">You do not have any active packages yet.</p>
            <Link href="/client/buy" className={buttonVariants({ size: "sm" })}>Subscribe VIP Signals</Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {access.active.map(({ sub, pkg }) => (
              <li key={sub.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <span className="font-semibold">{pkg.name}</span>
                <span className="text-xs text-muted-foreground">expire le {dateFr(sub.expiresAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold tracking-wider">RECENT SIGNALS</h2>
          <Link href="/client/signals" className="text-xs font-semibold text-link">View All Signals →</Link>
        </div>
        <div className="relative">
          <div className={cn("grid gap-3 sm:grid-cols-2", !access.vip && "pointer-events-none select-none opacity-60 blur-sm")}>
            {signals.map((s) => <SignalCard key={s.id} s={s} />)}
          </div>
          {!access.vip && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg border border-white/70 text-center">
              <Lock className="size-4 text-link" />
              <p className="text-xs font-bold">Signals Feed Locked</p>
              <p className="text-[11px] text-muted-foreground">Subscribe to an active Signal Package to unlock real-time alerts.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
