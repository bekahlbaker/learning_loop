'use client'

import ChatBubble from '@/src/components/chat/ChatBubble'

export interface TypingIndicatorProps {
  className?: string
}

export default function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <ChatBubble role="assistant" className={className}>
      <div
        role="status"
        aria-label="Assistant is typing"
        className="flex items-center gap-1 py-1"
      >
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="w-2 h-2 rounded-full bg-gray-400 motion-safe:animate-dot-bounce"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </ChatBubble>
  )
}
