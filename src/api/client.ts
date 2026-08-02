import { ApiError, type CreatePasteInput, type Paste } from './types'

// Always same-origin: /v1 is proxied to the backend by vite in dev and
// by the platform Caddy in built images. VITE_API_URL exists only as an
// escape hatch and is normally unset.
const BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, init)
  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    throw new ApiError(response.status, problem)
  }
  return response.json() as Promise<T>
}

export function createPaste(input: CreatePasteInput): Promise<Paste> {
  return request('/v1/pastes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function getPaste(id: string): Promise<Paste> {
  return request(`/v1/pastes/${id}`)
}

export function rawUrl(id: string): string {
  return `${BASE}/v1/pastes/${id}/raw`
}
