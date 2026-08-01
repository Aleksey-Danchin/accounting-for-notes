import { z } from 'zod';

const titleTextPayloadSchema = z.object({
  value: z.string(),
  description: z.string().optional(),
});

const tagsPayloadSchema = z.object({
  description: z.string().optional(),
});

export const createRequisiteSchema = z.discriminatedUnion('type', [
  z.object({
    name: z.string().trim().min(1),
    type: z.literal('title'),
    public: z.boolean(),
    payload: titleTextPayloadSchema.nullable().optional(),
  }),
  z.object({
    name: z.string().trim().min(1),
    type: z.literal('text'),
    public: z.boolean(),
    payload: titleTextPayloadSchema.nullable().optional(),
  }),
  z.object({
    name: z.string().trim().min(1),
    type: z.literal('tags'),
    public: z.boolean(),
    payload: tagsPayloadSchema.nullable().optional(),
  }),
]);

export type CreateRequisiteDTO = z.infer<typeof createRequisiteSchema>;

export const updateRequisiteSchema = z.object({
  name: z.string().trim().min(1).optional(),
  public: z.boolean().optional(),
  payload: z
    .union([titleTextPayloadSchema, tagsPayloadSchema])
    .nullable()
    .optional(),
});

export type UpdateRequisiteDTO = z.infer<typeof updateRequisiteSchema>;

export const addRequisiteTagsSchema = z.object({
  tagIds: z.array(z.string().min(1)).min(1),
});

export type AddRequisiteTagsDTO = z.infer<typeof addRequisiteTagsSchema>;
