import { z } from "zod";

export const packageFormSchema = z.object({
  id: z.uuid().optional(),
  slug: z.string().trim().min(2, "Slug requis").regex(/^[a-z0-9-]+$/, "Minuscules, chiffres et tirets"),
  kind: z.enum(["signal", "mentorship"]),
  name: z.string().trim().min(2, "Nom requis"),
  description: z.string().trim().default(""),
  priceUsd: z.coerce.number().positive("Prix > 0").transform(String),
  durationMonths: z.coerce.number().int().positive("Durée en mois"),
  scansPerDay: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().min(0).nullable()),
  features: z.preprocess(
    (v) => (typeof v === "string" ? v.split("\n").map((s) => s.trim()).filter(Boolean) : v),
    z.array(z.string()),
  ),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});
