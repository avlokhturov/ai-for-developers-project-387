import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { EventTypeCreate } from '@/lib/types'

export const eventTypesKeys = {
  all: ['eventTypes'] as const,
  detail: (id: string) => ['eventTypes', id] as const,
}

export function useEventTypes() {
  return useQuery({
    queryKey: eventTypesKeys.all,
    queryFn: () => api.listEventTypes(),
  })
}

export function useEventType(id: string) {
  return useQuery({
    queryKey: eventTypesKeys.detail(id),
    queryFn: () => api.getEventType(id),
    enabled: !!id,
  })
}

export function useCreateEventType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EventTypeCreate) => api.createEventType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypesKeys.all })
    },
  })
}

export function useUpdateEventType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventTypeCreate }) =>
      api.updateEventType(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: eventTypesKeys.all })
      queryClient.invalidateQueries({ queryKey: eventTypesKeys.detail(id) })
    },
  })
}

export function useDeleteEventType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteEventType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypesKeys.all })
    },
  })
}