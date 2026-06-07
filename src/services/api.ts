import type { StudyRecord, DatabaseSource } from '@/types/project'

const CITATION_WRAPPER = `Every factual claim must cite a paper from the provided studies list using [Author, Year] format. If evidence is insufficient, state "insufficient evidence" — do not invent citations.`

function getApiUrl(): string {
  const stored = localStorage.getItem('srw-api-url')
  return stored || import.meta.env.VITE_API_URL || 'http://localhost:3000'
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const scopus = sessionStorage.getItem('srw-scopus-key')
  const wos = sessionStorage.getItem('srw-wos-key')
  if (scopus) headers['X-Scopus-Api-Key'] = scopus
  if (wos) headers['X-Wos-Api-Key'] = wos
  return headers
}

async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error || `API error: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export interface GenerateResponse {
  text: string
  structured?: unknown
}

export interface SearchResponse {
  records: StudyRecord[]
  perSource: Record<string, number>
  totalFound: number
  duplicatesRemoved: number
}

export interface ScreenResponse {
  decisions: Array<{
    studyId: string
    decision: 'include' | 'exclude' | 'maybe'
    reason: string
  }>
}

export interface ExtractResponse {
  extractions: Array<{
    studyId: string
    authorYear: string
    country: string
    sampleSize: string
    ageGroup: string
    measuresUsed: string
    keyFindings: string
    intervention?: string
    outcome?: string
  }>
}

export const api = {
  generate: (prompt: string, studies?: StudyRecord[], jsonMode?: boolean) =>
    apiFetch<GenerateResponse>('/api/gemini/generate', {
      prompt: `${prompt}\n\n${CITATION_WRAPPER}`,
      studies,
      jsonMode,
    }),

  screen: (
    studies: StudyRecord[],
    inclusionCriteria: string[],
    exclusionCriteria: string[],
    strictness: number
  ) =>
    apiFetch<ScreenResponse>('/api/gemini/screen', {
      studies: studies.map((s) => ({
        id: s.id,
        title: s.title,
        abstract: s.abstract,
        year: s.year,
      })),
      inclusionCriteria,
      exclusionCriteria,
      strictness,
    }),

  extract: (studies: StudyRecord[]) =>
    apiFetch<ExtractResponse>('/api/gemini/extract', { studies }),

  search: (params: {
    booleanQuery: string
    databases: DatabaseSource[]
    yearFrom: number
    yearTo: number
    maxResults?: number
  }) => apiFetch<SearchResponse>('/api/search/unified', params),

  searchGrounded: (query: string, yearFrom: number, yearTo: number) =>
    apiFetch<SearchResponse>('/api/gemini/search', { query, yearFrom, yearTo }),

  analyze: (prompt: string, data: unknown) =>
    apiFetch<GenerateResponse>('/api/gemini/analyze', { prompt, data }),
}

export function setApiBaseUrl(url: string) {
  localStorage.setItem('srw-api-url', url)
}

export function getApiBaseUrl(): string {
  return getApiUrl()
}
