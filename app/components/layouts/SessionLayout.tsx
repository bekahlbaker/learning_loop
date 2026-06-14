export interface SessionLayoutProps {
  children: React.ReactNode
}

export default function SessionLayout({ children }: SessionLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  )
}
