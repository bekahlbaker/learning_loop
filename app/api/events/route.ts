export async function POST(req: Request): Promise<Response> {
  let events: unknown
  try {
    events = await req.json()
  } catch {
    return new Response(null, { status: 400 })
  }

  if (!Array.isArray(events) || events.length === 0) {
    return new Response(null, { status: 400 })
  }

  const brainUrl = process.env.BRAIN_API_URL
  if (!brainUrl) {
    return new Response(null, { status: 500 })
  }

  let brainRes: Response
  try {
    brainRes = await fetch(`${brainUrl}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(events),
    })
  } catch {
    return new Response(null, { status: 502 })
  }

  return new Response(null, { status: brainRes.ok ? 202 : brainRes.status })
}
