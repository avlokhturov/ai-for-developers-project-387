import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BookingCreate } from '@/lib/types'

export const bookingsKeys = {
  all: ['bookings'] as const,
  list: (filters?: { from?: string; to?: string }) => [...bookingsKeys.all, 'list', filters] as const,
  detail: (id: string) => [...bookingsKeys.all, id] as const,
}

export function useBookings(filters?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: bookingsKeys.list(filters),
    queryFn: () => api.listBookings(filters?.from, filters?.to),
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingsKeys.detail(id),
    queryFn: () => api.getBooking(id),
    enabled: !!id,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BookingCreate) => api.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.all })
    },
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingsKeys.all })
    },
  })
}