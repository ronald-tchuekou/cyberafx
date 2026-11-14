import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { LandingGridForm } from "@/features/settings/components/landing-grid-form";
import { PaymentMethodsForm } from "@/features/settings/components/payment-methods-form";
import { getSettings, parseLandingGrid, parsePaymentMethods } from "@/features/settings/queries";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsAdmin() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Settings" description="Moyens de paiement crypto et liens publics." />
      <div className="space-y-6">
        <PaymentMethodsForm methods={parsePaymentMethods(settings.paymentMethods)} />
        <LandingGridForm grid={parseLandingGrid(settings.landingGrid)} />
        <SettingsForm values={settings} />
      </div>
    </>
  );
}
