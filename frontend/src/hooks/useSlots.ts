import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export const slotsKeys = {
  all: ['slots'] as const,
  byDate: (eventTypeId: string, date: string) => [...slotsKeys.all, eventTypeId, date] as const,
  range: (eventTypeId: string, from: string, to: string) => [...slotsKeys.all, 'range', eventTypeId, from, to] as const,
}

export function useSlots(eventTypeId: string, date: string) {
  return useQuery({
    queryKey: slotsKeys.byDate(eventTypeId, date),
    queryFn: () => api.getSlots(eventTypeId, date),
    enabled: !!eventTypeId && !!date,
  })
}

export function useSlotsRange(eventTypeId: string, from: string, to: string) {
  return useQuery({
    queryKey: slotsKeys.range(eventTypeId, from, to),
    queryFn: () => api.getSlotsRange(eventTypeId, from, to),
    enabled: !!eventTypeId && !!from && !!to,
  })
}
