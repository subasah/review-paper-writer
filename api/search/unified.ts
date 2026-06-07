import { handleOptions, jsonResponse, errorResponse } from '../_lib/cors.js'
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

export default async function handler(req: Request): Promise<Response> {
  const options = handleOptions(req)
  if (options) return options

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', req, 405)
  }

  try {
    const body = (await req.json()) as {
      booleanQuery: string
      databases: string[]
      yearFrom: number
      yearTo: number
      maxResults?: number
    }

    const { booleanQuery, databases, yearFrom, yearTo, maxResults = 50 } = body
    const perSource: Record<string, number> = {}
    const allRecords: NormalizedRecord[] = []

    const scopusKey = req.headers.get('X-Scopus-Api-Key') || process.env.SCOPUS_API_KEY
    const wosKey = req.headers.get('X-Wos-Api-Key') || process.env.WOS_API_KEY

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

    return jsonResponse({
      records,
      perSource,
      totalFound: allRecords.length,
      duplicatesRemoved,
    }, req)
  } catch (e) {
    return errorResponse((e as Error).message, req)
  }
}
