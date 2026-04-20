import { Link } from 'react-router-dom'
import { useEventTypes, useDeleteEventType } from '@/hooks/useEventTypes'
import { useI18n } from '@/lib/i18n'
import EventTypesList from '@/components/EventTypesList'
import { Button } from '@/components/ui/button'

export default function AdminEventsPage() {
  const { data: eventTypes, isLoading, refetch } = useEventTypes()
  const deleteMutation = useDeleteEventType()
  const { t } = useI18n()

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
    refetch()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t.events.title}</h1>
        <Link to="/admin/events/new">
          <Button>{t.events.createNew}</Button>
        </Link>
      </div>

      {isLoading ? (
        <p>{t.common.loading}</p>
      ) : (
        <EventTypesList
          eventTypes={eventTypes || []}
          onDelete={handleDelete}
          deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
          deleteError={deleteMutation.error?.message}
        />
      )}

      <div className="mt-8">
        <Link to="/admin">
          <Button variant="ghost">&larr; {t.admin.backToDashboard}</Button>
        </Link>
      </div>
    </div>
  )
}
