'use client'

import { useSmsMessages } from '@/lib/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  const { data: messages, isLoading } = useSmsMessages(50)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SMS Messages</h1>
        <p className="text-gray-600 mt-1">View SMS conversations and history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-start gap-4 border-b pb-4 last:border-0"
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      message.direction === 'inbound'
                        ? 'bg-purple-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    <MessageSquare
                      className={`h-5 w-5 ${
                        message.direction === 'inbound'
                          ? 'text-purple-600'
                          : 'text-blue-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{message.phone_number}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          message.direction === 'inbound'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {message.direction}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{message.message_body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No messages found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
