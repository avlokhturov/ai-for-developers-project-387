import { useNavigate } from 'react-router-dom'
import { useCreateEventType } from '@/hooks/useEventTypes'
import EventTypeForm from '@/components/EventTypeForm'

export default function NewEventTypePage() {
  const navigate = useNavigate()
  const createMutation = useCreateEventType()

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <EventTypeForm
        mode="create"
        onSuccess={() => navigate('/admin/events')}
        isSubmitting={createMutation.isPending}
        error={createMutation.error?.message}
        onSubmit={async (data) => {
          await createMutation.mutateAsync(data)
        }}
      />
    </div>
  )
}
