import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().trim().min(1),
  color: z.string().trim().min(1),
  description: z.string(),
});

export type CreateTagDTO = z.infer<typeof createTagSchema>;

export const updateTagSchema = z.object({
  name: z.string().trim().min(1).optional(),
  color: z.string().trim().min(1).optional(),
  description: z.string().optional(),
});

export type UpdateTagDTO = z.infer<typeof updateTagSchema>;
