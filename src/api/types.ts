// Mirrors paste-backend/api/openapi.yaml (the contract source of truth).

export interface Paste {
  id: string
  url: string
  rawUrl: string
  syntax: string
  createdAt: string
  expiresAt: string | null
  burnAfterReading: boolean
  sizeBytes: number
  content?: string
  burned?: boolean
}

export interface PasteList {
  items: Paste[]
  nextCursor: string | null
}

export interface CreatePasteInput {
  content: string
  syntax?: string
  expiresIn?: number | null
  burnAfterReading?: boolean
}

export interface Problem {
  title?: string
  status?: number
  detail?: string
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, problem: Problem | null) {
    super(problem?.detail ?? problem?.title ?? `Request failed (${status})`)
    this.status = status
  }
}
