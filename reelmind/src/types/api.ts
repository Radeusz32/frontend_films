export interface ApiError {
  message: string
  status: number
  detail?: string
}

export class ApiException extends Error {
  status: number
  detail?: string

  constructor(message: string, status: number, detail?: string) {
    super(message)
    this.name = 'ApiException'
    this.status = status
    this.detail = detail
  }
}

export interface SearchResult<T> {
  results: T[]
  count: number
}
