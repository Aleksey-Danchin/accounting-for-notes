import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { PublicUser } from '__prisma/types/public-user';
import { ACCESS_COOKIE } from './auth.constants';
import { AuthProvider } from './auth.provider';
import type { RequestWithSession } from './session.types';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(@Inject(AuthProvider) private readonly auth: AuthProvider) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    let isChecked = false;
    let cached: PublicUser | null = null;

    const request = req as Request & RequestWithSession;
    request.resolveSessionUser = async () => {
      if (isChecked) {
        return cached;
      }
      isChecked = true;
      const cookies = request.cookies as
        Record<string, string | undefined> | undefined;
      const accessToken = cookies?.[ACCESS_COOKIE];
      cached = await this.auth.resolveUserByAccessToken(accessToken);
      return cached;
    };

    next();
  }
}
