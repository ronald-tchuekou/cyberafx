import "server-only";
import { db, settings } from "@/db";
import { cachedPublic } from "@/lib/cache";

export const SETTING_DEFAULTS = {
  usdtAddress: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  usdtNetwork: "TRC20",
  telegramFreeUrl: "https://t.me/+hsY3pNZY1EU1OGZk",
  telegramContactUrl: "https://t.me/CYBERAHCEO",
  myfxbookUrl: "https://www.myfxbook.com/members/cybera_fx/cyberafx/12252073",
};
export type SettingKey = keyof typeof SETTING_DEFAULTS;

export const getSettings = cachedPublic("settings:all", async () => {
  const rows = await db.select().from(settings);
  return { ...SETTING_DEFAULTS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) } as typeof SETTING_DEFAULTS;
});
