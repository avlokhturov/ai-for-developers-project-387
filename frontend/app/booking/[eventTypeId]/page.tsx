'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Slot {
  start: string
  end: string
  available: boolean
}

interface EventType {
  id: string
  name: string
  description: string
  duration: number
}

export default function BookingCalendar() {
  const params = useParams()
  const router = useRouter()
  const eventTypeId = params.eventTypeId as string

  const [eventType, setEventType] = useState<EventType | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'list'>('week')
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  const loadEventType = async () => {
    const res = await fetch(`${apiUrl}/api/event-types/${eventTypeId}`)
    if (res.ok) {
      const data = await res.json()
      setEventType(data)
    }
  }

  const loadSlots = async (date: string) => {
    setLoading(true)
    const res = await fetch(`${apiUrl}/api/slots?event_type_id=${eventTypeId}&date=${date}`)
    if (res.ok) {
      const data = await res.json()
      setSlots(data.slots || [])
      setSelectedDate(date)
    }
    setLoading(false)
  }

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot)
  }

  const handleConfirm = () => {
    if (selectedSlot && selectedDate) {
      const startTime = `${selectedDate}T${selectedSlot}:00Z`
      router.push(`/booking/${eventTypeId}/confirm?slot=${encodeURIComponent(startTime)}`)
    }
  }

  const today = new Date()
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Select a Time Slot</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setViewMode('week')}>Week</button>
        <button onClick={() => setViewMode('month')}>Month</button>
        <button onClick={() => setViewMode('list')}>List</button>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <h3>Select Date</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => loadSlots(date)}
                style={{
                  padding: '0.5rem 1rem',
                  textAlign: 'left',
                  background: selectedDate === date ? '#0070f3' : '#fff',
                  color: selectedDate === date ? '#fff' : '#000',
                  border: '1px solid #ccc',
                  cursor: 'pointer'
                }}
              >
                {date}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Available Slots</h3>
          {loading ? (
            <p>Loading...</p>
          ) : slots.length === 0 ? (
            <p>Select a date to see available slots</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {slots.map((slot, i) => (
                <button
                  key={i}
                  onClick={() => slot.available && handleSlotSelect(slot.start)}
                  disabled={!slot.available}
                  style={{
                    padding: '0.5rem',
                    background: selectedSlot === slot.start ? '#0070f3' : slot.available ? '#fff' : '#eee',
                    color: selectedSlot === slot.start ? '#fff' : slot.available ? '#000' : '#999',
                    border: '1px solid #ccc',
                    cursor: slot.available ? 'pointer' : 'not-allowed'
                  }}
                >
                  {slot.start} - {slot.end}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedSlot && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <p><strong>Selected:</strong> {selectedDate} at {selectedSlot}</p>
          <button onClick={handleConfirm} style={{ padding: '0.75rem 1.5rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Confirm Booking
          </button>
        </div>
      )}
    </main>
  )
}
