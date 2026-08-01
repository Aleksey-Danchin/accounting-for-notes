import { z } from 'zod';
import { ActionType } from '__prisma/generated/prisma/client';

const actionTypeValues = Object.values(ActionType) as [
  (typeof ActionType)[keyof typeof ActionType],
  ...(typeof ActionType)[keyof typeof ActionType][],
];

export const listActionsQuerySchema = z.object({
  noteId: z.string().min(1).optional(),
  tagId: z.string().min(1).optional(),
  type: z.enum(actionTypeValues).optional(),
});

export type ListActionsQueryDTO = z.infer<typeof listActionsQuerySchema>;
