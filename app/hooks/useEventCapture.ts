'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { LearningEvent, LearningEventKind } from '@adaptive/shared'

type OmitBase<E> = Omit<
  E,
  'eventId' | 'userId' | 'sessionId' | 'timestamp' | 'clientTimestamp' | 'sequenceNumber' | 'kind'
>

export function useEventCapture(userId: string) {
  const sessionIdRef = useRef<string | null>(null)
  if (sessionIdRef.current === null) {
    sessionIdRef.current = crypto.randomUUID()
  }
  const sessionId = sessionIdRef.current

  const queueRef = useRef<LearningEvent[]>([])
  const seqRef = useRef(0)
  const isFlushingRef = useRef(false)

  const flush = useCallback(async () => {
    if (isFlushingRef.current || queueRef.current.length === 0) return
    const batch = queueRef.current.splice(0)
    isFlushingRef.current = true
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      })
    } catch {
      // best-effort: discard on failure
    } finally {
      isFlushingRef.current = false
    }
  }, [])

  // Capture latest userId in a ref so emitEvent closures stay fresh
  const userIdRef = useRef(userId)
  userIdRef.current = userId

  const emitEvent = <K extends LearningEventKind>(
    kind: K,
    payload: OmitBase<Extract<LearningEvent, { kind: K }>>
  ): void => {
    const now = new Date().toISOString()
    const event = {
      ...payload,
      kind,
      eventId: crypto.randomUUID(),
      userId: userIdRef.current,
      sessionId,
      timestamp: now,
      clientTimestamp: now,
      sequenceNumber: seqRef.current++,
    } as LearningEvent
    queueRef.current.push(event)
    if (queueRef.current.length >= 10) void flush()
  }

  useEffect(() => {
    const id = setInterval(() => void flush(), 5_000)
    return () => clearInterval(id)
  }, [flush])

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') void flush() }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [flush])

  return { emitEvent, sessionId, flush }
}
