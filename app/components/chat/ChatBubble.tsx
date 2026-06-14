'use client'

export interface ChatBubbleProps {
  role: 'assistant' | 'user'
  children: React.ReactNode
  className?: string
}

export default function ChatBubble({ role, children, className = '' }: ChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      <div
        className={[
          'max-w-[80%] px-4 py-3 rounded-2xl shadow-md motion-safe:animate-bubble-in',
          isUser
            ? 'bg-gray-800 text-white rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}
