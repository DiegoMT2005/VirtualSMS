import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCalls, getCallById, createCall, updateCall, deleteCall } from '@/lib/supabase/helpers'

interface Call {
  id: string;
  created_at: string;
  updated_at: string;
  phone_number: string;
  customer_name: string | null;
  duration: number;
  status: 'completed' | 'failed' | 'no-answer' | 'busy' | 'in-progress';
  call_type: 'inbound' | 'outbound';
  recording_url: string | null;
  transcript: string | null;
  cost: number;
  notes: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  booking_id: string | null;
}

export function useCalls(limit = 50) {
  return useQuery({
    queryKey: ['calls', limit],
    queryFn: () => getCalls(limit),
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export function useCall(id: string) {
  return useQuery({
    queryKey: ['call', id],
    queryFn: () => getCallById(id),
    enabled: !!id,
  })
}

export function useCreateCall() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] })
    },
  })
}

export function useUpdateCall() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Call> }) =>
      updateCall(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calls'] })
      queryClient.invalidateQueries({ queryKey: ['call', data.id] })
    },
  })
}

export function useDeleteCall() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] })
    },
  })
}
