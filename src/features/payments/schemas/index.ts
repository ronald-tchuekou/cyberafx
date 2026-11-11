import { z } from "zod";

/** Hash de transaction USDT (TRC20 : 64 hex ; ERC20/BEP20 : 0x + 64 hex). */
export const txHashSchema = z
  .string()
  .trim()
  .regex(/^(0x)?[0-9a-fA-F]{64}$/, "Hash de transaction invalide (64 caractères hexadécimaux).");

export const paymentSchema = z.object({ txHash: txHashSchema });
