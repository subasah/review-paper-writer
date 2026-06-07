import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleOptions, requireGeminiKey } from '../_lib/vercel.js'
import { generateText } from '../_lib/gemini.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!requireGeminiKey(res)) return

  try {
    const body = req.body as {
      studies: Array<{ id: string; title: string; abstract: string; year: number }>
      inclusionCriteria: string[]
      exclusionCriteria: string[]
      strictness: number
    }

    const batchSize = 20
    const allDecisions: Array<{ studyId: string; decision: string; reason: string }> = []

    for (let i = 0; i < body.studies.length; i += batchSize) {
      const batch = body.studies.slice(i, i + batchSize)
      const prompt = `You are a systematic review screener. Screen these studies against inclusion/exclusion criteria.

Inclusion criteria:
${body.inclusionCriteria.map((c) => `- ${c}`).join('\n')}

Exclusion criteria:
${body.exclusionCriteria.map((c) => `- ${c}`).join('\n')}

Screening strictness (0-100): ${body.strictness}. Higher = stricter.

Studies to screen:
${batch.map((s) => `ID: ${s.id}\nTitle: ${s.title}\nYear: ${s.year}\nAbstract: ${s.abstract?.slice(0, 800) || 'No abstract'}\n---`).join('\n')}

Return JSON array: [{"studyId": "...", "decision": "include"|"exclude"|"maybe", "reason": "..."}]
Only use study IDs provided. Do not invent studies.`

      const result = await generateText(prompt, undefined, true)
      try {
        const parsed = JSON.parse(result) as Array<{ studyId: string; decision: string; reason: string }>
        allDecisions.push(...parsed)
      } catch {
        for (const s of batch) {
          allDecisions.push({ studyId: s.id, decision: 'maybe', reason: 'Could not auto-screen; manual review needed' })
        }
      }
    }

    return res.status(200).json({ decisions: allDecisions })
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
