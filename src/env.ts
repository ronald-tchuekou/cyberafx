import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    // Emails (séparés par des virgules) promus admin automatiquement à la connexion.
    ADMIN_EMAILS: z
      .string()
      .default("")
      .transform((s) => s.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    // URL publique canonique (SEO : canonical, sitemap, Open Graph). Ex. https://www.cyberafx.com
    NEXT_PUBLIC_SITE_URL: z.url().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
