import { z } from "zod";

export const balanceResponseSchema = z.object({
  account_id: z.number(),
  balance: z.number(),
});

export type BalanceResponse = z.infer<typeof balanceResponseSchema>;
