import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSmsMessages, getSmsMessageById, createSmsMessage } from '@/lib/supabase/helpers'

interface SmsMessage {
  id: string;
  created_at: string;
  phone_number: string;
  direction: 'inbound' | 'outbound';
  message_body: string;
  status: 'sent' | 'delivered' | 'failed' | 'received';
  booking_id: string | null;
  cost: number;
}

export function useSmsMessages(limit = 50) {
  return useQuery({
    queryKey: ['smsMessages', limit],
    queryFn: () => getSmsMessages(limit),
    refetchInterval: 15000, // Refresh every 15 seconds
  })
}

export function useSmsMessage(id: string) {
  return useQuery({
    queryKey: ['smsMessage', id],
    queryFn: () => getSmsMessageById(id),
    enabled: !!id,
  })
}

export function useCreateSmsMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSmsMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smsMessages'] })
    },
  })
}
