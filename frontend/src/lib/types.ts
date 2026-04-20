export interface EventType {
  id: string
  name: string
  description: string
  duration: number
  createdAt?: string
  updatedAt?: string
}

export interface EventTypeCreate {
  name: string
  description: string
  duration: number
}

export interface Booking {
  id: string
  eventTypeId: string
  guestName: string
  guestEmail: string
  startTime: string
  endTime: string
  status: string
  createdAt: string
}

export interface BookingCreate {
  eventTypeId: string
  guestName: string
  guestEmail: string
  startTime: string
}

export interface Slot {
  start: string
  end: string
  available: boolean
}

export interface SlotsResponse {
  date: string
  eventTypeId: string
  slots: Slot[]
}

export interface SlotsRangeResponse {
  eventTypeId: string
  dates: Record<string, Slot[]>
}

export type CalendarView = 'month' | 'week' | 'list'
