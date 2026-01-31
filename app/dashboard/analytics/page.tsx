'use client'

import { useTodayAnalytics } from '@/lib/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useTodayAnalytics()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const metrics = [
    {
      name: 'Total Calls',
      value: analytics?.total_calls || 0,
      change: '+12%',
      trend: 'up',
    },
    {
      name: 'Successful Calls',
      value: analytics?.successful_calls || 0,
      change: '+8%',
      trend: 'up',
    },
    {
      name: 'Failed Calls',
      value: analytics?.failed_calls || 0,
      change: '-5%',
      trend: 'down',
    },
    {
      name: 'Conversion Rate',
      value: `${((analytics?.conversion_rate || 0) * 100).toFixed(1)}%`,
      change: '+3%',
      trend: 'up',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track performance and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.name}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center mt-1">
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span
                  className={`text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {metric.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from yesterday</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Bookings</span>
              <span className="font-semibold">{analytics?.total_bookings || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total SMS</span>
              <span className="font-semibold">{analytics?.total_sms || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Cost</span>
              <span className="font-semibold">
                ${(analytics?.total_cost || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
