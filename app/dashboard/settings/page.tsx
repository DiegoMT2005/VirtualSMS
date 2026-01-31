'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Calendar, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

export default function SettingsPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  const handleConnectGoogleCalendar = async () => {
    setIsConnecting(true)
    
    try {
      // TODO: Implement OAuth flow
      // For now, show instructions
      toast({
        title: 'Google Calendar Integration',
        description: 'This feature requires OAuth setup. See implementation guide below.',
      })
      
      // Simulate connection (remove this in production)
      setTimeout(() => {
        setIsConnected(true)
        setIsConnecting(false)
        toast({
          title: 'Connected!',
          description: 'Google Calendar has been connected successfully.',
        })
      }, 1500)
    } catch (error) {
      setIsConnecting(false)
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect Google Calendar. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    toast({
      title: 'Disconnected',
      description: 'Google Calendar has been disconnected.',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and integrations</p>
      </div>

      {/* Google Calendar Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Google Calendar Integration</CardTitle>
                <CardDescription>Sync appointments with Google Calendar</CardDescription>
              </div>
            </div>
            {isConnected ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Connect your Google Calendar to automatically sync appointments and receive notifications.
          </p>
          
          {!isConnected ? (
            <Button 
              onClick={handleConnectGoogleCalendar} 
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Your appointments will automatically sync to Google Calendar
                </p>
              </div>
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          )}

          {/* Implementation Guide */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Implementation Guide</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>To enable Google Calendar integration:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Create a project in Google Cloud Console</li>
                <li>Enable Google Calendar API</li>
                <li>Create OAuth 2.0 credentials</li>
                <li>Add authorized redirect URIs</li>
                <li>Install required packages: <code className="bg-blue-100 px-1 rounded">npm install @react-oauth/google</code></li>
              </ol>
              <a 
                href="https://developers.google.com/calendar/api/quickstart/js" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mt-2"
              >
                View Google Calendar API Documentation
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Additional settings coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
