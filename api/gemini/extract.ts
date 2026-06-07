import { handleOptions, jsonResponse, errorResponse } from '../_lib/cors'
import { generateText } from '../_lib/gemini'

export default async function handler(req: Request): Promise<Response> {
  const options = handleOptions(req)
  if (options) return options

  if (req.method !== 'POST') return errorResponse('Method not allowed', req, 405)

  try {
    const body = (await req.json()) as {
      studies: Array<{
        id: string
        title: string
        authors: string[]
        year: number
        abstract: string
      }>
    }

    const prompt = `Extract systematic review data from these studies. Return JSON array with fields:
studyId, authorYear, country, sampleSize, ageGroup, measuresUsed, keyFindings, intervention (if any), outcome (if any).

Only extract information explicitly stated in the abstracts. Use "Not reported" for missing fields. Do not invent data.

Studies:
${body.studies.map((s) => `ID: ${s.id}\nTitle: ${s.title}\nAuthors: ${s.authors.join(', ')}\nYear: ${s.year}\nAbstract: ${s.abstract}\n---`).join('\n')}`

    const result = await generateText(prompt, 'gemini-2.0-flash', true)
    let extractions = []
    try {
      extractions = JSON.parse(result)
    } catch {
      extractions = body.studies.map((s) => ({
        studyId: s.id,
        authorYear: `${s.authors[0] || 'Unknown'} (${s.year})`,
        country: 'Not reported',
        sampleSize: 'Not reported',
        ageGroup: 'Not reported',
        measuresUsed: 'Not reported',
        keyFindings: s.abstract.slice(0, 300),
      }))
    }

    return jsonResponse({ extractions }, req)
  } catch (e) {
    return errorResponse((e as Error).message, req)
  }
}
