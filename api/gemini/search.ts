import { handleOptions, jsonResponse, errorResponse } from '../_lib/cors.js'
import { generateText, getGeminiApiKey } from '../_lib/gemini.js'

export default async function handler(req: Request): Promise<Response> {
  const options = handleOptions(req)
  if (options) return options

  if (req.method !== 'POST') return errorResponse('Method not allowed', req, 405)

  try {
    const body = (await req.json()) as {
      query: string
      yearFrom: number
      yearTo: number
    }

    const prompt = `Search for academic publications about: "${body.query}"
Publication years: ${body.yearFrom} to ${body.yearTo}

Find peer-reviewed journal articles and systematic reviews. Return JSON array with fields:
title, authors (array), year, abstract (brief summary from source), doi (if known), url, source ("gemini_search")

Mark these as web-discovered results. Only include publications you can reasonably verify exist.
Maximum 20 results. Do not invent DOIs or PMIDs.`

    const result = await generateText(prompt, 'gemini-2.0-flash', true)
    let records = []
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

    return jsonResponse({
      records,
      perSource: { gemini_search: records.length },
      totalFound: records.length,
      duplicatesRemoved: 0,
    }, req)
  } catch (e) {
    return errorResponse((e as Error).message, req)
  }
}
