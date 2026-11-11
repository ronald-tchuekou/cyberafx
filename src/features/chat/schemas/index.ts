import { z } from "zod";

export const messageSchema = z.object({ body: z.string().trim().min(1, "Message vide").max(1000, "1000 caractères max") });
