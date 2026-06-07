export interface NormalizedRecord {
  id: string
  title: string
  authors: string[]
  year: number
  abstract: string
  doi?: string
  pmid?: string
  url?: string
  source: string
  journal?: string
}

export async function searchPubMed(
  query: string,
  yearFrom: number,
  yearTo: number,
  maxResults = 50
): Promise<NormalizedRecord[]> {
  const searchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi')
  searchUrl.searchParams.set('db', 'pubmed')
  searchUrl.searchParams.set('term', `${query} AND (${yearFrom}:${yearTo}[pdat])`)
  searchUrl.searchParams.set('retmax', String(maxResults))
  searchUrl.searchParams.set('retmode', 'json')

  const searchRes = await fetch(searchUrl.toString())
  if (!searchRes.ok) throw new Error('PubMed search failed')
  const searchData = (await searchRes.json()) as { esearchresult?: { idlist?: string[] } }
  const ids = searchData.esearchresult?.idlist ?? []
  if (ids.length === 0) return []

  const fetchUrl = new URL('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi')
  fetchUrl.searchParams.set('db', 'pubmed')
  fetchUrl.searchParams.set('id', ids.join(','))
  fetchUrl.searchParams.set('retmode', 'xml')

  const fetchRes = await fetch(fetchUrl.toString())
  if (!fetchRes.ok) throw new Error('PubMed fetch failed')
  const xml = await fetchRes.text()

  return parsePubMedXml(xml)
}

function parsePubMedXml(xml: string): NormalizedRecord[] {
  const articles = xml.split('<PubmedArticle>').slice(1)
  return articles.map((article) => {
    const pmid = extractTag(article, 'PMID')
    const title = extractTag(article, 'ArticleTitle') || 'Untitled'
    const abstract = extractAbstract(article)
    const year = parseInt(extractTag(article, 'Year') || '0', 10)
    const journal = extractTag(article, 'Title')
    const authors = extractAuthors(article)
    const doi = extractDoi(article)

    return {
      id: `pubmed-${pmid}`,
      title: decodeXml(title),
      authors,
      year: year || new Date().getFullYear(),
      abstract: decodeXml(abstract),
      doi,
      pmid,
      url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : undefined,
      source: 'pubmed',
      journal: journal ? decodeXml(journal) : undefined,
    }
  })
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return match?.[1]?.trim() || ''
}

function extractAbstract(xml: string): string {
  const parts = [...xml.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)]
  return parts.map((m) => m[1]).join(' ')
}

function extractAuthors(xml: string): string[] {
  const authors: string[] = []
  const blocks = [...xml.matchAll(/<Author[^>]*>([\s\S]*?)<\/Author>/g)]
  for (const block of blocks) {
    const last = extractTag(block[1], 'LastName')
    const fore = extractTag(block[1], 'ForeName')
    if (last) authors.push(fore ? `${fore} ${last}` : last)
  }
  return authors
}

function extractDoi(xml: string): string | undefined {
  const match = xml.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/)
  return match?.[1]
}

function decodeXml(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
}
