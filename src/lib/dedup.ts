import Fuse from 'fuse.js'
import type { StudyRecord } from '@/types/project'

function normalizeDoi(doi?: string): string | null {
  if (!doi) return null
  return doi.toLowerCase().replace(/^https?:\/\/doi\.org\//, '').trim()
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
}

export function deduplicateStudies(records: StudyRecord[]): {
  unique: StudyRecord[]
  duplicatesRemoved: number
} {
  const seen = new Map<string, StudyRecord>()
  const unique: StudyRecord[] = []

  for (const record of records) {
    const doi = normalizeDoi(record.doi)
    if (doi && seen.has(`doi:${doi}`)) {
      continue
    }
    if (record.pmid && seen.has(`pmid:${record.pmid}`)) {
      continue
    }

    let isDuplicate = false
    if (unique.length > 0) {
      const fuse = new Fuse(unique, {
        keys: ['title'],
        threshold: 0.15,
        includeScore: true,
      })
      const results = fuse.search(normalizeTitle(record.title))
      if (results.length > 0 && (results[0].score ?? 1) < 0.15) {
        isDuplicate = true
      }
    }

    if (isDuplicate) continue

    if (doi) seen.set(`doi:${doi}`, record)
    if (record.pmid) seen.set(`pmid:${record.pmid}`, record)
    unique.push(record)
  }

  return {
    unique,
    duplicatesRemoved: records.length - unique.length,
  }
}

export function updatePrismaCounts(records: StudyRecord[], perSource: Record<string, number>) {
  const included = records.filter((r) => r.screeningDecision === 'include')
  const excluded = records.filter((r) => r.screeningDecision === 'exclude')
  const maybe = records.filter((r) => r.screeningDecision === 'maybe')

  return {
    identification: records.length,
    duplicatesRemoved: 0,
    recordsScreened: records.length,
    recordsExcluded: excluded.length,
    fullTextAssessed: included.length + maybe.length,
    fullTextExcluded: maybe.length,
    studiesIncluded: included.length,
    perSource,
  }
}
