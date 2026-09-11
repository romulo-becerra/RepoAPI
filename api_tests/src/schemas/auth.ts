import { z } from "zod";

export const registerPayloadSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  pin: z.string().length(4),
  phone: z.string().optional(),
});

export const userSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  role: z.string().optional(),
  phone: z.string().nullable().optional(),
});

export const registerAccountSchema = z.object({
  account_number: z.string(),
  balance: z.union([z.number(), z.string()]),
  clabe: z.string().nullable().optional(),
});

export const loginAccountSchema = z.object({
  id: z.number(),
  account_number: z.string(),
  clabe: z.string().nullable().optional(),
});

export const registerResponseSchema = z.object({
  message: z.string(),
  token: z.string().min(1),
  user: userSchema,
  account: registerAccountSchema,
});

export const loginResponseSchema = z.object({
  message: z.string(),
  token: z.string().min(1),
  user: userSchema,
  account: loginAccountSchema,
});

export const errorsResponseSchema = z.object({
  errors: z.union([z.string(), z.array(z.string())]),
});

export type RegisterPayload = z.infer<typeof registerPayloadSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
