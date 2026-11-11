import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/features/auth/server/current-user";
import { PoolCard } from "@/features/pools/components/pool-card";
import { RefreshButton } from "@/features/pools/components/refresh-button";
import { listPoolsFor } from "@/features/pools/queries";

export const metadata: Metadata = { title: "Trade Pools" };

export default async function TradePoolsPage() {
  const user = await requireUser();
  const { mine, open } = await listPoolsFor(user.id);
  return (
    <>
      <PageHeader
        title="Institutional Trade Pools" icon={<Layers className="size-5" />}
        description="Pledge into high-yield trading pools, monitor live broker account credentials, and track real-time profit distribution."
        actions={<RefreshButton label="Refresh Pools" />}
      />
      <Tabs defaultValue="mine">
        <TabsList variant="line">
          <TabsTrigger value="mine">My Pledged Pools ({mine.length})</TabsTrigger>
          <TabsTrigger value="open">Available Open Pools ({open.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="mine" className="mt-4 grid gap-4">
          {mine.length === 0 && <EmptyState icon={<Layers />} title="You Have Not Pledged in Any Pools Yet" description="Explore open institutional trading pools, pledge capital, and unlock live broker server investor passwords." />}
          {mine.map((v) => <PoolCard key={v.pool.id} v={v} mode="mine" />)}
        </TabsContent>
        <TabsContent value="open" className="mt-4 grid gap-4 sm:grid-cols-2">
          {open.length === 0 && <p className="text-sm text-muted-foreground">Aucun pool ouvert.</p>}
          {open.map((v) => <PoolCard key={v.pool.id} v={v} mode="open" />)}
        </TabsContent>
      </Tabs>
    </>
  );
}
