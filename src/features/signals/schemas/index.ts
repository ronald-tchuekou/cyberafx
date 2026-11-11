import { z } from "zod";

const num = z.coerce.number({ error: "Nombre requis" });

export const signalFormSchema = z.object({
  id: z.uuid().optional(),
  symbol: z.string().trim().toUpperCase().min(3, "Symbole requis"),
  side: z.enum(["BUY", "SELL"]),
  entry: num.transform(String),
  takeProfit: num.transform(String),
  stopLoss: num.transform(String),
  status: z.enum(["active", "tp_hit", "sl_hit", "closed"]).default("active"),
  pips: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().nullable()).transform((v) => (v == null ? null : String(v))),
  setup: z.string().trim().optional().transform((v) => v || null),
  note: z.string().trim().optional().transform((v) => v || null),
  imageUrl: z.string().trim().optional().transform((v) => v || null),
  isFree: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});
