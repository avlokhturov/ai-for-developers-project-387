import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Booking } from '@/lib/types'
import { useI18n } from '@/lib/i18n'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  parseISO,
} from 'date-fns'

interface AdminCalendarGridProps {
  currentMonth: Date
  onMonthChange: (date: Date) => void
  bookings: Booking[]
  onCancelBooking: (id: string) => void
  cancellingId: string | null
}

const MONTH_KEYS = [
  'january','february','march','april','may','june',
  'july','august','september','october','november','december',
] as const

export default function AdminCalendarGrid({
  currentMonth,
  onMonthChange,
  bookings,
  onCancelBooking,
  cancellingId,
}: AdminCalendarGridProps) {
  const { t, locale } = useI18n()
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-US'

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const weekDayKeys = ['mon','tue','wed','thu','fri','sat','sun'] as const

  const rows: Date[][] = []
  let day = calStart
  while (day <= calEnd) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDays(day, 1)
    }
    rows.push(week)
  }

  const getBookingsForDay = (d: Date): Booking[] => {
    return bookings.filter(b => {
      try {
        const start = parseISO(b.startTime)
        return format(start, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')
      } catch {
        return false
      }
    })
  }

  const monthName = t.month[MONTH_KEYS[currentMonth.getMonth()]]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => onMonthChange(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {monthName} {currentMonth.getFullYear()}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => onMonthChange(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDayKeys.map(wd => (
          <div key={wd} className="text-center text-xs font-medium text-muted-foreground py-2">
            {t.weekDay[wd]}
          </div>
        ))}

        {rows.map((week, wi) =>
          week.map((d, di) => {
            const dateStr = format(d, 'yyyy-MM-dd')
            const inMonth = isSameMonth(d, currentMonth)
            const t_ = isToday(d)
            const dayBookings = getBookingsForDay(d)
            const isExpanded = expandedDay === dateStr

            return (
              <button
                key={`${wi}-${di}`}
                onClick={() => inMonth && dayBookings.length > 0 && setExpandedDay(isExpanded ? null : dateStr)}
                className={`
                  relative min-h-[80px] rounded-md text-sm transition-colors p-1 text-left
                  ${!inMonth ? 'text-muted-foreground/30' : 'hover:bg-accent'}
                  ${t_ ? 'border border-primary' : ''}
                `}
              >
                <div className="text-xs font-medium mb-1">{format(d, 'd')}</div>
                {inMonth && dayBookings.length > 0 && (
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 3).map(b => (
                      <div
                        key={b.id}
                        className={`
                          text-[10px] px-1 py-0.5 rounded truncate
                          ${b.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}
                        `}
                      >
                        {b.startTime.slice(11, 16)} {b.guestName}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{dayBookings.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>

      {expandedDay && (() => {
        const dayBookings = getBookingsForDay(new Date(expandedDay + 'T00:00:00'))
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
        const dayLabel = new Date(expandedDay + 'T00:00:00').toLocaleDateString(dateLocale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
        return (
          <div className="mt-4 border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{dayLabel}</h4>
              <Button variant="ghost" size="sm" onClick={() => setExpandedDay(null)}>
                {t.admin.close}
              </Button>
            </div>

            {dayBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.admin.noBookingsDay}</p>
            ) : (
              <div className="space-y-2">
                {dayBookings.map(b => (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      b.status === 'confirmed' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">
                          {b.startTime.slice(11, 16)} – {b.endTime.slice(11, 16)}
                        </span>
                        <span className="font-medium">{b.guestName}</span>
                        <span className="text-sm text-muted-foreground">{b.guestEmail}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {b.status === 'confirmed' ? t.admin.confirmed : t.admin.cancelled}
                        </span>
                      </div>
                    </div>
                    {b.status === 'confirmed' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onCancelBooking(b.id)}
                        disabled={cancellingId === b.id}
                      >
                        {cancellingId === b.id ? t.admin.cancelling : t.admin.cancel}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
