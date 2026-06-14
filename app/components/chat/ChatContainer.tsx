'use client'

export interface ChatContainerProps {
  thread: React.ReactNode
  input: React.ReactNode
}

export default function ChatContainer({ thread, input }: ChatContainerProps) {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">{thread}</div>
      {input && (
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
          {input}
        </div>
      )}
    </div>
  )
}
