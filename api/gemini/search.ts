import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleOptions, requireGeminiKey } from '../_lib/vercel.js'
import { generateText } from '../_lib/gemini.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!requireGeminiKey(res)) return

  try {
    const body = req.body as { query: string; yearFrom: number; yearTo: number }

    const prompt = `Search for academic publications about: "${body.query}"
Publication years: ${body.yearFrom} to ${body.yearTo}

Find peer-reviewed journal articles and systematic reviews. Return JSON array with fields:
title, authors (array), year, abstract (brief summary from source), doi (if known), url, source ("gemini_search")

Mark these as web-discovered results. Only include publications you can reasonably verify exist.
Maximum 20 results. Do not invent DOIs or PMIDs.`

    const result = await generateText(prompt, undefined, true)
    let records: Array<{
      id: string
      title: string
      authors: string[]
      year: number
      abstract: string
      doi?: string
      url?: string
      source: string
      screeningDecision: string
    }> = []

    try {
      const parsed = JSON.parse(result) as Array<{
        title: string
        authors: string[]
        year: number
        abstract: string
        doi?: string
        url?: string
      }>
      records = parsed.map((r, i) => ({
        id: `gemini-${i}-${Date.now()}`,
        title: r.title,
        authors: r.authors || [],
        year: r.year,
        abstract: r.abstract || '',
        doi: r.doi,
        url: r.url,
        source: 'gemini_search',
        screeningDecision: 'pending',
      }))
    } catch {
      records = []
    }

    return res.status(200).json({
      records,
      perSource: { gemini_search: records.length },
      totalFound: records.length,
      duplicatesRemoved: 0,
    })
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
