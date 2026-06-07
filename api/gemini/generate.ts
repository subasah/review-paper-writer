import { handleOptions, jsonResponse, errorResponse } from '../_lib/cors'
import { generateWithStudies } from '../_lib/gemini'

export default async function handler(req: Request): Promise<Response> {
  const options = handleOptions(req)
  if (options) return options

  if (req.method !== 'POST') return errorResponse('Method not allowed', req, 405)

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
