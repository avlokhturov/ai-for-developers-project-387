import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slot } from '@/lib/types'
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
  isBefore,
  startOfDay,
  isAfter,
} from 'date-fns'

interface CalendarGridProps {
  currentMonth: Date
  onMonthChange: (date: Date) => void
  slotsByDate: Record<string, Slot[]>
  selectedDate: string | null
  onSelectDate: (date: string) => void
}

const MONTH_KEYS = [
  'january','february','march','april','may','june',
  'july','august','september','october','november','december',
] as const

export default function CalendarGrid({
  currentMonth,
  onMonthChange,
  slotsByDate,
  selectedDate,
  onSelectDate,
}: CalendarGridProps) {
  const { t } = useI18n()

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const today = startOfDay(new Date())
  const maxDate = addDays(today, 14)

  const weekDayKeys = ['mon','tue','wed','thu','fri','sat','sun'] as const

  const rows: Date[][] = []
  let day = calStart
  while (!isAfter(day, calEnd)) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDays(day, 1)
    }
    rows.push(week)
  }

  const getAvailableCount = (d: Date): number => {
    const key = format(d, 'yyyy-MM-dd')
    const slots = slotsByDate[key]
    if (!slots) return 0
    return slots.filter(s => s.available).length
  }

  const isDaySelectable = (d: Date): boolean => {
    return !isBefore(d, today) && !isAfter(d, maxDate)
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
            const selectable = isDaySelectable(d)
            const available = getAvailableCount(d)
            const selected = selectedDate === dateStr
            const today_ = isToday(d)

            return (
              <button
                key={`${wi}-${di}`}
                disabled={!inMonth || !selectable}
                onClick={() => onSelectDate(dateStr)}
                className={`
                  relative h-16 rounded-md text-sm transition-colors flex flex-col items-center justify-center gap-0.5
                  ${!inMonth ? 'text-muted-foreground/30 cursor-default' : ''}
                  ${!selectable && inMonth ? 'text-muted-foreground/50 cursor-default' : ''}
                  ${selectable && inMonth ? 'hover:bg-accent cursor-pointer' : ''}
                  ${selected ? 'bg-primary text-primary-foreground hover:bg-primary' : ''}
                  ${today_ && !selected ? 'border border-primary' : ''}
                `}
              >
                <span className="text-sm">{format(d, 'd')}</span>
                {inMonth && selectable && available > 0 && !selected && (
                  <span className="text-[10px] font-medium text-green-600">
                    {available} {t.booking.free}
                  </span>
                )}
                {inMonth && selectable && available === 0 && !selected && slotsByDate[dateStr] && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
