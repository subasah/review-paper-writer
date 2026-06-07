import { handleOptions, jsonResponse, errorResponse } from '../_lib/cors.js'
import { generateText, getGeminiApiKey } from '../_lib/gemini.js'

export default async function handler(req: Request): Promise<Response> {
  const options = handleOptions(req)
  if (options) return options

  if (req.method !== 'POST') return errorResponse('Method not allowed', req, 405)

  try {
    const body = (await req.json()) as {
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

      const result = await generateText(prompt, 'gemini-2.0-flash', true)
      try {
        const parsed = JSON.parse(result) as Array<{ studyId: string; decision: string; reason: string }>
        allDecisions.push(...parsed)
      } catch {
        for (const s of batch) {
          allDecisions.push({ studyId: s.id, decision: 'maybe', reason: 'Could not auto-screen; manual review needed' })
        }
      }
    }

    return jsonResponse({ decisions: allDecisions }, req)
  } catch (e) {
    return errorResponse((e as Error).message, req)
  }
}
