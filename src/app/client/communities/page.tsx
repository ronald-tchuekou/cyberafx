import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requireUser } from "@/features/auth/server/current-user";
import { CommunitiesView } from "@/features/communities/components/communities-view";
import { listCommunitiesFor } from "@/features/communities/queries";

export const metadata: Metadata = { title: "Communities Chat" };

export default async function CommunitiesPage() {
  const user = await requireUser();
  const rows = await listCommunitiesFor(user.id);
  return (
    <>
      <PageHeader title="Communities Chat" description="Access VIP signal channels, talk to admin mentors, browse public discussions, or verify memberships." />
      <CommunitiesView rows={rows} username={user.username ?? ""} />
    </>
  );
}
