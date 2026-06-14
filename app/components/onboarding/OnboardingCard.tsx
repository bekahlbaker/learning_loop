export interface OnboardingCardProps {
  title: string
  prompt?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function OnboardingCard({ title, prompt, children, footer }: OnboardingCardProps) {
  return (
    <div className="w-full rounded-2xl bg-white shadow-md p-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {prompt && <p className="text-sm text-gray-500">{prompt}</p>}
      </div>
      <div>{children}</div>
      {footer && <div>{footer}</div>}
    </div>
  )
}
