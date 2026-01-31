import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

interface Booking {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show' | 'scheduled';
  source: 'voice' | 'sms' | 'manual';
  notes: string | null;
  reminder_sent: boolean;
  confirmation_sent: boolean;
  title?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  pickup_address?: string;
  payment_amount?: number;
  payment_currency?: string;
  payment_status?: 'pending' | 'paid' | 'failed';
  number_of_loads?: number;
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

export function useAppointments(
  filters: any,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: ['appointments', filters, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Booking>> => {
      let query = supabase
        .from('appointments')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.customer_name) {
        query = query.ilike('customer_name', `%${filters.customer_name}%`);
      }
      if (filters.customer_phone) {
        query = query.ilike('customer_phone', `%${filters.customer_phone}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.date_from) {
        query = query.gte('scheduled_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('scheduled_at', filters.date_to);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('scheduled_at', { ascending: false })
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
  });
}
