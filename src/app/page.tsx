import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { LandingPage } from "@/features/landing/components/landing-page";
import { listPackages } from "@/features/packages/queries";
import { getSettings } from "@/features/settings/queries";
import { listFreeSignals } from "@/features/signals/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: SITE.title },
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default async function Home() {
  const [{ userId }, signals, packages, settings] = await Promise.all([auth(), listFreeSignals(), listPackages(), getSettings()]);
  return <LandingPage signals={signals} packages={packages} settings={settings} signedIn={!!userId} />;
}
