import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleOptions, requireGeminiKey } from '../_lib/vercel.js'
import { generateText } from '../_lib/gemini.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!requireGeminiKey(res)) return

  try {
    const body = req.body as {
      studies: Array<{ id: string; title: string; authors: string[]; year: number; abstract: string }>
    }

    const prompt = `Extract systematic review data from these studies. Return JSON array with fields:
studyId, authorYear, country, sampleSize, ageGroup, measuresUsed, keyFindings, intervention (if any), outcome (if any).

Only extract information explicitly stated in the abstracts. Use "Not reported" for missing fields. Do not invent data.

Studies:
${body.studies.map((s) => `ID: ${s.id}\nTitle: ${s.title}\nAuthors: ${s.authors.join(', ')}\nYear: ${s.year}\nAbstract: ${s.abstract}\n---`).join('\n')}`

    const result = await generateText(prompt, undefined, true)
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

    return res.status(200).json({ extractions })
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
