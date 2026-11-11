import { z } from "zod";

/** https uniquement : ces liens sont rendus dans des <a href> publics, un `javascript:` serait une faille XSS. */
const httpsUrl = z.url({ protocol: /^https$/, message: "URL https:// requise" });

const ADDRESS_FORMAT = {
  TRC20: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
  ERC20: /^0x[0-9a-fA-F]{40}$/,
  BEP20: /^0x[0-9a-fA-F]{40}$/,
} as const;

export const settingsSchema = z
  .object({
    usdtAddress: z.string().trim().min(10, "Adresse USDT requise"),
    usdtNetwork: z.enum(["TRC20", "ERC20", "BEP20"]),
    telegramFreeUrl: httpsUrl,
    telegramContactUrl: httpsUrl,
    myfxbookUrl: httpsUrl,
  })
  // Une adresse erronée détournerait les paiements des clients : on vérifie le format selon le réseau.
  .refine((v) => ADDRESS_FORMAT[v.usdtNetwork].test(v.usdtAddress), {
    path: ["usdtAddress"],
    message: "Format d'adresse invalide pour ce réseau",
  });
