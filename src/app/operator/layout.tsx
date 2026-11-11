import type { Metadata } from "next";
import { AppShell, type NavItem } from "@/components/shared/app-shell";
import { requireAdmin } from "@/features/auth/server/current-user";

/** Zone privée : jamais indexée. */
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

const NAV: NavItem[] = [
  { href: "/operator", label: "Overview", icon: "dashboard", end: true },
  { href: "/operator/payments", label: "Payments", icon: "payments" },
  { href: "/operator/packages", label: "Packages", icon: "packages" },
  { href: "/operator/signals", label: "Signals", icon: "signals" },
  { href: "/operator/strategies", label: "Copy Trading", icon: "strategies" },
  { href: "/operator/pools", label: "Trade Pools", icon: "pools" },
  { href: "/operator/communities", label: "Communities", icon: "communities" },
  { href: "/operator/support", label: "Support Desk", icon: "support" },
  { href: "/operator/users", label: "Users", icon: "users" },
  { href: "/operator/settings", label: "Settings", icon: "settings" },
  { href: "/client", label: "Client portal", icon: "panel" },
];

export default async function OperatorLayout({ children }: LayoutProps<"/operator">) {
  const user = await requireAdmin();
  return <AppShell nav={NAV} user={{ name: user.name, handle: user.username ?? "admin" }} roleLabel="ADMIN" brand="Operator console">{children}</AppShell>;
}
