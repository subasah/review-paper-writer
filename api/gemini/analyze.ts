import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleOptions, requireGeminiKey } from '../_lib/vercel.js'
import { generateText } from '../_lib/gemini.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!requireGeminiKey(res)) return

  try {
    const body = req.body as { prompt: string; data: unknown }
    const fullPrompt = `${body.prompt}\n\nData:\n${JSON.stringify(body.data, null, 2)}`
    const text = await generateText(fullPrompt, 'gemini-2.0-flash', false)
    return res.status(200).json({ text })
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
