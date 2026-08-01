import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Action, ActionType, Prisma } from '__prisma/generated/prisma/client';
import '__prisma/types/prisma-json';
import { PrismaService } from '../prisma/prisma.service';
import type { ListActionsQueryDTO } from './dto';

export type RecordActionInput = {
  type: ActionType;
  userId?: string | null;
  noteId?: string | null;
  tagId?: string | null;
  payload?: PrismaJson.ActionPayload | null;
};

@Injectable()
export class ActionsProvider {
  private readonly logger = new Logger(ActionsProvider.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async record(input: RecordActionInput): Promise<void> {
    try {
      await this.prisma.action.create({
        data: {
          type: input.type,
          userId: input.userId ?? undefined,
          noteId: input.noteId ?? undefined,
          tagId: input.tagId ?? undefined,
          ...(input.payload !== undefined && input.payload !== null
            ? { payload: input.payload }
            : {}),
        },
      });
    } catch (error) {
      this.logger.error('Failed to record action', error);
    }
  }

  listActions(
    userId: string,
    query: ListActionsQueryDTO = {},
  ): Promise<Action[]> {
    const where: Prisma.ActionWhereInput = {
      userId,
      ...(query.noteId ? { noteId: query.noteId } : {}),
      ...(query.tagId ? { tagId: query.tagId } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    return this.prisma.action.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAction(userId: string, id: string): Promise<Action> {
    const action = await this.prisma.action.findFirst({
      where: { id, userId },
    });
    if (!action) {
      throw new NotFoundException('Action not found');
    }
    return action;
  }
}
