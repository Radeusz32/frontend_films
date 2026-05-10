export const config = {
  apiMode: 'mock' as 'mock' | 'api',
  baseUrl: 'http://localhost:8000/api',
  tokenKey: 'reelmind_access',
  refreshKey: 'reelmind_refresh',
  defaultLang: 'pl' as 'pl' | 'en',
} as const
