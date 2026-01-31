'use client'

import { useEffect } from 'react'
import { useDashboardSummary, useTodayAnalytics, useDashboardMetrics } from '@/lib/hooks'
import { useUserProfile } from '@/lib/hooks/useAuth'
import { MetricCard } from '@/components/dashboard/metric-card'
import { RecentCallsTable } from '@/components/dashboard/recent-calls-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Phone, Calendar, MessageSquare, DollarSign, TrendingUp, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { data: profile, isLoading: profileLoading } = useUserProfile()
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: todayAnalytics, isLoading: analyticsLoading } = useTodayAnalytics()
  const { data: metrics, isLoading: metricsLoading, error } = useDashboardMetrics(profile?.client_id || '')

  const isLoading = profileLoading || summaryLoading || analyticsLoading || metricsLoading

  // Debug logging
  useEffect(() => {
    if (profile) {
      console.log('Profile loaded:', profile)
      console.log('Client ID:', profile.client_id)
    }
    if (error) {
      console.error('Metrics error:', error)
    }
    if (todayAnalytics) {
      console.log('Today Analytics:', todayAnalytics)
    }
    if (metrics) {
      console.log('Dashboard Metrics:', metrics)
    }
  }, [profile, error, todayAnalytics, metrics])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your overview.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Calculate metrics
  const totalCalls = todayAnalytics?.total_calls || 0
  const totalBookings = todayAnalytics?.total_bookings || 0
  const totalSms = todayAnalytics?.total_sms || 0
  const totalCost = todayAnalytics?.total_cost || 0
  const successRate = todayAnalytics?.successful_calls && totalCalls > 0
    ? ((todayAnalytics.successful_calls / totalCalls) * 100).toFixed(1)
    : '0'
  const avgDuration = summary?.recentCalls && summary.recentCalls.length > 0
    ? Math.floor(
        summary.recentCalls.reduce((acc, call) => acc + call.duration, 0) /
          summary.recentCalls.length
      )
    : 0

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your overview.</p>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load metrics: {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Debug Info */}
      {!profile?.client_id && !profileLoading && (
        <Alert>
          <AlertDescription>
            No client ID found. Please ensure your user profile is set up correctly.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Calls Today"
          value={totalCalls}
          icon={Phone}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <MetricCard
          title="Bookings Today"
          value={totalBookings}
          icon={Calendar}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <MetricCard
          title="SMS Messages"
          value={totalSms}
          icon={MessageSquare}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <MetricCard
          title="Total Cost"
          value={`$${totalCost.toFixed(2)}`}
          icon={DollarSign}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <MetricCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
        />
        <MetricCard
          title="Avg Call Duration"
          value={avgDuration > 0 ? `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s` : '0s'}
          icon={Clock}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-100"
        />
      </div>

      {/* Recent Calls Table */}
      <RecentCallsTable />

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {summary?.upcomingBookings && summary.upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {summary.upcomingBookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-sm text-gray-500">{booking.title || 'Appointment'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(booking.scheduled_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming bookings</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
