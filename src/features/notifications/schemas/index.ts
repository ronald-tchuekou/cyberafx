import { z } from "zod";

export const broadcastSchema = z.object({ title: z.string().trim().min(2, "Titre requis").max(80), body: z.string().trim().max(300).default("") });
