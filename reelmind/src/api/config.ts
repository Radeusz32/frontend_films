export const config = {
  apiMode: (import.meta.env.VITE_API_MODE ?? 'mock') as 'mock' | 'api',
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  tokenKey: 'reelmind_access',
  refreshKey: 'reelmind_refresh',
  defaultLang: 'pl' as 'pl' | 'en',
} as const
