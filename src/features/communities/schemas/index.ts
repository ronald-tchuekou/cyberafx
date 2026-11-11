import { z } from "zod";

export const usernameSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,20}$/, "3 à 20 caractères : lettres, chiffres, _"),
});

export const communityFormSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Nom requis"),
  description: z.string().trim().default(""),
  type: z.enum(["public", "private"]),
  monthlyPriceUsd: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().min(0).nullable()).transform((v) => (v == null ? null : String(v))),
});
