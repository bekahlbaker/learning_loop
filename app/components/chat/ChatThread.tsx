'use client'

import { useEffect, useRef } from 'react'
import ChatBubble from '@/src/components/chat/ChatBubble'
import TypingIndicator from '@/src/components/chat/TypingIndicator'

export interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
}

export interface ChatThreadProps {
  messages: Message[]
  isTyping: boolean
}

export default function ChatThread({ messages, isTyping }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  return (
    <div
      aria-live="polite"
      aria-label="Conversation"
      className="flex flex-col gap-3 p-4 pb-6"
    >
      {messages.map((msg) => (
        <ChatBubble key={msg.id} role={msg.role}>
          <p className="text-sm leading-relaxed">{msg.content}</p>
        </ChatBubble>
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  )
}
