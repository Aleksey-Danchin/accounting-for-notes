export const ACCESS_TTL_SEC = 5 * 60;
export const REFRESH_TTL_SEC = 7 * 24 * 60 * 60;
export const TOKEN_LENGTH = 40;

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

export const ACCESS_COOKIE_PATH = '/api';
export const REFRESH_COOKIE_PATH = '/api/auth/refresh';

export function cookieDomain(): string {
  const domain = process.env.COOKIE_DOMAIN;
  if (!domain) {
    throw new Error('COOKIE_DOMAIN is not set');
  }
  return domain;
}

export function accessKey(hash: string): string {
  return `auth:access:${hash}`;
}

export function refreshKey(hash: string): string {
  return `auth:refresh:${hash}`;
}

export function sessionKey(sessionId: string): string {
  return `auth:session:${sessionId}`;
}

export function userSessionsKey(userId: string): string {
  return `auth:user:${userId}:sessions`;
}
