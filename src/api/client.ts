import { ApiError, type CreatePasteInput, type Paste, type PasteList } from './types'

// '' in dev (vite proxies /v1 to the local backend); an absolute URL in
// built images (VITE_API_URL baked at build time).
const BASE = import.meta.env.VITE_API_URL ?? ''

const TOKEN_KEY = 'paste-admin-token'

export function getAdminToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function setAdminToken(token: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, init)
  if (!response.ok) {
    const problem = await response.json().catch(() => null)
    throw new ApiError(response.status, problem)
  }
  return response.json() as Promise<T>
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getAdminToken()}` }
}

export function createPaste(input: CreatePasteInput): Promise<Paste> {
  return request('/v1/pastes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(input),
  })
}

export function getPaste(id: string): Promise<Paste> {
  return request(`/v1/pastes/${id}`)
}

export function listPastes(cursor?: string | null): Promise<PasteList> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  return request(`/v1/pastes${query}`, { headers: authHeaders() })
}

export function deletePaste(id: string): Promise<void> {
  return fetch(`${BASE}/v1/pastes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).then(async (response) => {
    if (!response.ok) {
      const problem = await response.json().catch(() => null)
      throw new ApiError(response.status, problem)
    }
  })
}

export function rawUrl(id: string): string {
  return `${BASE}/v1/pastes/${id}/raw`
}
