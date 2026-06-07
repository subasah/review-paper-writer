import type { NormalizedRecord } from './pubmed.js'

export async function searchOpenAlex(
  query: string,
  yearFrom: number,
  yearTo: number,
  maxResults = 50
): Promise<NormalizedRecord[]> {
  const url = new URL('https://api.openalex.org/works')
  url.searchParams.set('search', query)
  url.searchParams.set('filter', `publication_year:${yearFrom}-${yearTo}`)
  url.searchParams.set('per_page', String(Math.min(maxResults, 50)))
  url.searchParams.set('mailto', 'review-paper-writer@example.com')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('OpenAlex search failed')
  const data = (await res.json()) as {
    results?: Array<{
      id: string
      title?: string
      publication_year?: number
      doi?: string
      abstract_inverted_index?: Record<string, number[]>
      authorships?: Array<{ author?: { display_name?: string } }>
      primary_location?: { source?: { display_name?: string } }
    }>
  }

  return (data.results ?? []).map((work) => ({
    id: `openalex-${work.id.split('/').pop()}`,
    title: work.title || 'Untitled',
    authors: (work.authorships ?? []).map((a) => a.author?.display_name || 'Unknown'),
    year: work.publication_year || yearTo,
    abstract: reconstructAbstract(work.abstract_inverted_index),
    doi: work.doi?.replace('https://doi.org/', ''),
    url: work.doi || work.id,
    source: 'openalex',
    journal: work.primary_location?.source?.display_name,
  }))
}

function reconstructAbstract(index?: Record<string, number[]>): string {
  if (!index) return ''
  const words: Array<[number, string]> = []
  for (const [word, positions] of Object.entries(index)) {
    for (const pos of positions) words.push([pos, word])
  }
  return words.sort((a, b) => a[0] - b[0]).map((w) => w[1]).join(' ')
}
