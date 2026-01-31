'use client';

import { useCalls } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatDuration } from '@/lib/utils';
import { PhoneIncoming, PhoneOutgoing } from 'lucide-react';

export function RecentCallsTable() {
  const { data: calls, isLoading } = useCalls(5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'no-answer':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Calls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-600">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {calls?.map((call) => (
                <tr key={call.id} className="border-b last:border-0">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                        {call.call_type === 'inbound' ? (
                          <PhoneIncoming className="h-4 w-4 text-gray-600" />
                        ) : (
                          <PhoneOutgoing className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{call.customer_name || call.phone_number || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{call.phone_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    {call.duration ? formatDuration(call.duration) : '-'}
                  </td>
                  <td className="py-4">
                    <Badge className={getStatusColor(call.status)} variant="secondary">
                      {call.status}
                    </Badge>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {formatRelativeTime(call.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
