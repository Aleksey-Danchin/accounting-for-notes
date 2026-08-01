import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1)
    .regex(/^[^\s@]+@[^\s@]+$/, 'Invalid email address'),
  password: z.string().min(1),
});

export type LoginDataDTO = z.infer<typeof loginSchema>;
