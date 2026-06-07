import type { NormalizedRecord } from './pubmed.js'

export async function searchSemanticScholar(
  query: string,
  yearFrom: number,
  yearTo: number,
  maxResults = 50
): Promise<NormalizedRecord[]> {
  const url = new URL('https://api.semanticscholar.org/graph/v1/paper/search')
  url.searchParams.set('query', query)
  url.searchParams.set('limit', String(Math.min(maxResults, 50)))
  url.searchParams.set('fields', 'title,authors,year,abstract,externalIds,url,journal')

  const headers: Record<string, string> = {}
  if (process.env.SEMANTIC_SCHOLAR_API_KEY) {
    headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY
  }

  const res = await fetch(url.toString(), { headers })
  if (!res.ok) throw new Error('Semantic Scholar search failed')
  const data = (await res.json()) as {
    data?: Array<{
      paperId: string
      title?: string
      year?: number
      abstract?: string
      authors?: Array<{ name?: string }>
      externalIds?: { DOI?: string; PubMed?: string }
      url?: string
      journal?: { name?: string }
    }>
  }

  return (data.data ?? [])
    .filter((p) => !p.year || (p.year >= yearFrom && p.year <= yearTo))
    .map((paper) => ({
      id: `s2-${paper.paperId}`,
      title: paper.title || 'Untitled',
      authors: (paper.authors ?? []).map((a) => a.name || 'Unknown'),
      year: paper.year || yearTo,
      abstract: paper.abstract || '',
      doi: paper.externalIds?.DOI,
      pmid: paper.externalIds?.PubMed,
      url: paper.url,
      source: 'semantic_scholar',
      journal: paper.journal?.name,
    }))
}
