import { env } from "@/env";

export const SITE = {
  name: "CyberAFX",
  url: (env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  title: "CyberAFX | Premium Forex & Gold Trading Signals",
  description:
    "CyberAFX publishes Forex, Gold (XAUUSD) and crypto trading signals with SMC chart analysis, copy trading and 1-on-1 mentorship. Join the VIP membership and follow every setup on Telegram.",
  keywords: [
    "forex signals", "gold trading signals", "XAUUSD signals", "VIP forex membership", "forex mentorship", "copy trading",
    "smart money concepts", "SMC trading", "AI chart analysis", "Telegram trading signals", "CyberAFX",
  ],
  themeColor: "#0b1020",
  brandColor: "#a3e635",
} as const;

/** URL absolue à partir d'un chemin. */
export const absoluteUrl = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
