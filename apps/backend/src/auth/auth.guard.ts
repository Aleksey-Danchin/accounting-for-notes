import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { RequestWithSession } from './session.types';

export type AuthGuardOptions = {
  strict?: boolean;
};

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly strict: boolean;

  constructor(options?: AuthGuardOptions) {
    this.strict = options?.strict ?? true;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithSession>();
    const user = await req.resolveSessionUser();

    if (this.strict && !user) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
