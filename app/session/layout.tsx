import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn — Learning Loop',
  description: 'Your personalized food safety learning session.',
}

export default function SessionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
