'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Key, Webhook, Copy, Eye, EyeOff, Trash2, CheckCircle, Loader2, MessageSquare, Send } from 'lucide-react';
import { useLLMSettings, useUpdateLLMSettings } from '@/lib/hooks/useLLMSettings';

export default function ApiSettingsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  
  const clientId = process.env.NEXT_PUBLIC_DEFAULT_CLIENT_ID || '';
  const { data: llmSettings, isLoading: llmLoading } = useLLMSettings(clientId);
  const updateLLM = useUpdateLLMSettings();
  
  // API Keys state
  const [vapiKey, setVapiKey] = useState('');
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioToken, setTwilioToken] = useState('');
  const [twilioPhone, setTwilioPhone] = useState('');

  // LLM Integration state
  const [selectedLLM, setSelectedLLM] = useState<'openai' | 'claude' | 'gemini'>('openai');
  const [llmKeys, setLlmKeys] = useState({
    openai: '',
    claude: '',
    gemini: '',
  });

  // Test connection state
  const [showTestChat, setShowTestChat] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // Load LLM settings from database
  useEffect(() => {
    if (llmSettings) {
      setSelectedLLM(llmSettings.llm_provider || 'openai');
      if (llmSettings.llm_api_key) {
        setLlmKeys({
          ...llmKeys,
          [llmSettings.llm_provider]: llmSettings.llm_api_key,
        });
      }
    }
  }, [llmSettings]);

  const handleSaveLLM = async () => {
    if (!llmKeys[selectedLLM]) {
      toast({
        title: 'Error',
        description: 'Please enter an API key',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateLLM.mutateAsync({
        clientId,
        provider: selectedLLM,
        apiKey: llmKeys[selectedLLM],
      });

      toast({
        title: 'Success',
        description: `${selectedLLM.toUpperCase()} API key saved successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save LLM settings',
        variant: 'destructive',
      });
    }
  };

  const handleTestConnection = async () => {
    if (!testMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a test message',
        variant: 'destructive',
      });
      return;
    }

    if (!llmKeys[selectedLLM]) {
      toast({
        title: 'Error',
        description: 'Please enter an API key first',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    setTestResponse('');

    try {
      const response = await fetch('/api/test-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedLLM,
          apiKey: llmKeys[selectedLLM],
          message: testMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to test connection');
      }

      setTestResponse(data.response);
      toast({
        title: 'Success',
        description: `${selectedLLM.toUpperCase()} connection working!`,
      });
    } catch (error: any) {
      setTestResponse(`Error: ${error.message}`);
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Mock data - replace with actual API calls
  const apiKeys = [
    {
      id: '1',
      key_name: 'Production API',
      api_key: 'sk_live_••••••••••••f456',
      key_type: 'live',
      last_used_at: '2024-03-15 14:32',
      total_requests: 1250,
      is_active: true,
    },
    {
      id: '2',
      key_name: 'Development API',
      api_key: 'sk_test_••••••••••••1654',
      key_type: 'test',
      last_used_at: '2024-03-14 10:15',
      total_requests: 547,
      is_active: true,
    },
  ];

  const [webhookConfig, setWebhookConfig] = useState({
    webhook_url: 'https://your-server.com/webhook',
    events: {
      call_started: true,
      call_completed: true,
      call_failed: true,
      transcription_ready: true,
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
  };

  const handleSaveWebhook = () => {
    toast({
      title: 'Success',
      description: 'Webhook configuration saved',
    });
  };

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'connected') {
      toast({
        title: 'Connected!',
        description: 'Google Calendar has been connected successfully.',
      });
    } else if (error) {
      const errorMessages: Record<string, string> = {
        not_configured: 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.',
        no_code: 'Authorization code not received from Google.',
        oauth_failed: 'Failed to connect Google Calendar. Please try again.',
        table_missing: 'Database table "user_integrations" does not exist. Please run the SQL migration.',
        access_denied: 'You denied access to Google Calendar.',
      };
      
      toast({
        title: 'Connection Failed',
        description: errorMessages[error] || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">API Settings</h1>
        <p className="text-gray-600 mt-1">Manage API keys and webhook configuration</p>
      </div>

      {/* LLM Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>LLM Integration</CardTitle>
              <CardDescription>Choose your AI provider for SMS conversations</CardDescription>
            </div>
            <Badge 
              variant={llmKeys[selectedLLM] ? 'default' : 'secondary'} 
              className={llmKeys[selectedLLM] ? 'bg-green-100 text-green-800' : ''}
            >
              {llmKeys[selectedLLM] ? `${selectedLLM.toUpperCase()} Connected` : 'Not Connected'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* LLM Provider Selection */}
          <div className="space-y-3">
            <Label>Select AI Provider</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* OpenAI */}
              <div
                onClick={() => setSelectedLLM('openai')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedLLM === 'openai'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">OpenAI</h4>
                  {selectedLLM === 'openai' && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600">GPT-4, GPT-3.5 Turbo</p>
                {llmKeys.openai && (
                  <Badge className="mt-2 bg-green-100 text-green-800" variant="secondary">
                    Configured
                  </Badge>
                )}
              </div>

              {/* Claude */}
              <div
                onClick={() => setSelectedLLM('claude')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedLLM === 'claude'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Claude</h4>
                  {selectedLLM === 'claude' && (
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600">Claude 3 Opus, Sonnet</p>
                {llmKeys.claude && (
                  <Badge className="mt-2 bg-green-100 text-green-800" variant="secondary">
                    Configured
                  </Badge>
                )}
              </div>

              {/* Gemini */}
              <div
                onClick={() => setSelectedLLM('gemini')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedLLM === 'gemini'
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Google Gemini</h4>
                  {selectedLLM === 'gemini' && (
                    <CheckCircle className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600">Gemini Pro, Ultra</p>
                {llmKeys.gemini && (
                  <Badge className="mt-2 bg-green-100 text-green-800" variant="secondary">
                    Configured
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* API Key Input for Selected Provider */}
          <div className="space-y-2">
            <Label>
              {selectedLLM === 'openai' && 'OpenAI API Key'}
              {selectedLLM === 'claude' && 'Anthropic API Key'}
              {selectedLLM === 'gemini' && 'Google AI API Key'}
            </Label>
            <div className="flex space-x-2">
              <Input
                type={showKeys[selectedLLM] ? 'text' : 'password'}
                value={llmKeys[selectedLLM]}
                onChange={(e) =>
                  setLlmKeys({ ...llmKeys, [selectedLLM]: e.target.value })
                }
                placeholder={
                  selectedLLM === 'openai'
                    ? 'sk-...'
                    : selectedLLM === 'claude'
                    ? 'sk-ant-...'
                    : 'AIza...'
                }
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setShowKeys({ ...showKeys, [selectedLLM]: !showKeys[selectedLLM] })
                }
              >
                {showKeys[selectedLLM] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (llmKeys[selectedLLM]) {
                    navigator.clipboard.writeText(llmKeys[selectedLLM]);
                    toast({ title: 'Copied', description: 'API key copied to clipboard' });
                  }
                }}
                disabled={!llmKeys[selectedLLM]}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              {selectedLLM === 'openai' && 'Get your API key from platform.openai.com'}
              {selectedLLM === 'claude' && 'Get your API key from console.anthropic.com'}
              {selectedLLM === 'gemini' && 'Get your API key from makersuite.google.com'}
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertDescription>
              <strong>Active Provider:</strong> {selectedLLM.toUpperCase()}
              {llmKeys[selectedLLM] ? (
                <span className="text-green-600"> • Configured ✓</span>
              ) : (
                <span className="text-amber-600"> • Not configured</span>
              )}
              <br />
              <span className="text-xs text-gray-600">
                This AI provider will be used for SMS conversation responses.
              </span>
            </AlertDescription>
          </Alert>

          {/* Test Connection */}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowTestChat(!showTestChat)}
              disabled={!llmKeys[selectedLLM]}
              className="w-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {showTestChat ? 'Hide Test Chat' : 'Test Connection'}
            </Button>

            {showTestChat && (
              <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                <h4 className="font-semibold text-sm">Test {selectedLLM.toUpperCase()} Connection</h4>
                
                <div className="space-y-2">
                  <Label>Your Message</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Type a test message..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isTesting) {
                          handleTestConnection();
                        }
                      }}
                    />
                    <Button
                      onClick={handleTestConnection}
                      disabled={isTesting || !testMessage.trim()}
                      size="icon"
                    >
                      {isTesting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {testResponse && (
                  <div className="space-y-2">
                    <Label>AI Response</Label>
                    <div className="p-3 bg-white border rounded-lg text-sm">
                      {testResponse}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handleSaveLLM}
            disabled={updateLLM.isPending}
          >
            {updateLLM.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              `Save ${selectedLLM.toUpperCase()} Configuration`
            )}
          </Button>
        </CardContent>
      </Card>

      {/* VAPI Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>VAPI Integration</CardTitle>
              <CardDescription>Configure your VAPI API connection</CardDescription>
            </div>
            <Badge variant={vapiKey ? 'default' : 'secondary'} className={vapiKey ? 'bg-green-100 text-green-800' : ''}>
              {vapiKey ? 'Connected' : 'Not Connected'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>VAPI API Key</Label>
            <div className="flex space-x-2">
              <Input
                type={showKeys.vapi ? 'text' : 'password'}
                value={vapiKey}
                onChange={(e) => setVapiKey(e.target.value)}
                placeholder="Enter your VAPI API key"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowKeys({ ...showKeys, vapi: !showKeys.vapi })}
              >
                {showKeys.vapi ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  if (vapiKey) {
                    navigator.clipboard.writeText(vapiKey);
                    toast({ title: 'Copied', description: 'VAPI key copied to clipboard' });
                  }
                }}
                disabled={!vapiKey}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={() => {
              if (vapiKey) {
                toast({ title: 'Success', description: 'VAPI key saved successfully' });
              } else {
                toast({ title: 'Error', description: 'Please enter a VAPI key', variant: 'destructive' });
              }
            }}
          >
            Update VAPI Key
          </Button>
        </CardContent>
      </Card>

      {/* Twilio Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Twilio Integration</CardTitle>
              <CardDescription>Configure Twilio for SMS functionality</CardDescription>
            </div>
            <Badge variant={twilioSid && twilioToken ? 'default' : 'secondary'} className={twilioSid && twilioToken ? 'bg-green-100 text-green-800' : ''}>
              {twilioSid && twilioToken ? 'Connected' : 'Not Connected'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Account SID</Label>
            <div className="flex space-x-2">
              <Input
                type={showKeys.twilio_sid ? 'text' : 'password'}
                value={twilioSid}
                onChange={(e) => setTwilioSid(e.target.value)}
                placeholder="Enter your Twilio Account SID"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowKeys({ ...showKeys, twilio_sid: !showKeys.twilio_sid })}
              >
                {showKeys.twilio_sid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Auth Token</Label>
            <div className="flex space-x-2">
              <Input
                type={showKeys.twilio_token ? 'text' : 'password'}
                value={twilioToken}
                onChange={(e) => setTwilioToken(e.target.value)}
                placeholder="Enter your Twilio Auth Token"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowKeys({ ...showKeys, twilio_token: !showKeys.twilio_token })}
              >
                {showKeys.twilio_token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input 
              value={twilioPhone}
              onChange={(e) => setTwilioPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <Button
            onClick={() => {
              if (twilioSid && twilioToken) {
                toast({ title: 'Success', description: 'Twilio configuration saved successfully' });
              } else {
                toast({ title: 'Error', description: 'Please enter Account SID and Auth Token', variant: 'destructive' });
              }
            }}
          >
            Update Twilio Configuration
          </Button>
        </CardContent>
      </Card>

      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys and webhooks</CardDescription>
            </div>
            <Button>
              <Key className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Key className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{key.key_name}</h4>
                      <Badge variant="outline" className="capitalize">
                        {key.key_type}
                      </Badge>
                      {key.is_active && (
                        <Badge className="bg-green-100 text-green-800" variant="secondary">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 font-mono">{key.api_key}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last used: {key.last_used_at} • {key.total_requests.toLocaleString()} requests
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(key.api_key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    {showKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Webhook className="h-5 w-5 text-blue-600" />
            <CardTitle>Webhook Configuration</CardTitle>
          </div>
          <CardDescription>Configure webhook endpoints and events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input
              value={webhookConfig.webhook_url}
              onChange={(e) =>
                setWebhookConfig({ ...webhookConfig, webhook_url: e.target.value })
              }
              placeholder="https://your-server.com/webhook"
            />
          </div>

          <div className="space-y-4">
            <Label>Events to Subscribe</Label>
            <div className="space-y-3">
              {Object.entries(webhookConfig.events).map(([event, enabled]) => (
                <div key={event} className="flex items-center space-x-2">
                  <Checkbox
                    id={event}
                    checked={enabled}
                    onCheckedChange={(checked) =>
                      setWebhookConfig({
                        ...webhookConfig,
                        events: { ...webhookConfig.events, [event]: checked as boolean },
                      })
                    }
                  />
                  <label
                    htmlFor={event}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                  >
                    {event.replace(/_/g, ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSaveWebhook}>Save Webhook Settings</Button>
        </CardContent>
      </Card>

      {/* Google Calendar Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Calendar Integration</CardTitle>
              <CardDescription>Sync appointments with Google Calendar</CardDescription>
            </div>
            <Badge variant="outline">Not Connected</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Connect your Google Calendar to automatically sync appointments and receive notifications.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => {
                // Trigger OAuth flow
                window.location.href = '/api/auth/google/authorize';
              }}
            >
              Connect Google Calendar
            </Button>
            
            <p className="text-xs text-gray-500">
              You'll be redirected to Google to authorize calendar access
            </p>
          </div>
          
          {/* Admin Setup Notice */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-2">⚙️ Admin Setup Required</h4>
            <div className="text-sm text-amber-800 space-y-2">
              <p>If the button doesn't work, your administrator needs to:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Add Google OAuth credentials to <code className="bg-amber-100 px-1 rounded text-xs">.env.local</code></li>
                <li>Create the OAuth callback route at <code className="bg-amber-100 px-1 rounded text-xs">/api/auth/google/</code></li>
              </ol>
              <p className="mt-2">
                <strong>📖 Setup guide:</strong> <code className="bg-amber-100 px-1 rounded text-xs">GOOGLE_CALENDAR_INTEGRATION.md</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
