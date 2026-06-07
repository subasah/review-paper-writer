export function corsHeaders(origin?: string | null): Record<string, string> {
  const allowed = process.env.ALLOWED_ORIGINS?.split(',') || ['*']
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0] === '*' ? '*' : allowed[0]
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Scopus-Api-Key, X-Wos-Api-Key',
    'Access-Control-Max-Age': '86400',
  }
}

export function handleOptions(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(req.headers.get('origin')),
    })
  }
  return null
}

export function jsonResponse(data: unknown, req: Request, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(req.headers.get('origin')),
    },
  })
}

export function errorResponse(message: string, req: Request, status = 500): Response {
  return jsonResponse({ error: message }, req, status)
}
