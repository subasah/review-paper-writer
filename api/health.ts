import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleOptions } from './_lib/vercel.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return
  return res.status(200).json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  })
}
