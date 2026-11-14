import "server-only";
import { db, settings } from "@/db";
import { cachedPublic } from "@/lib/cache";
import type { PaymentMethod } from "./schemas";

/** Adresses factices : l'admin renseigne les vraies dans Settings. */
const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { label: "USDT (TRC-20)", ticker: "USDT", network: "TRON", address: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
  { label: "Bitcoin (BTC)", ticker: "BTC", network: "Bitcoin", address: "bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
  { label: "Ethereum (ETH)", ticker: "ETH", network: "Ethereum", address: "0x0000000000000000000000000000000000000000" },
];

export const SETTING_DEFAULTS = {
  paymentMethods: JSON.stringify(DEFAULT_PAYMENT_METHODS),
  telegramFreeUrl: "https://t.me/+hsY3pNZY1EU1OGZk",
  telegramContactUrl: "https://t.me/CYBERAHCEO",
  myfxbookUrl: "https://www.myfxbook.com/members/cybera_fx/cyberafx/12252073",
};
export type SettingKey = keyof typeof SETTING_DEFAULTS;

export const getSettings = cachedPublic("settings:all", async () => {
  const rows = await db.select().from(settings);
  return { ...SETTING_DEFAULTS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) } as typeof SETTING_DEFAULTS;
});

export function parsePaymentMethods(raw: string): PaymentMethod[] {
  try { return JSON.parse(raw) as PaymentMethod[]; } catch { return DEFAULT_PAYMENT_METHODS; }
}
