'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface CallLogFilters {
  phone_number?: string;
  status?: string;
  sentiment?: string;
  call_type?: string;
}

interface CallLogsFiltersProps {
  onFilterChange: (filters: CallLogFilters) => void;
}

export function CallLogsFilters({ onFilterChange }: CallLogsFiltersProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [sentiment, setSentiment] = useState<string>('all');

  const handleApply = () => {
    const filters: CallLogFilters = {};
    if (search) filters.phone_number = search;
    if (status !== 'all') filters.status = status as any;
    if (sentiment !== 'all') filters.sentiment = sentiment as any;
    onFilterChange(filters);
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-2 block">Search by phone</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="w-[180px]">
        <label className="text-sm font-medium mb-2 block">Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="no-answer">No Answer</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[180px]">
        <label className="text-sm font-medium mb-2 block">Sentiment</label>
        <Select value={sentiment} onValueChange={setSentiment}>
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

      <Button onClick={handleApply}>
        <Filter className="h-4 w-4 mr-2" />
        Apply Filters
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          setSearch('');
          setStatus('all');
          setSentiment('all');
          onFilterChange({});
        }}
      >
        Clear
      </Button>
    </div>
  );
}
