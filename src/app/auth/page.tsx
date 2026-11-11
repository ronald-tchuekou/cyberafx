import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthTabs } from "@/features/auth/components/auth-tabs";

export const metadata: Metadata = { title: "Sign in or create your account", robots: { index: false, follow: false } };

export default async function AuthPage({ searchParams }: PageProps<"/auth">) {
  const { pkg } = await searchParams;
  const target = typeof pkg === "string" ? `/client/buy?pkg=${encodeURIComponent(pkg)}` : "/client";
  if ((await auth()).userId) redirect(target);
  return <main id="main" tabIndex={-1} className="flex min-h-screen items-center justify-center p-4"><AuthTabs redirectUrl={target} /></main>;
}
