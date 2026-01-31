'use client';

import { useState } from 'react';
import { useCallLogs, type CallLogFilters } from '@/lib/hooks/useCallLogs';
import { useUserProfile } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateTime, formatPhoneNumber } from '@/lib/utils';
import { Download, ChevronLeft, ChevronRight, Phone, PhoneIncoming, PhoneOutgoing, Search, Filter } from 'lucide-react';

export default function CallLogsPage() {
  const { data: profile } = useUserProfile();
  const [page, setPage] = useState(1);
  const [searchPhone, setSearchPhone] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  
  // Build filters object
  const filters: CallLogFilters = {
    client_id: profile?.client_id || undefined,
  };
  
  if (searchPhone) filters.phone_number = searchPhone;
  if (statusFilter !== 'all') filters.status = statusFilter;
  if (sentimentFilter !== 'all') filters.sentiment = sentimentFilter as any;
 
  const { data, isLoading, error } = useCallLogs(filters, page, 10);
 
  const handleApplyFilters = () => {
    setPage(1); // Reset to first page when applying filters
  };
 
  const handleClearFilters = () => {
    setSearchPhone('');
    setStatusFilter('all');
    setSentimentFilter('all');
    setPage(1);
  };

  const handleExport = () => {
    if (!data?.data || data.data.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare CSV data
    const headers = ['Date', 'Direction', 'Phone Number', 'Status', 'Duration', 'Sentiment', 'Transcript'];
    const rows = data.data.map(call => [
      new Date(call.created_at).toLocaleString(),
      call.direction,
      call.from_number || call.phone_number || 'Unknown',
      call.status,
      formatDuration(call.duration_seconds),
      call.sentiment || 'N/A',
      call.transcript?.replace(/"/g, '""') || 'No transcript'
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `call-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
 
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
 
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      missed: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
 
  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return 'bg-gray-100 text-gray-800';
    const colors: Record<string, string> = {
      positive: 'bg-green-100 text-green-800',
      negative: 'bg-red-100 text-red-800',
      neutral: 'bg-gray-100 text-gray-800',
    };
    return colors[sentiment] || 'bg-gray-100 text-gray-800';
  };
 
  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Call Logs</h1>
          <p className="text-gray-600 mt-1">View and manage all call records</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">Error loading call logs: {error.message}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
 
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call Logs</h1>
          <p className="text-gray-600 mt-1">View and manage all call records</p>
        </div>
        <Button onClick={handleExport} disabled={!data?.data || data.data.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Search by phone</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search phone number..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-[180px]">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-[180px]">
              <label className="text-sm font-medium mb-2 block">Sentiment</label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiment</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleApplyFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info - Remove this in production */}
      {profile && (
        <Card className="bg-blue-50">
          <CardContent className="py-4">
            <p className="text-sm text-blue-900">
              <strong>Debug:</strong> Client ID: {profile.client_id} | 
              Total Results: {data?.pagination.total || 0} | 
              Current Page: {page}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Showing {data?.pagination.total || 0} results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-600">
                      <th className="pb-3 font-medium">Direction</th>
                      <th className="pb-3 font-medium">Client</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Duration</th>
                      <th className="pb-3 font-medium">Sentiment</th>
                      <th className="pb-3 font-medium">Timestamp</th>
                      <th className="pb-3 font-medium">Transcript Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((call) => (
                      <tr key={call.id} className="border-b hover:bg-gray-50 cursor-pointer">
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            {call.direction === 'inbound' ? (
                              <PhoneIncoming className="h-4 w-4 text-blue-600" />
                            ) : (
                              <PhoneOutgoing className="h-4 w-4 text-green-600" />
                            )}
                            <Badge variant="outline" className="capitalize">
                              {call.direction}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-4">
                          <div>
                            <p className="font-medium">
                              {call.from_number ? formatPhoneNumber(call.from_number) : 'Unknown'}
                            </p>
                            {call.phone_number && (
                              <p className="text-xs text-gray-500">
                                {call.phone_number}
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
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>
                              {formatDuration(call.duration_seconds)}
                            </span>
                          </div>
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
                          {formatDateTime(call.created_at)}
                        </td>
                        <td className="py-4 text-sm text-gray-600 max-w-xs truncate">
                          {call.transcript?.substring(0, 100) || 'No transcript available'}
                          {call.transcript && call.transcript.length > 100 && '...'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Page {data.pagination.page} of {data.pagination.totalPages} 
                  ({data.pagination.total} total records)
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= data.pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Phone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No call logs found</p>
              <p className="text-sm mt-2">
                {searchPhone || statusFilter !== 'all' || sentimentFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Call logs will appear here once calls are made'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
