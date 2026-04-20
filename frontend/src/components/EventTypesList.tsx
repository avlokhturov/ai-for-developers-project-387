import { Link } from 'react-router-dom'
import { EventType } from '@/lib/types'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface EventTypesListProps {
  eventTypes: EventType[]
  onDelete: (id: string) => void
  deletingId?: string | null
  deleteError?: string
}

export default function EventTypesList({ eventTypes, onDelete, deletingId, deleteError }: EventTypesListProps) {
  const { t } = useI18n()

  if (eventTypes.length === 0) {
    return <p className="text-muted-foreground">{t.events.noEvents}</p>
  }

  return (
    <div>
      {deleteError && <p className="text-sm text-destructive mb-4">{deleteError}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.events.name}</TableHead>
            <TableHead>{t.events.description}</TableHead>
            <TableHead>{t.events.duration}</TableHead>
            <TableHead>{t.events.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eventTypes.map((et) => (
            <TableRow key={et.id}>
              <TableCell className="font-medium">{et.name}</TableCell>
              <TableCell>{et.description}</TableCell>
              <TableCell>{et.duration} {t.booking.min}</TableCell>
              <TableCell className="flex gap-2">
                <Link to={`/admin/events/${et.id}/edit`}>
                  <Button variant="outline" size="sm">
                    {t.events.edit}
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingId === et.id}
                  onClick={() => {
                    if (confirm(t.events.deleteConfirm)) {
                      onDelete(et.id)
                    }
                  }}
                >
                  {deletingId === et.id ? t.events.deleting : t.events.delete}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
