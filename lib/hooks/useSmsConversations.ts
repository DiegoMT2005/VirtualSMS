import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface SmsConversation {
  id: string;
  client_id: string;
  customer_phone: string;
  direction: 'inbound' | 'outbound';
  status: string;
  message_count: number | null;
  last_message_at: string | null;
  booking_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useSmsConversations(
  clientId: string,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: ['sms-conversations', clientId, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<SmsConversation>> => {
      let query = supabase
        .from('sms_conversations')
        .select('*', { count: 'exact' })
        .eq('client_id', clientId);

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('last_message_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: data || [],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      };
    },
    enabled: !!clientId,
  });
}
