import type { NormalizedRecord } from './pubmed.js'

export async function searchWoS(
  query: string,
  yearFrom: number,
  yearTo: number,
  apiKey: string,
  maxResults = 50
): Promise<NormalizedRecord[]> {
  const url = 'https://api.clarivate.com/apis/wos-starter/v1/documents'
  const body = {
    q: query,
    limit: Math.min(maxResults, 50),
    db: 'WOS',
    filters: `publicationYear:${yearFrom}-${yearTo}`,
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-ApiKey': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`Web of Science search failed: ${res.status}`)
  const data = (await res.json()) as {
    hits?: Array<{
      uid?: string
      title?: string
      names?: { authors?: Array<{ displayName?: string }> }
      source?: { publishYear?: number }
      abstract?: { basic?: { paragraphs?: string[] } }
      identifiers?: { doi?: string }
    }>
  }

  return (data.hits ?? []).map((hit) => ({
    id: `wos-${hit.uid || crypto.randomUUID()}`,
    title: hit.title || 'Untitled',
    authors: (hit.names?.authors ?? []).map((a) => a.displayName || 'Unknown'),
    year: hit.source?.publishYear || yearTo,
    abstract: hit.abstract?.basic?.paragraphs?.join(' ') || '',
    doi: hit.identifiers?.doi,
    url: hit.identifiers?.doi ? `https://doi.org/${hit.identifiers.doi}` : undefined,
    source: 'wos',
  }))
}
