import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBookings, getBookingById, createBooking, updateBooking, deleteBooking, searchBookings } from '@/lib/supabase/helpers'

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

export function useBookings(limit = 50) {
  return useQuery({
    queryKey: ['bookings', limit],
    queryFn: () => getBookings(limit),
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBookingById(id),
    enabled: !!id,
  })
}

export function useSearchBookings(query: string) {
  return useQuery({
    queryKey: ['bookings', 'search', query],
    queryFn: () => searchBookings(query),
    enabled: query.length > 0,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export function useUpdateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Booking> }) =>
      updateBooking(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] })
    },
  })
}

export function useDeleteBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}
