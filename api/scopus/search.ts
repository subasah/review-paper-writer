import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleOptions } from '../_lib/vercel.js'
import { searchScopus } from '../search/scopus.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = req.body as {
      query: string
      yearFrom: number
      yearTo: number
      maxResults?: number
    }

    const apiKey = (req.headers['x-scopus-api-key'] as string) || process.env.SCOPUS_API_KEY
    if (!apiKey) return res.status(401).json({ error: 'Scopus API key required' })

    const records = await searchScopus(
      body.query,
      body.yearFrom,
      body.yearTo,
      apiKey,
      body.maxResults
    )

    return res.status(200).json({
      records: records.map((r) => ({ ...r, screeningDecision: 'pending' })),
      perSource: { scopus: records.length },
      totalFound: records.length,
      duplicatesRemoved: 0,
    })
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
