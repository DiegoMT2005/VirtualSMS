'use client';

import { useState } from 'react';
import { useSmsConversations } from '@/lib/hooks/useSmsConversations';
import { useUserProfile } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatRelativeTime } from '@/lib/utils';
import { MessageSquare, Search, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SmsMessage {
  id: string;
  conversation_id: string;
  message_sid: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  body: string;
  media_urls: string[] | null;
  status: string;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
}

// Hook to fetch messages for a conversation
function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: ['conversationMessages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as SmsMessage[];
    },
    enabled: !!conversationId,
  });
}

export default function SmsPage() {
  const { data: profile } = useUserProfile();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const { data, isLoading } = useSmsConversations(profile?.client_id || '', page, 20);
  const { data: messages, isLoading: messagesLoading } = useConversationMessages(selectedConversationId || '');

  const selectedConversation = (data?.data || []).find(c => c.id === selectedConversationId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'abandoned':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConversations = (data?.data || []).filter((convo) =>
    convo.customer_phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">SMS Conversations</h1>
        <p className="text-gray-600 mt-1">View and manage SMS conversations</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? 'Loading...' : `${data?.pagination.total || 0} Total Conversations`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((convo) => (
                  <div
                    key={convo.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold">{convo.customer_phone}</p>
                          <Badge className={getStatusColor(convo.status)} variant="secondary">
                            {convo.status}
                          </Badge>
                          {convo.booking_status && convo.booking_status !== 'not_applicable' && (
                            <Badge variant="outline" className="capitalize">
                              {convo.booking_status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {convo.message_count || 0} messages
                          {convo.last_message_at && ` • ${formatRelativeTime(convo.last_message_at)}`}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedConversationId(convo.id)}>
                      View Messages
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No conversations found</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
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
          )}
        </CardContent>
      </Card>

      {/* Messages Dialog */}
      <Dialog open={!!selectedConversationId} onOpenChange={(open) => !open && setSelectedConversationId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span>Conversation with {selectedConversation?.customer_phone}</span>
                  {selectedConversation && (
                    <Badge className={getStatusColor(selectedConversation.status)} variant="secondary">
                      {selectedConversation.status}
                    </Badge>
                  )}
                </div>
                {selectedConversation && (
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    {selectedConversation.message_count || 0} messages
                  </p>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {messagesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.direction === 'outbound'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start justify-between space-x-2 mb-1">
                      <span className={`text-xs font-medium ${
                        message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {message.direction === 'outbound' ? 'You' : selectedConversation?.customer_phone}
                      </span>
                      <span className={`text-xs ${
                        message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatRelativeTime(message.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
                    
                    {message.media_urls && message.media_urls.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.media_urls.map((url: string, idx: number) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center space-x-2 text-xs ${
                              message.direction === 'outbound' ? 'text-blue-100' : 'text-blue-600'
                            } hover:underline`}
                          >
                            <ImageIcon className="h-4 w-4" />
                            <span>View attachment {idx + 1}</span>
                          </a>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          message.direction === 'outbound'
                            ? 'border-blue-200 text-blue-100'
                            : 'border-gray-300 text-gray-600'
                        }`}
                      >
                        {message.status}
                      </Badge>
                      
                      {message.error_message && (
                        <span className="text-xs text-red-300">
                          Error: {message.error_message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No messages found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
