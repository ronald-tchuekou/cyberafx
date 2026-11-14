import { z } from "zod";

/** https uniquement : ces liens sont rendus dans des <a href> publics, un `javascript:` serait une faille XSS. */
const httpsUrl = z.url({ protocol: /^https$/, message: "URL https:// requise" });

export const settingsSchema = z.object({
  telegramFreeUrl: httpsUrl,
  telegramContactUrl: httpsUrl,
  myfxbookUrl: httpsUrl,
});

// Une adresse erronée détournerait les paiements des clients : format vérifié selon le préfixe.
const ADDRESS_FORMATS = [/^T[1-9A-HJ-NP-Za-km-z]{33}$/, /^0x[0-9a-fA-F]{40}$/, /^(bc1[a-z0-9]{25,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/];

export const paymentMethodSchema = z.object({
  label: z.string().trim().min(2, "Nom requis").max(40),
  ticker: z.string().trim().min(2, "Ticker requis").max(10),
  network: z.string().trim().min(2, "Réseau requis").max(30),
  address: z.string().trim().refine((a) => ADDRESS_FORMATS.some((r) => r.test(a)), "Adresse invalide (TRON, EVM ou Bitcoin)"),
});
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const paymentMethodsSchema = z.object({
  methods: z.array(paymentMethodSchema).min(1, "Au moins un moyen de paiement"),
});
