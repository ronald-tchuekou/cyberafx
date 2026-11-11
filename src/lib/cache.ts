import "server-only";
import { unstable_cache } from "next/cache";

/** Tag commun aux lectures publiques (offres, signaux gratuits, réglages) : invalidé par chaque action admin. */
export const PUBLIC_TAG = "public-data";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/** unstable_cache sérialise en JSON : on remet les dates ISO en objets Date pour garder les types de Drizzle. */
function reviveDates<T>(value: T): T {
  if (typeof value === "string" && ISO_DATE.test(value)) return new Date(value) as T;
  if (Array.isArray(value)) return value.map(reviveDates) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, reviveDates(v)])) as T;
  return value;
}

/**
 * Met en cache une lecture BDD sans paramètre dépendant de la requête.
 * `revalidate` (s) est un filet de sécurité ; l'invalidation immédiate passe par PUBLIC_TAG.
 */
export function cachedPublic<A extends unknown[], R>(key: string, fn: (...args: A) => Promise<R>, revalidate = 300) {
  const cached = unstable_cache(fn, [key], { tags: [PUBLIC_TAG], revalidate });
  return async (...args: A): Promise<R> => reviveDates(await cached(...args));
}
