import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface CallLog {
  id: string;
  client_id: string;
  voice_agent_id: string | null;
  call_sid: string | null;
  direction: 'inbound' | 'outbound';
  from_number: string | null;
  to_number: string | null;
  phone_number: string | null;
  status: string;
  duration_seconds: number | null;
  started_at: string | null;
  ended_at: string | null;
  transcript: string | null;
  summary: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  recording_url: string | null;
  cost_amount: number | null;
  booking_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallLogFilters {
  client_id?: string;
  phone_number?: string;
  status?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  direction?: 'inbound' | 'outbound';
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

export function useCallLogs(
  filters: CallLogFilters,
  page: number = 1,
  pageSize: number = 10
) {
  return useQuery({
    queryKey: ['call-logs', filters, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<CallLog>> => {
      let query = supabase
        .from('call_logs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }
      if (filters.phone_number) {
        query = query.or(`phone_number.ilike.%${filters.phone_number}%,from_number.ilike.%${filters.phone_number}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.sentiment) {
        query = query.eq('sentiment', filters.sentiment);
      }
      if (filters.direction) {
        query = query.eq('direction', filters.direction);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
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
    enabled: !!filters.client_id,
  });
}

export function useRecentCalls(clientId: string, limit: number = 5) {
  return useQuery({
    queryKey: ['recent-calls', clientId, limit],
    queryFn: async (): Promise<CallLog[]> => {
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });
}
