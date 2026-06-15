import { buildSystemPrompt, buildUserMessage } from '@/app/lib/teacher-prompt'
import type { TeacherContext } from '@/app/lib/teacher-prompt'
import type { TeachingTone, ExplanationDepth } from '@adaptive/shared'

interface TeacherRequestBody extends TeacherContext {
  teachingTone: TeachingTone
  explanationDepth: ExplanationDepth
}

export async function POST(req: Request): Promise<Response> {
  let body: TeacherRequestBody
  try {
    body = await req.json()
  } catch {
    return new Response(null, { status: 400 })
  }

  const { teachingTone, explanationDepth, ...ctx } = body

  if (!teachingTone || !explanationDepth || !ctx.questionPrompt || !ctx.lessonTitle) {
    return new Response(null, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(null, { status: 500 })
  }

  let anthropicRes: Response
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        stream: true,
        system: buildSystemPrompt(teachingTone, explanationDepth),
        messages: [{ role: 'user', content: buildUserMessage(ctx) }],
      }),
    })
  } catch {
    return new Response(null, { status: 502 })
  }

  if (!anthropicRes.ok || !anthropicRes.body) {
    return new Response(null, { status: 502 })
  }

  // Transform Anthropic's SSE format into a plain text stream so the client
  // can append chunks directly without parsing SSE framing.
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = anthropicRes.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6)
            if (payload === '[DONE]') continue
            try {
              const parsed = JSON.parse(payload)
              if (
                parsed.type === 'content_block_delta' &&
                parsed.delta?.type === 'text_delta' &&
                typeof parsed.delta.text === 'string'
              ) {
                controller.enqueue(encoder.encode(parsed.delta.text))
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
