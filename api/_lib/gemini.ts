import { GoogleGenerativeAI } from '@google/generative-ai'

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim()
}

export function getGeminiClient() {
  const apiKey = getGeminiApiKey()
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')
  return new GoogleGenerativeAI(apiKey)
}

export async function generateText(
  prompt: string,
  model = 'gemini-2.0-flash',
  jsonMode = false
): Promise<string> {
  const genAI = getGeminiClient()
  const m = genAI.getGenerativeModel({
    model,
    generationConfig: jsonMode
      ? { responseMimeType: 'application/json' }
      : undefined,
  })
  const result = await m.generateContent(prompt)
  return result.response.text()
}

export async function generateWithStudies(
  prompt: string,
  studies: Array<{ title: string; authors?: string[]; year?: number; abstract?: string }>,
  model = 'gemini-2.0-flash',
  jsonMode = false
): Promise<string> {
  const studiesContext = studies.length
    ? `\n\nAvailable studies for citation:\n${studies.map((s, i) => `${i + 1}. ${s.authors?.[0] || 'Unknown'} (${s.year || 'n.d.'}) - ${s.title}. Abstract: ${s.abstract?.slice(0, 500) || 'N/A'}`).join('\n')}`
    : ''
  return generateText(prompt + studiesContext, model, jsonMode)
}
