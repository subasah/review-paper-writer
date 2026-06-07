import { handleOptions, jsonResponse, errorResponse } from '../_lib/cors'
import { searchScopus } from '../search/scopus'

export default async function handler(req: Request): Promise<Response> {
  const options = handleOptions(req)
  if (options) return options

  if (req.method !== 'POST') return errorResponse('Method not allowed', req, 405)

  try {
    const body = (await req.json()) as {
      query: string
      yearFrom: number
      yearTo: number
      maxResults?: number
    }

    const apiKey = req.headers.get('X-Scopus-Api-Key') || process.env.SCOPUS_API_KEY
    if (!apiKey) return errorResponse('Scopus API key required', req, 401)

    const records = await searchScopus(
      body.query,
      body.yearFrom,
      body.yearTo,
      apiKey,
      body.maxResults
    )

    return jsonResponse({
      records: records.map((r) => ({ ...r, screeningDecision: 'pending' })),
      perSource: { scopus: records.length },
      totalFound: records.length,
      duplicatesRemoved: 0,
    }, req)
  } catch (e) {
    return errorResponse((e as Error).message, req)
  }
}
