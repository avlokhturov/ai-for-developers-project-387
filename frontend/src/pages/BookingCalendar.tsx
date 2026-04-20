import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEventType, useSlotsRange } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import WeekView from '@/components/calendar/WeekView'
import ListView from '@/components/calendar/ListView'
import ViewSwitcher from '@/components/calendar/ViewSwitcher'
import { CalendarView, Slot } from '@/lib/types'
import { useI18n } from '@/lib/i18n'
import { format, addDays, startOfMonth, startOfWeek } from 'date-fns'

export default function BookingCalendar() {
  const params = useParams<{ eventTypeId: string }>()
  const navigate = useNavigate()
  const eventTypeId = params.eventTypeId!
  const { t, locale } = useI18n()
  const { data: eventType, isLoading: eventLoading } = useEventType(eventTypeId)

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const maxDateStr = format(addDays(today, 14), 'yyyy-MM-dd')

  const [view, setView] = useState<CalendarView>('month')
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today))
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(today, { weekStartsOn: 1 }))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const { data: rangeData, isLoading: slotsLoading } = useSlotsRange(
    eventTypeId,
    todayStr,
    maxDateStr
  )

  const slotsByDate = rangeData?.dates || {}

  const handleSelectSlot = (date: string, slotStart: string) => {
    setSelectedDate(date)
    setSelectedSlot(slotStart)
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  const handleConfirm = () => {
    if (selectedSlot && selectedDate) {
      const startTime = `${selectedDate}T${selectedSlot}:00Z`
      navigate(`/booking/${eventTypeId}/confirm?slot=${encodeURIComponent(startTime)}`)
    }
  }

  const formatDate = (date: string) =>
    new Date(date + 'T00:00:00').toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })

  if (eventLoading) {
    return <div className="container mx-auto px-4 py-8">{t.common.loading}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
        &larr; {t.booking.back}
      </Button>

      {eventType && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{eventType.name}</CardTitle>
            <CardDescription>{eventType.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <strong>{t.booking.duration}:</strong> {eventType.duration} {t.booking.min}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{t.booking.selectTime}</h2>
        <ViewSwitcher view={view} onViewChange={setView} />
      </div>

      {slotsLoading ? (
        <div className="text-center py-12 text-muted-foreground">{t.booking.loadingSlots}</div>
      ) : (
        <>
          {view === 'month' && (
            <CalendarGrid
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              slotsByDate={slotsByDate}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
          )}

          {view === 'week' && (
            <WeekView
              currentWeek={currentWeek}
              onWeekChange={setCurrentWeek}
              slotsByDate={slotsByDate}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
            />
          )}

          {view === 'list' && (
            <ListView
              slotsByDate={slotsByDate}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
            />
          )}
        </>
      )}

      {view === 'month' && selectedDate && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">{t.booking.availableOn} {formatDate(selectedDate)}</h3>
          {(() => {
            const slots: Slot[] = slotsByDate[selectedDate] || []
            const available = slots.filter(s => s.available)
            if (available.length === 0) {
              return <p className="text-muted-foreground">{t.booking.noSlots}</p>
            }
            return (
              <div className="grid grid-cols-4 gap-2">
                {available.map(slot => (
                  <Button
                    key={slot.start}
                    variant={selectedSlot === slot.start ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSlot(slot.start)}
                  >
                    {slot.start} – {slot.end}
                  </Button>
                ))}
              </div>
            )
          })()}
        </div>
      )}

      {selectedSlot && selectedDate && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="mb-4">
              <strong>{t.booking.selected}:</strong> {formatDate(selectedDate)} {t.booking.at} {selectedSlot}
            </p>
            <Button onClick={handleConfirm}>{t.booking.confirmBooking}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
