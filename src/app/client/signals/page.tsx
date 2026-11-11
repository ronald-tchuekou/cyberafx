import type { Metadata } from "next";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/features/auth/server/current-user";
import { SignalCard } from "@/features/signals/components/signal-card";
import { TrackRecord } from "@/features/signals/components/track-record";
import { getTrackRecord, listSignals } from "@/features/signals/queries";
import { getAccess } from "@/features/subscriptions/server/access";

export const metadata: Metadata = { title: "Signals Feed" };

export default async function SignalsPage() {
  const user = await requireUser();
  const [access, stats, signals] = await Promise.all([getAccess(user.id), getTrackRecord(), listSignals()]);
  return (
    <>
      <PageHeader
        title="Live Trading Signals" description="Real-time entries, paired target levels, and stop losses backed by institutional AI SMC confluence."
        actions={<Link href="/client/chart" className={buttonVariants({ variant: "outline", size: "sm" })}><Sparkles />Open AI Chart Analyzer</Link>}
      />
      <TrackRecord stats={stats} />
      <div className="mt-6">
        {access.vip ? (
          <div className="grid gap-3 sm:grid-cols-2">{signals.map((s) => <SignalCard key={s.id} s={s} />)}</div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-xl border bg-card py-10 text-center">
            <Lock className="size-5 text-link" />
            <p className="text-sm font-bold">Signal Feed Locked</p>
            <p className="max-w-md text-xs text-muted-foreground">To view active and historical entries (and unlock up to Unlimited AI Chart Scans per day), buy a Monthly, Yearly, or Lifetime signal subscription plan.</p>
            <Link href="/client/buy" className={buttonVariants({ size: "sm" })}>Explore Signal Packages</Link>
          </div>
        )}
      </div>
    </>
  );
}
