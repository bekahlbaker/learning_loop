export interface OnboardingLayoutProps {
  children: React.ReactNode
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full sm:max-w-lg flex flex-col">{children}</div>
    </div>
  )
}
