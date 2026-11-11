import { z } from "zod";

export const PLANS = ["monthly", "quarterly", "yearly", "lifetime"] as const;
export const PLAN_LABEL = { monthly: "/mo", quarterly: "/qtr", yearly: "/yr", lifetime: " Lifetime" } as const;

export const brokerSchema = z.object({
  strategyId: z.uuid(),
  brokerLogin: z.string().trim().regex(/^\d{5,12}$/, "Numéro de compte MT4/MT5 (5 à 12 chiffres)"),
  brokerServer: z.string().trim().min(3, "Serveur requis (ex. Exness-MT5Real8)"),
});

export const strategyFormSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Nom requis"),
  asset: z.string().trim().toUpperCase().min(3),
  magic: z.coerce.number().int().positive(),
  description: z.string().trim().default(""),
  avgMonthlyPct: z.coerce.number().transform(String),
  winRatePct: z.coerce.number().min(0).max(100).transform(String),
  profitFactor: z.coerce.number().min(0).transform(String),
  maxDdPct: z.coerce.number().min(0).transform(String),
  expectancyR: z.coerce.number().transform(String),
  minCapital: z.coerce.number().int().min(0),
  priceMonthly: z.coerce.number().min(0),
  priceQuarterly: z.coerce.number().min(0),
  priceYearly: z.coerce.number().min(0),
  priceLifetime: z.coerce.number().min(0),
  isActive: z.boolean().default(true),
});
