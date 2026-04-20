import { useParams, useNavigate } from 'react-router-dom'
import { useEventType, useUpdateEventType } from '@/hooks/useEventTypes'
import { useI18n } from '@/lib/i18n'
import EventTypeForm from '@/components/EventTypeForm'

export default function EditEventTypePage() {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const id = params.id!
  const { t } = useI18n()

  const { data: eventType, isLoading, error } = useEventType(id)
  const updateMutation = useUpdateEventType()

  if (isLoading) return <div className="container mx-auto px-4 py-8">{t.common.loading}</div>
  if (error) return <div className="container mx-auto px-4 py-8 text-destructive">{error.message}</div>
  if (!eventType) return <div className="container mx-auto px-4 py-8">{t.common.eventTypeNotFound}</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <EventTypeForm
        mode="edit"
        eventType={eventType}
        onSuccess={() => navigate('/admin/events')}
        isSubmitting={updateMutation.isPending}
        error={updateMutation.error?.message}
        onSubmit={async (data) => {
          await updateMutation.mutateAsync({ id, data })
        }}
      />
    </div>
  )
}
