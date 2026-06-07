import type { VercelRequest, VercelResponse } from '@vercel/node'

export function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Scopus-Api-Key, X-Wos-Api-Key')
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  setCors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }
  return false
}

export function requireGeminiKey(res: VercelResponse): string | null {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY not configured. Add it in Vercel → Settings → Environment Variables, then redeploy.',
    })
    return null
  }
  return apiKey
}
