export const usd = (n: number | string, digits = 0) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(n));

export const dateFr = (d: Date | string | null | undefined) =>
  d ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d)) : "—";

export function timeAgo(d: Date | string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(d).getTime()) / 1000));
  for (const [n, u] of [[86400, "d"], [3600, "h"], [60, "m"]] as const) if (s >= n) return `${Math.floor(s / n)}${u} ago`;
  return `${s}s ago`;
}

export const LIFETIME_MONTHS = 12000;
export const durationLabel = (m: number) => (m >= LIFETIME_MONTHS ? "Lifetime access" : m === 1 ? "1 Month Access" : `${m} Months Access`);
