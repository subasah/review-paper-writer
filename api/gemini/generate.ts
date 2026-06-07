import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { handleOptions, requireGeminiKey } from '../_lib/vercel.js'
import { getDefaultGeminiModel } from '../_lib/gemini.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = requireGeminiKey(res)
  if (!apiKey) return

  try {
    const body = req.body as {
      prompt: string
      studies?: Array<{ title: string; authors?: string[]; year?: number; abstract?: string }>
      jsonMode?: boolean
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: getDefaultGeminiModel(),
      generationConfig: body.jsonMode
        ? { responseMimeType: 'application/json' }
        : undefined,
    })

    const studiesContext = (body.studies ?? []).length
      ? `\n\nAvailable studies for citation:\n${(body.studies ?? []).map((s, i) => `${i + 1}. ${s.authors?.[0] || 'Unknown'} (${s.year || 'n.d.'}) - ${s.title}`).join('\n')}`
      : ''

    const result = await model.generateContent(body.prompt + studiesContext)
    const text = result.response.text()

    let structured: unknown
    if (body.jsonMode) {
      try {
        structured = JSON.parse(text)
      } catch {
        structured = undefined
      }
    }

    return res.status(200).json({ text, structured })
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
