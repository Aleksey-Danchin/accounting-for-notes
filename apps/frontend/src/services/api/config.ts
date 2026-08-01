export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  concurrency: Number(import.meta.env.VITE_API_CONCURRENCY ?? 5),
  authBlacklist: [
    '/auth/login',
    '/auth/logout',
    '/auth/refresh',
    '/auth/check',
  ] as const,
  refreshLockName: 'afn-auth-refresh',
  refreshChannelName: 'afn-auth',
  refreshMarkerKey: 'afn-auth-refreshed-at',
  refreshMarkerTtlMs: 5_000,
} as const;
