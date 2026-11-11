import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/features/auth/server/current-user";
import { getScanUsage } from "@/features/chart/queries";
import { ChartWorkspace } from "@/features/chart/components/chart-workspace";

export const metadata: Metadata = { title: "AI Chart Analysis" };

export default async function ChartPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="AI Chart Analysis" description="Scan SMC (order blocks, FVG, BOS/CHoCH, OTE) sur données simulées." />
      <ChartWorkspace usage={await getScanUsage(user.id)} />
    </>
  );
}
