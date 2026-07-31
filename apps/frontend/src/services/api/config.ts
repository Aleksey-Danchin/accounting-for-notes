export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  concurrency: Number(import.meta.env.VITE_API_CONCURRENCY ?? 5),
} as const;
