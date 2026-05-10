import { config } from './config'
import { mockRouter } from './mockRouter'
import { ApiException } from '@/types/api'

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  queryParams?: Record<string, string | number | undefined>,
): Promise<T> {
  if (config.apiMode === 'dev') {
    return mockRouter.handle<T>(method, path, body ?? queryParams)
  }

  let url = `${config.baseUrl}${path}`

  if (queryParams) {
    const params = new URLSearchParams()
    for (const [key, val] of Object.entries(queryParams)) {
      if (val !== undefined) params.set(key, String(val))
    }
    const qs = params.toString()
    if (qs) url += `?${qs}`
  }

  const token = localStorage.getItem(config.tokenKey)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let detail: string | undefined
    try {
      const err = await res.json()
      detail = err.detail ?? err.message
    } catch {
      // ignore parse errors
    }
    throw new ApiException(detail ?? res.statusText, res.status, detail)
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') return {} as T
  return (await res.json()) as T
}

export const http = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) =>
    apiRequest<T>('GET', path, undefined, params),
  post: <T>(path: string, body?: unknown) => apiRequest<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => apiRequest<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>('PATCH', path, body),
  delete: <T>(path: string) => apiRequest<T>('DELETE', path),
}
