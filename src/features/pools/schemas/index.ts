import { z } from "zod";

export const poolFormSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Nom requis"),
  description: z.string().trim().default(""),
  targetUsd: z.coerce.number().positive().transform(String),
  minPledgeUsd: z.coerce.number().positive().transform(String),
  profitSharePct: z.coerce.number().min(0).max(100).transform(String),
  brokerServer: z.string().trim().min(2, "Serveur requis"),
  brokerLogin: z.string().trim().min(2, "Login requis"),
  investorPassword: z.string().trim().min(2, "Mot de passe investisseur requis"),
  status: z.enum(["open", "closed"]).default("open"),
});
