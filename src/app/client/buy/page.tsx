import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackageCard } from "@/features/packages/components/package-card";
import { listPackages } from "@/features/packages/queries";

export const metadata: Metadata = { title: "Buy Packages" };

export default async function BuyPage({ searchParams }: PageProps<"/client/buy">) {
  const { pkg } = await searchParams;
  const plans = await listPackages();
  const wanted = plans.find((p) => p.slug === pkg || p.id === pkg);
  const groups = [
    { value: "signal", label: "Signal Packages", items: plans.filter((p) => p.kind === "signal") },
    { value: "mentorship", label: "Mentorship Programs", items: plans.filter((p) => p.kind === "mentorship") },
  ];
  return (
    <>
      <PageHeader title="Choose Your Plan" description="Select from our range of live signal alerts and professional mentorship programs." />
      <Tabs defaultValue={wanted?.kind ?? "signal"}>
        <TabsList variant="line">{groups.map((g) => <TabsTrigger key={g.value} value={g.value}>{g.label}</TabsTrigger>)}</TabsList>
        {groups.map((g) => (
          <TabsContent key={g.value} value={g.value} className="mt-4 grid gap-4 sm:grid-cols-2">
            {g.items.map((p) => <PackageCard key={p.id} pkg={p} autoOpen={p.id === wanted?.id} />)}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
