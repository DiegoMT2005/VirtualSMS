import { useQuery } from '@tanstack/react-query'
import { getAnalytics, getAnalyticsByDate } from '@/lib/supabase/helpers'

export function useAnalytics(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics', startDate, endDate],
    queryFn: () => getAnalytics(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })
}

export function useAnalyticsByDate(date: string) {
  return useQuery({
    queryKey: ['analytics', 'date', date],
    queryFn: () => getAnalyticsByDate(date),
    enabled: !!date,
    refetchInterval: 60000, // Refresh every minute
  })
}

export function useTodayAnalytics() {
  const today = new Date().toISOString().split('T')[0]
  return useAnalyticsByDate(today)
}
