import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCustomers, getCustomerById, getCustomerByPhone, createCustomer, updateCustomer, searchCustomers } from '@/lib/supabase/helpers'
import { supabase } from '@/lib/supabase/client'

interface Customer {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  email: string | null;
  total_bookings: number;
  total_calls: number;
  last_contact: string | null;
  notes: string | null;
  tags: string[];
  address?: string | null;
  total_spent?: number;
}

interface CustomerFilters {
  name?: string;
  phone?: string;
  email?: string;
  client_id?: string;
  search?: string;
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

export function useCustomers(
  filters: CustomerFilters = {},
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: ['customers', filters, page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<Customer>> => {
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }
      if (filters.phone) {
        query = query.ilike('phone', `%${filters.phone}%`);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
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
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  })
}

export function useCustomerByPhone(phone: string) {
  return useQuery({
    queryKey: ['customer', 'phone', phone],
    queryFn: () => getCustomerByPhone(phone),
    enabled: !!phone && phone.length > 0,
  })
}

export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: ['customers', 'search', query],
    queryFn: () => searchCustomers(query),
    enabled: query.length > 0,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Customer> }) =>
      updateCustomer(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] })
    },
  })
}
