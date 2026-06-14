import SessionLayout from '@/app/components/layouts/SessionLayout'
import SessionOrchestrator from '@/app/components/session/SessionOrchestrator'

export default function SessionPage() {
  return (
    <SessionLayout>
      <SessionOrchestrator personaId="new" />
    </SessionLayout>
  )
}
