import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { getSettings } from "@/features/settings/queries";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsAdmin() {
  return (
    <>
      <PageHeader title="Settings" description="Adresse de paiement USDT et liens publics." />
      <SettingsForm values={await getSettings()} />
    </>
  );
}
