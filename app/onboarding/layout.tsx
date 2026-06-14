import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get Started — Learning Loop',
  description: 'Set up your personalized food safety certification plan.',
}

export default function OnboardingRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
