import type { Response } from 'express';
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_PATH,
  ACCESS_TTL_SEC,
  REFRESH_COOKIE,
  REFRESH_COOKIE_PATH,
  REFRESH_TTL_SEC,
  cookieDomain,
} from './auth.constants';

function baseCookie() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    domain: cookieDomain(),
  };
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  const base = baseCookie();
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...base,
    path: ACCESS_COOKIE_PATH,
    maxAge: ACCESS_TTL_SEC * 1000,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...base,
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_TTL_SEC * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  const base = baseCookie();
  res.clearCookie(ACCESS_COOKIE, {
    ...base,
    path: ACCESS_COOKIE_PATH,
  });
  res.clearCookie(REFRESH_COOKIE, {
    ...base,
    path: REFRESH_COOKIE_PATH,
  });
}
