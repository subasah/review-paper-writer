import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleOptions } from '../_lib/vercel.js'
import { searchPubMed } from './pubmed.js'
import { searchOpenAlex } from './openalex.js'
import { searchSemanticScholar } from './semantic-scholar.js'
import { searchScopus } from './scopus.js'
import { searchWoS } from './wos.js'
import type { NormalizedRecord } from './pubmed.js'

function normalizeDoi(doi?: string): string | null {
  if (!doi) return null
  return doi.toLowerCase().replace(/^https?:\/\/doi\.org\//, '').trim()
}

function deduplicateRecords(records: NormalizedRecord[]): {
  unique: NormalizedRecord[]
  duplicatesRemoved: number
} {
  const seen = new Set<string>()
  const unique: NormalizedRecord[] = []

  for (const record of records) {
    const doi = normalizeDoi(record.doi)
    const key = doi ? `doi:${doi}` : record.pmid ? `pmid:${record.pmid}` : `title:${record.title.toLowerCase().slice(0, 80)}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(record)
  }

  return { unique, duplicatesRemoved: records.length - unique.length }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = req.body as {
      booleanQuery: string
      databases: string[]
      yearFrom: number
      yearTo: number
      maxResults?: number
    }

    const { booleanQuery, databases, yearFrom, yearTo, maxResults = 50 } = body
    const perSource: Record<string, number> = {}
    const allRecords: NormalizedRecord[] = []

    const scopusKey = (req.headers['x-scopus-api-key'] as string) || process.env.SCOPUS_API_KEY
    const wosKey = (req.headers['x-wos-api-key'] as string) || process.env.WOS_API_KEY

    const searches = databases.map(async (db) => {
      try {
        let records: NormalizedRecord[] = []
        switch (db) {
          case 'pubmed':
            records = await searchPubMed(booleanQuery, yearFrom, yearTo, maxResults)
            break
          case 'openalex':
            records = await searchOpenAlex(booleanQuery, yearFrom, yearTo, maxResults)
            break
          case 'semantic_scholar':
            records = await searchSemanticScholar(booleanQuery, yearFrom, yearTo, maxResults)
            break
          case 'scopus':
            if (scopusKey) records = await searchScopus(booleanQuery, yearFrom, yearTo, scopusKey, maxResults)
            break
          case 'wos':
            if (wosKey) records = await searchWoS(booleanQuery, yearFrom, yearTo, wosKey, maxResults)
            break
        }
        perSource[db] = records.length
        return records
      } catch (e) {
        perSource[db] = 0
        console.error(`Search failed for ${db}:`, e)
        return []
      }
    })

    const results = await Promise.all(searches)
    for (const batch of results) allRecords.push(...batch)

    const { unique, duplicatesRemoved } = deduplicateRecords(allRecords)

    const records = unique.map((r) => ({
      ...r,
      screeningDecision: 'pending' as const,
    }))

    return res.status(200).json({
      records,
      perSource,
      totalFound: allRecords.length,
      duplicatesRemoved,
    })
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
