import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slot } from '@/lib/types'
import { useI18n } from '@/lib/i18n'
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isToday,
  isBefore,
  startOfDay,
  isAfter,
} from 'date-fns'

interface WeekViewProps {
  currentWeek: Date
  onWeekChange: (date: Date) => void
  slotsByDate: Record<string, Slot[]>
  selectedDate: string | null
  selectedSlot: string | null
  onSelectSlot: (date: string, slotStart: string) => void
}

const HOURS = Array.from({ length: 9 }, (_, i) => i + 9)

function getDayKey(date: Date): 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun' {
  const jsDay = date.getDay()
  const map: Record<number, 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'> = {
    1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat', 0: 'sun',
  }
  return map[jsDay]
}

export default function WeekView({
  currentWeek,
  onWeekChange,
  slotsByDate,
  selectedDate,
  selectedSlot,
  onSelectSlot,
}: WeekViewProps) {
  const { t, locale } = useI18n()

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const today = startOfDay(new Date())
  const maxDate = addDays(today, 14)
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-US'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => onWeekChange(subWeeks(currentWeek, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {format(weekStart, 'd MMM', { locale: undefined }).replace(
            /^\d+\s+\w+/,
            weekStart.toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })
          )} — {weekEnd.toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' })}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => onWeekChange(addWeeks(currentWeek, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
            <div />
            {days.map(d => {
              const t_ = isToday(d)
              return (
                <div
                  key={d.toISOString()}
                  className={`text-center py-2 text-sm font-medium ${t_ ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <div className="text-xs">{t.weekDay[getDayKey(d)]}</div>
                  <div className={`text-lg ${t_ ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                    {format(d, 'd')}
                  </div>
                </div>
              )
            })}
          </div>

          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-b-0">
              <div className="text-xs text-muted-foreground text-right pr-2 py-3">
                {String(hour).padStart(2, '0')}:00
              </div>
              {days.map(d => {
                const dateStr = format(d, 'yyyy-MM-dd')
                const inRange = !isBefore(d, today) && !isAfter(d, maxDate)
                const slots = slotsByDate[dateStr] || []
                const hourSlots = slots.filter(s => {
                  const h = parseInt(s.start.split(':')[0], 10)
                  return h === hour
                })

                return (
                  <div key={dateStr + hour} className="border-l p-0.5 min-h-[48px]">
                    {inRange && hourSlots.map(slot => {
                      const isSelected = selectedDate === dateStr && selectedSlot === slot.start
                      return (
                        <button
                          key={slot.start}
                          onClick={() => slot.available && onSelectSlot(dateStr, slot.start)}
                          disabled={!slot.available}
                          className={`
                            w-full text-xs px-1 py-1 rounded mb-0.5 transition-colors
                            ${!slot.available ? 'bg-red-100 text-red-400 cursor-default' : ''}
                            ${slot.available && !isSelected ? 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer' : ''}
                            ${isSelected ? 'bg-primary text-primary-foreground cursor-pointer' : ''}
                          `}
                        >
                          {slot.start}–{slot.end}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
