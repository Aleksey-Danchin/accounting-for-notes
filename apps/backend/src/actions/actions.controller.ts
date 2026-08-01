import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Action } from '__prisma/generated/prisma/client';
import type { PublicUser } from '__prisma/types/public-user';
import { ZodError } from 'zod';
import { AuthGuard } from '../auth/auth.guard';
import { SessionUser } from '../auth/session-user.decorator';
import { ActionsProvider } from './actions.provider';
import { listActionsQuerySchema, type ListActionsQueryDTO } from './dto';

function requireUser(user: PublicUser | null): PublicUser {
  if (!user) {
    throw new UnauthorizedException();
  }
  return user;
}

@Controller('actions')
@UseGuards(AuthGuard)
export class ActionsController {
  constructor(
    @Inject(ActionsProvider) private readonly actions: ActionsProvider,
  ) {}

  @Get()
  listActions(
    @SessionUser() user: PublicUser | null,
    @Query() query: Record<string, string | undefined>,
  ): Promise<Action[]> {
    let parsed: ListActionsQueryDTO;
    try {
      parsed = listActionsQuerySchema.parse(query);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error.issues);
      }
      throw error;
    }
    return this.actions.listActions(requireUser(user).id, parsed);
  }

  @Get(':id')
  getAction(
    @SessionUser() user: PublicUser | null,
    @Param('id') id: string,
  ): Promise<Action> {
    return this.actions.getAction(requireUser(user).id, id);
  }
}
