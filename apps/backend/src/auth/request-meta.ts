import type { Request } from 'express';
import '__prisma/types/prisma-json';

export type AuthRequestMeta = PrismaJson.AuthActionPayload;

export function authMetaFromRequest(
  req: Request,
  extras: { email?: string } = {},
): AuthRequestMeta {
  const userAgent = header(req, 'user-agent');
  const forwardedFor = header(req, 'x-forwarded-for');
  const realIp = header(req, 'x-real-ip');
  const ip =
    firstForwardedIp(forwardedFor) ||
    realIp ||
    req.ip ||
    req.socket.remoteAddress ||
    undefined;

  const parsed = parseUserAgent(userAgent);
  const host = header(req, 'x-forwarded-host') || header(req, 'host');
  const proto = header(req, 'x-forwarded-proto') || req.protocol;
  const originalUrl = req.originalUrl || req.url;
  const url =
    host && originalUrl ? `${proto}://${host}${originalUrl}` : originalUrl;

  return omitEmpty({
    email: extras.email,
    ip,
    realIp,
    forwardedFor,
    method: req.method,
    protocol: proto,
    url,
    path: req.path || undefined,
    hostname: host?.split(':')[0],
    referer: header(req, 'referer') || header(req, 'referrer'),
    origin: header(req, 'origin'),
    accept: header(req, 'accept'),
    acceptEncoding: header(req, 'accept-encoding'),
    language: header(req, 'accept-language'),
    userAgent,
    browser: parsed.browser,
    os: parsed.os,
    device: parsed.device,
    secChUa: header(req, 'sec-ch-ua'),
    secChUaMobile: header(req, 'sec-ch-ua-mobile'),
    secChUaPlatform: header(req, 'sec-ch-ua-platform'),
    secChUaModel: header(req, 'sec-ch-ua-model'),
    secChUaFullVersionList: header(req, 'sec-ch-ua-full-version-list'),
    secFetchSite: header(req, 'sec-fetch-site'),
    secFetchMode: header(req, 'sec-fetch-mode'),
    secFetchDest: header(req, 'sec-fetch-dest'),
    secFetchUser: header(req, 'sec-fetch-user'),
    serverTimeIso: new Date().toISOString(),
  });
}

function header(req: Request, name: string): string | undefined {
  const value = req.headers[name];
  if (Array.isArray(value)) {
    return value[0];
  }
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function firstForwardedIp(forwarded: string | undefined): string | undefined {
  if (!forwarded) {
    return undefined;
  }
  const first = forwarded.split(',')[0]?.trim();
  return first || undefined;
}

function parseUserAgent(ua: string | undefined): {
  browser?: string;
  os?: string;
  device?: string;
} {
  if (!ua) {
    return {};
  }

  let browser: string | undefined;
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\//.test(ua) || /Opera/.test(ua)) browser = 'Opera';
  else if (/Chrome\//.test(ua) && !/Chromium\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = 'Safari';
  else if (/MSIE|Trident\//.test(ua)) browser = 'IE';

  let os: string | undefined;
  if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  else if (/CrOS/.test(ua)) os = 'ChromeOS';

  let device: string | undefined;
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) device = 'tablet';
  else if (/Mobile|iPhone|Android.*Mobile|webOS|BlackBerry/i.test(ua)) {
    device = 'mobile';
  } else {
    device = 'desktop';
  }

  return { browser, os, device };
}

function omitEmpty(
  value: Record<string, string | number | boolean | undefined>,
): AuthRequestMeta {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined || entry === '') {
      continue;
    }
    out[key] = entry;
  }
  return out;
}
