import { handleOptions, jsonResponse, errorResponse } from '../_lib/cors.js'
import { generateWithStudies, getGeminiApiKey } from '../_lib/gemini.js'

export default async function handler(req: Request): Promise<Response> {
  const options = handleOptions(req)
  if (options) return options

  if (req.method !== 'POST') return errorResponse('Method not allowed', req, 405)

  if (!getGeminiApiKey()) {
    return errorResponse('GEMINI_API_KEY not configured. Add it in Vercel → Settings → Environment Variables, then redeploy.', req, 500)
  }

  try {
    const body = (await req.json()) as {
      prompt: string
      studies?: Array<{ title: string; authors?: string[]; year?: number; abstract?: string }>
      jsonMode?: boolean
    }

    const text = await generateWithStudies(
      body.prompt,
      body.studies ?? [],
      'gemini-2.0-flash',
      body.jsonMode ?? false
    )

    let structured: unknown
    if (body.jsonMode) {
      try {
        structured = JSON.parse(text)
      } catch {
        structured = undefined
      }
    }

    return jsonResponse({ text, structured }, req)
  } catch (e) {
    return errorResponse((e as Error).message, req)
  }
}
