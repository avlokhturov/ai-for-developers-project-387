import { Button } from '@/components/ui/button'
import { CalendarView } from '@/lib/types'
import { useI18n } from '@/lib/i18n'
import { Calendar, LayoutList, CalendarDays } from 'lucide-react'

interface ViewSwitcherProps {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
}

export default function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
  const { t } = useI18n()

  const views: { key: CalendarView; label: string; icon: React.ReactNode }[] = [
    { key: 'month', label: t.viewSwitcher.month, icon: <CalendarDays className="h-4 w-4 mr-1" /> },
    { key: 'week', label: t.viewSwitcher.week, icon: <Calendar className="h-4 w-4 mr-1" /> },
    { key: 'list', label: t.viewSwitcher.list, icon: <LayoutList className="h-4 w-4 mr-1" /> },
  ]

  return (
    <div className="flex gap-1 bg-muted rounded-lg p-1">
      {views.map(v => (
        <Button
          key={v.key}
          variant={view === v.key ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(v.key)}
          className="flex items-center"
        >
          {v.icon}
          {v.label}
        </Button>
      ))}
    </div>
  )
}
