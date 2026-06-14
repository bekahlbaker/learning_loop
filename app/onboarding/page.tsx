'use client'

import { useRouter } from 'next/navigation'
import OnboardingLayout from '@/app/components/layouts/OnboardingLayout'
import OnboardingFlow from '@/app/components/onboarding/OnboardingFlow'
import type { OnboardingProfile } from '@/app/components/onboarding/OnboardingFlow'

export default function OnboardingPage() {
  const router = useRouter()

  const handleComplete = (profile: OnboardingProfile) => {
    // TODO: remove before launch — for debugging only
    console.log('[Learning Loop] Onboarding complete:', profile)
    document.cookie = 'll_session=1; path=/; SameSite=Lax'
    router.push('/session')
  }

  return (
    <OnboardingLayout>
      <div className="flex flex-col justify-center min-h-screen px-4 py-10">
        <OnboardingFlow onComplete={handleComplete} />
      </div>
    </OnboardingLayout>
  )
}
