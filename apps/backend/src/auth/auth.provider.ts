import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { PublicUser } from '__prisma/types/public-user';
import { PrismaService } from '../prisma/prisma.service';
import { RedisProvider } from '../redis/redis.provider';
import {
  ACCESS_TTL_SEC,
  REFRESH_TTL_SEC,
  TOKEN_LENGTH,
  accessKey,
  refreshKey,
  sessionKey,
  userSessionsKey,
} from './auth.constants';
import type { LoginDataDTO } from './dto';

type AccessPayload = {
  sessionId: string;
  userId: string;
  refreshHash: string;
};

type RefreshPayload = {
  sessionId: string;
  userId: string;
  accessHash: string;
};

type SessionPayload = {
  userId: string;
  accessHash: string;
  refreshHash: string;
};

const TOKEN_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

@Injectable()
export class AuthProvider {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisProvider) private readonly redis: RedisProvider,
  ) {}

  async login(data: LoginDataDTO): Promise<{
    user: PublicUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const userWithHash = await this.prisma.user.findUnique({
      where: { email: data.email },
      omit: { passwordHash: false },
    });

    if (!userWithHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await bcrypt.compare(data.password, userWithHash.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { passwordHash: _passwordHash, ...user } = userWithHash;
    void _passwordHash;
    const tokens = await this.createSession(user.id);
    return { user, ...tokens };
  }

  async logout(accessToken: string | undefined): Promise<void> {
    if (!accessToken) {
      return;
    }
    const hash = hashToken(accessToken);
    const raw = await this.redis.client.get(accessKey(hash));
    if (!raw) {
      return;
    }
    const payload = JSON.parse(raw) as AccessPayload;
    await this.destroySession(payload.sessionId);
  }

  async refresh(refreshToken: string | undefined): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const oldRefreshHash = hashToken(refreshToken);
    const raw = await this.redis.client.get(refreshKey(oldRefreshHash));
    if (!raw) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = JSON.parse(raw) as RefreshPayload;
    await this.destroySession(payload.sessionId);
    return this.createSession(payload.userId);
  }

  async resolveUserByAccessToken(
    accessToken: string | undefined,
  ): Promise<PublicUser | null> {
    if (!accessToken) {
      return null;
    }

    const hash = hashToken(accessToken);
    const raw = await this.redis.client.get(accessKey(hash));
    if (!raw) {
      return null;
    }

    const payload = JSON.parse(raw) as AccessPayload;
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    return user;
  }

  private async createSession(userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const sessionId = generateToken();
    const accessToken = generateToken();
    const refreshToken = generateToken();
    const accessHash = hashToken(accessToken);
    const refreshHash = hashToken(refreshToken);

    const accessPayload: AccessPayload = {
      sessionId,
      userId,
      refreshHash,
    };
    const refreshPayload: RefreshPayload = {
      sessionId,
      userId,
      accessHash,
    };
    const sessionPayload: SessionPayload = {
      userId,
      accessHash,
      refreshHash,
    };

    const pipeline = this.redis.client.pipeline();
    pipeline.set(
      accessKey(accessHash),
      JSON.stringify(accessPayload),
      'EX',
      ACCESS_TTL_SEC,
    );
    pipeline.set(
      refreshKey(refreshHash),
      JSON.stringify(refreshPayload),
      'EX',
      REFRESH_TTL_SEC,
    );
    pipeline.set(
      sessionKey(sessionId),
      JSON.stringify(sessionPayload),
      'EX',
      REFRESH_TTL_SEC,
    );
    pipeline.sadd(userSessionsKey(userId), sessionId);
    await pipeline.exec();

    return { accessToken, refreshToken };
  }

  private async destroySession(sessionId: string): Promise<void> {
    const raw = await this.redis.client.get(sessionKey(sessionId));
    if (!raw) {
      return;
    }

    const session = JSON.parse(raw) as SessionPayload;
    const pipeline = this.redis.client.pipeline();
    pipeline.del(accessKey(session.accessHash));
    pipeline.del(refreshKey(session.refreshHash));
    pipeline.del(sessionKey(sessionId));
    pipeline.srem(userSessionsKey(session.userId), sessionId);
    await pipeline.exec();
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function generateToken(): string {
  const bytes = randomBytes(TOKEN_LENGTH);
  let out = '';
  for (let i = 0; i < TOKEN_LENGTH; i += 1) {
    out += TOKEN_ALPHABET[bytes[i] % TOKEN_ALPHABET.length];
  }
  return out;
}
