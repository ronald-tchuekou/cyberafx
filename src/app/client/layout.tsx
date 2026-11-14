import type { Metadata } from "next";
import { AppShell, type NavItem } from "@/components/shared/app-shell";
import { requireUser } from "@/features/auth/server/current-user";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { listNotifications } from "@/features/notifications/server/queries";
import { PaymentSettingsProvider } from "@/features/payments/components/payment-settings";
import { getSettings, parsePaymentMethods } from "@/features/settings/queries";
import { SupportWidget } from "@/features/support/components/support-widget";

/** Zone privée : jamais indexée. */
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

const NAV: NavItem[] = [
  { href: "/client", label: "Client Panel", icon: "panel", end: true },
  { href: "/client/chart", label: "AI Chart Analysis", icon: "chart" },
  { href: "/client/trade-pools", label: "Trade Pools", icon: "pools" },
  { href: "/client/copytrade", label: "Copy Trading", icon: "copy" },
  { href: "/client/communities", label: "Communities Chat", icon: "chat" },
  { href: "/client/buy", label: "Buy Packages", icon: "buy" },
  { href: "/client/signals", label: "Signals Feed", icon: "signals" },
];

export default async function ClientLayout({ children }: LayoutProps<"/client">) {
  const user = await requireUser();
  const [settings, notifs] = await Promise.all([getSettings(), listNotifications(user.id)]);
  return (
    <PaymentSettingsProvider value={{ methods: parsePaymentMethods(settings.paymentMethods) }}>
      <AppShell
        nav={user.role === "admin" ? [...NAV, { href: "/operator", label: "Operator Console", icon: "dashboard" }] : NAV}
        user={{ name: user.name, handle: user.username ?? "user" }}
        roleLabel={user.role === "admin" ? "ADMIN" : "CLIENT"}
        brand="Terminal"
        topRight={<NotificationBell items={notifs.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))} />}
        floating={<SupportWidget />}
      >
        {children}
      </AppShell>
    </PaymentSettingsProvider>
  );
}
