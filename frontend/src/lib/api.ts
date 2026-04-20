import { EventType, EventTypeCreate, Booking, BookingCreate, SlotsResponse, SlotsRangeResponse } from './types'

function getBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) return envUrl
  return 'http://localhost:8080'
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(data.message || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

interface EventTypesResponse {
  event_types: EventType[]
}

export const api = {
  listEventTypes(): Promise<EventType[]> {
    return request<EventTypesResponse>('/api/event-types').then(r => r.event_types)
  },

  getEventType(id: string): Promise<EventType> {
    return request(`/api/event-types/${id}`)
  },

  createEventType(data: EventTypeCreate): Promise<EventType> {
    return request('/api/event-types', { method: 'POST', body: JSON.stringify(data) })
  },

  updateEventType(id: string, data: EventTypeCreate): Promise<EventType> {
    return request(`/api/event-types/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  deleteEventType(id: string): Promise<void> {
    return request(`/api/event-types/${id}`, { method: 'DELETE' })
  },

  getSlots(eventTypeId: string, date: string): Promise<SlotsResponse> {
    return request(`/api/slots?event_type_id=${eventTypeId}&date=${date}`)
  },

  getSlotsRange(eventTypeId: string, from: string, to: string): Promise<SlotsRangeResponse> {
    return request(`/api/slots?event_type_id=${eventTypeId}&from=${from}&to=${to}`)
  },

  listBookings(from?: string, to?: string): Promise<Booking[]> {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const qs = params.toString()
    return request(`/api/bookings${qs ? `?${qs}` : ''}`)
  },

  listBookingsInRange(from: string, to: string): Promise<Booking[]> {
    return request(`/api/bookings/range?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
  },

  createBooking(data: BookingCreate): Promise<Booking> {
    return request('/api/bookings', { method: 'POST', body: JSON.stringify(data) })
  },

  getBooking(id: string): Promise<Booking> {
    return request(`/api/bookings/${id}`)
  },

  cancelBooking(id: string): Promise<void> {
    return request(`/api/bookings/${id}`, { method: 'DELETE' })
  },
}
