import { clearAuthSession, getAuthToken } from '@/store/authStore'
import type { ApiError } from '@/types'

const BASE_URL = '/api'

export class ApiClientError extends Error implements ApiError {
  code: string
  details?: unknown

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'ApiClientError'
    this.code = error.code
    this.details = error.details
  }
}

function buildHeaders(body: unknown, headers?: HeadersInit): Headers {
  const result = new Headers(headers)
  if (body !== undefined && !(body instanceof FormData) && !result.has('Content-Type')) {
    result.set('Content-Type', 'application/json')
  }
  const token = getAuthToken()
  if (token) {
    result.set('Authorization', `Bearer ${token}`)
  }
  return result
}

async function parseError(response: Response): Promise<ApiClientError> {
  try {
    const body = (await response.json()) as Partial<ApiError>
    return new ApiClientError({
      code: body.code ?? `HTTP_${response.status}`,
      message: body.message ?? response.statusText,
      details: body.details,
    })
  } catch {
    return new ApiClientError({
      code: `HTTP_${response.status}`,
      message: response.statusText || 'Request failed',
    })
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: buildHeaders(body, headers),
    body:
      body instanceof FormData || typeof body === 'string' || body === undefined
        ? (body as BodyInit | undefined)
        : JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await parseError(response)
    if (response.status === 401 && !path.startsWith('/auth/login')) {
      clearAuthSession()
    }
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),

  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: body as BodyInit }),

  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PUT', body: body as BodyInit }),

  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PATCH', body: body as BodyInit }),

  delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' }),
}
