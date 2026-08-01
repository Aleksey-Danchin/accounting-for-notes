import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { PublicUser } from '__prisma/types/public-user';
import type { RequestWithSession } from './session.types';

export const SessionUser = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext): Promise<PublicUser | null> => {
    const req = ctx.switchToHttp().getRequest<RequestWithSession>();
    return req.resolveSessionUser();
  },
);
