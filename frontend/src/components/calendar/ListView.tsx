import { Slot } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { format, addDays, startOfDay, isAfter } from 'date-fns'

interface ListViewProps {
  slotsByDate: Record<string, Slot[]>
  selectedDate: string | null
  selectedSlot: string | null
  onSelectSlot: (date: string, slotStart: string) => void
}

export default function ListView({
  slotsByDate,
  selectedDate,
  selectedSlot,
  onSelectSlot,
}: ListViewProps) {
  const { t, locale } = useI18n()

  const today = startOfDay(new Date())
  const maxDate = addDays(today, 14)
  const dateLocale = locale === 'ru' ? 'ru-RU' : 'en-US'

  const dates: string[] = []
  for (let d = new Date(today); !isAfter(d, maxDate); d = addDays(d, 1)) {
    const key = format(d, 'yyyy-MM-dd')
    if (slotsByDate[key]) {
      dates.push(key)
    }
  }

  if (dates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t.booking.loadingSlots}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto">
      {dates.map(dateStr => {
        const slots = slotsByDate[dateStr] || []
        const available = slots.filter(s => s.available)
        const dayLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString(dateLocale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

        return (
          <div key={dateStr}>
            <h4 className="font-semibold mb-2">
              {dayLabel}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({available.length} {t.booking.free})
              </span>
            </h4>

            {available.length === 0 ? (
              <p className="text-sm text-muted-foreground pl-2">{t.booking.noSlots}</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {available.map(slot => {
                  const isSelected = selectedDate === dateStr && selectedSlot === slot.start
                  return (
                    <Button
                      key={slot.start}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onSelectSlot(dateStr, slot.start)}
                      className="text-xs"
                    >
                      {slot.start} – {slot.end}
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
