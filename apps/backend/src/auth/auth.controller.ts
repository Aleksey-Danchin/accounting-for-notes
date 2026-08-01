import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { PublicUser } from '__prisma/types/public-user';
import { ZodError } from 'zod';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './auth.constants';
import { AuthGuard } from './auth.guard';
import { AuthProvider } from './auth.provider';
import { clearAuthCookies, setAuthCookies } from './cookies';
import { loginSchema, type LoginDataDTO } from './dto';
import { SessionUser } from './session-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthProvider) private readonly auth: AuthProvider) {}

  @Post('login')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: PublicUser }> {
    let data: LoginDataDTO;
    try {
      data = loginSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error.issues);
      }
      throw error;
    }

    const { user, accessToken, refreshToken } = await this.auth.login(data);
    setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const cookies = req.cookies as
      Record<string, string | undefined> | undefined;
    await this.auth.logout(cookies?.[ACCESS_COOKIE]);
    clearAuthCookies(res);
    return { ok: true };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const cookies = req.cookies as
      Record<string, string | undefined> | undefined;
    const { accessToken, refreshToken } = await this.auth.refresh(
      cookies?.[REFRESH_COOKIE],
    );
    setAuthCookies(res, accessToken, refreshToken);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@SessionUser() user: PublicUser | null): PublicUser {
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
