import type { Metadata } from "next";
import { Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/features/auth/server/current-user";
import { StrategyCard } from "@/features/copytrading/components/strategy-card";
import { listStrategiesFor } from "@/features/copytrading/queries";

export const metadata: Metadata = { title: "AI Trading Autopilot & Copy Trading" };

export default async function CopyTradePage() {
  const user = await requireUser();
  const rows = await listStrategiesFor(user.id);
  return (
    <>
      <PageHeader
        title="AI Trading Autopilot & Copy Trading" icon={<TrendingUp className="size-5" />}
        description="Mirror institutional 6-Pillar Strategy Engine v3 setups directly into your Exness MT4/MT5 account with zero VPS required"
        actions={<Link href="/client/chart" className={buttonVariants({ size: "sm" }) + " bg-brand text-brand-foreground hover:bg-brand/80"}><Sparkles />AI Chart &amp; ⌘K Strategy Composer</Link>}
      />
      <h2 className="mb-3 text-sm font-bold">Available Master Autopilot Strategies</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map(({ strategy, sub }) => <StrategyCard key={strategy.id} strategy={strategy} sub={sub} />)}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Aucune stratégie publiée.</p>}
      </div>
    </>
  );
}
