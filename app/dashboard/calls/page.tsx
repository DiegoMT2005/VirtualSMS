'use client'

import { useState } from 'react'
import { useCalls } from '@/lib/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CallLogsFilters } from '@/components/dashboard/call-logs-filters'
import { formatDateTime, formatDuration, formatPhoneNumber } from '@/lib/utils'
import { Download, PhoneIncoming, PhoneOutgoing, Eye } from 'lucide-react'

interface CallLogFilters {
  phone_number?: string;
  status?: string;
  sentiment?: string;
  call_type?: string;
}

export default function CallsPage() {
  const [filters, setFilters] = useState<CallLogFilters>({})
  const { data: calls, isLoading } = useCalls(50)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100'
      case 'no-answer':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
      case 'busy':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'negative':
        return 'bg-red-100 text-red-800 hover:bg-red-100'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  // Filter calls based on filters
  const filteredCalls = calls?.filter((call) => {
    if (filters.phone_number && !call.phone_number.includes(filters.phone_number)) {
      return false
    }
    if (filters.status && call.status !== filters.status) {
      return false
    }
    if (filters.sentiment && call.sentiment !== filters.sentiment) {
      return false
    }
    if (filters.call_type && call.call_type !== filters.call_type) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call Logs</h1>
          <p className="text-gray-600 mt-1">View and manage all call records</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <CallLogsFilters onFilterChange={setFilters} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Showing {filteredCalls?.length || 0} results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : filteredCalls && filteredCalls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-600">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Contact</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Duration</th>
                    <th className="pb-3 font-medium">Sentiment</th>
                    <th className="pb-3 font-medium">Cost</th>
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalls.map((call) => (
                    <tr key={call.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center">
                          {call.call_type === 'inbound' ? (
                            <div className="flex items-center gap-2">
                              <PhoneIncoming className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">Inbound</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <PhoneOutgoing className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Outbound</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="font-medium">
                            {call.customer_name || formatPhoneNumber(call.phone_number)}
                          </p>
                          {call.customer_name && (
                            <p className="text-xs text-gray-500">
                              {formatPhoneNumber(call.phone_number)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge className={getStatusColor(call.status)} variant="secondary">
                          {call.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        {call.duration ? formatDuration(call.duration) : '-'}
                      </td>
                      <td className="py-4">
                        {call.sentiment ? (
                          <Badge className={getSentimentColor(call.sentiment)} variant="secondary">
                            {call.sentiment}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 text-sm">
                        ${call.cost.toFixed(2)}
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {formatDateTime(call.created_at)}
                      </td>
                      <td className="py-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No calls found matching your filters
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
