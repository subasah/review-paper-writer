import type { NormalizedRecord } from './pubmed'

export async function searchScopus(
  query: string,
  yearFrom: number,
  yearTo: number,
  apiKey: string,
  maxResults = 50
): Promise<NormalizedRecord[]> {
  const url = new URL('https://api.elsevier.com/content/search/scopus')
  url.searchParams.set('query', `TITLE-ABS-KEY(${query}) AND PUBYEAR > ${yearFrom - 1} AND PUBYEAR < ${yearTo + 1}`)
  url.searchParams.set('count', String(Math.min(maxResults, 25)))
  url.searchParams.set('field', 'title,creator,description,coverDate,doi,prism:doi')

  const res = await fetch(url.toString(), {
    headers: {
      'X-ELS-APIKey': apiKey,
      Accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Scopus search failed: ${res.status}`)
  const data = (await res.json()) as {
    'search-results'?: {
      entry?: Array<{
        'dc:identifier'?: string
        'dc:title'?: string
        'dc:creator'?: string
        'dc:description'?: string
        'prism:coverDate'?: string
        'prism:doi'?: string
      }>
    }
  }

  return (data['search-results']?.entry ?? []).map((entry) => {
    const year = parseInt(entry['prism:coverDate']?.slice(0, 4) || String(yearTo), 10)
    return {
      id: `scopus-${entry['dc:identifier'] || crypto.randomUUID()}`,
      title: entry['dc:title'] || 'Untitled',
      authors: entry['dc:creator']?.split(';').map((a) => a.trim()) || [],
      year,
      abstract: entry['dc:description'] || '',
      doi: entry['prism:doi'],
      url: entry['prism:doi'] ? `https://doi.org/${entry['prism:doi']}` : undefined,
      source: 'scopus',
    }
  })
}
