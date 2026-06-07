import { handleOptions, jsonResponse, errorResponse } from '../_lib/cors'
import { generateText } from '../_lib/gemini'

export default async function handler(req: Request): Promise<Response> {
  const options = handleOptions(req)
  if (options) return options

  if (req.method !== 'POST') return errorResponse('Method not allowed', req, 405)

  try {
    const body = (await req.json()) as { prompt: string; data: unknown }
    const fullPrompt = `${body.prompt}\n\nData:\n${JSON.stringify(body.data, null, 2)}`
    const text = await generateText(fullPrompt, 'gemini-2.0-flash', false)
    return jsonResponse({ text }, req)
  } catch (e) {
    return errorResponse((e as Error).message, req)
  }
}
