import type { PublicUser } from '__prisma/types/public-user';

export type ResolveSessionUser = () => Promise<PublicUser | null>;

export type RequestWithSession = {
  cookies?: Record<string, string | undefined>;
  resolveSessionUser: ResolveSessionUser;
};
