import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface DashboardMetrics {
  totalCalls: number;
  activeClients: number;
  successRate: number;
  avgDuration: string;
  callsTrend?: number;
  clientsTrend?: number;
  successRateTrend?: number;
  durationTrend?: number;
}

export interface DashboardSummary {
  recentCalls: any[];
  upcomingBookings: any[];
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async (): Promise<DashboardSummary> => {
      // Get recent calls
      const { data: recentCalls } = await supabase
        .from('call_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get upcoming bookings
      const { data: upcomingBookings } = await supabase
        .from('appointments')
        .select('*')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(10);

      return {
        recentCalls: recentCalls || [],
        upcomingBookings: upcomingBookings || [],
      };
    },
  });
}

export function useDashboardMetrics(clientId: string) {
  return useQuery({
    queryKey: ['dashboard-metrics', clientId],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Get total calls
      const { count: totalCalls } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true });

      // Get completed calls for success rate
      const { count: completedCalls } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get average duration
      const { data: durationData } = await supabase
        .from('call_logs')
        .select('duration_seconds')
        .eq('status', 'completed');

      const avgSeconds = durationData && durationData.length > 0
        ? durationData.reduce((sum, call) => sum + (call.duration_seconds || 0), 0) / durationData.length
        : 0;

      const minutes = Math.floor(avgSeconds / 60);
      const seconds = Math.floor(avgSeconds % 60);
      const avgDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      // Get unique customers
      const { data: customersData } = await supabase
        .from('customers')
        .select('id');

      const successRate = totalCalls && completedCalls
        ? Math.round((completedCalls / totalCalls) * 100)
        : 0;

      return {
        totalCalls: totalCalls || 0,
        activeClients: customersData?.length || 0,
        successRate,
        avgDuration,
        callsTrend: 12,
        clientsTrend: 8,
        successRateTrend: 5,
        durationTrend: -3,
      };
    },
    enabled: !!clientId,
  });
}
