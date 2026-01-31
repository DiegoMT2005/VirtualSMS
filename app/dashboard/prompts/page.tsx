'use client';

import { useState, useEffect } from 'react';
import { useActivePrompt, useUpdatePrompt } from '@/lib/hooks/usePrompts';
import { useUserProfile } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PromptsPage() {
  const { data: profile } = useUserProfile();
  const { data: voicePrompt } = useActivePrompt(profile?.client_id || '', 'voice');
  const { data: smsPrompt } = useActivePrompt(profile?.client_id || '', 'sms');
  const updatePrompt = useUpdatePrompt();
  const { toast } = useToast();

  const [voicePromptText, setVoicePromptText] = useState('');
  const [smsPromptText, setSmsPromptText] = useState('');

  useEffect(() => {
    if (voicePrompt) {
      setVoicePromptText(voicePrompt.system_prompt || '');
    }
  }, [voicePrompt]);

  useEffect(() => {
    if (smsPrompt) {
      setSmsPromptText(smsPrompt.system_prompt || '');
    }
  }, [smsPrompt]);

  const handleSaveVoice = async () => {
    if (!voicePrompt) return;

    try {
      await updatePrompt.mutateAsync({
        id: voicePrompt.id,
        updates: { system_prompt: voicePromptText },
      });

      toast({
        title: 'Success',
        description: 'Voice prompt updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveSms = async () => {
    if (!smsPrompt) return;

    try {
      await updatePrompt.mutateAsync({
        id: smsPrompt.id,
        updates: { system_prompt: smsPromptText },
      });

      toast({
        title: 'Success',
        description: 'SMS prompt updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Prompts</h1>
        <p className="text-gray-600 mt-1">Manage AI agent system prompts</p>
      </div>

      {/* Warning */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Changes to system prompts will affect how your AI agents respond.
          Test thoroughly before deploying to production.
        </AlertDescription>
      </Alert>

      {/* Prompts Editor */}
      <Tabs defaultValue="voice" className="space-y-4">
        <TabsList>
          <TabsTrigger value="voice">Voice Agent Prompt</TabsTrigger>
          <TabsTrigger value="sms">SMS Agent Prompt</TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Voice Agent System Prompt</CardTitle>
                  <CardDescription>
                    Define how your voice agent behaves and responds
                  </CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800" variant="secondary">
                  {voicePrompt?.prompt_version || 'v1.0.0'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voice-prompt">System Prompt</Label>
                <Textarea
                  id="voice-prompt"
                  value={voicePromptText}
                  onChange={(e) => setVoicePromptText(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Enter your voice agent system prompt here..."
                />
                <p className="text-xs text-gray-500">
                  {voicePromptText.length} characters • Use clear instructions for best results
                </p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveVoice} disabled={!voicePrompt}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline">Test Prompt</Button>
                <Button variant="outline">View History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SMS Agent System Prompt</CardTitle>
                  <CardDescription>
                    Define how your SMS agent behaves and responds
                  </CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800" variant="secondary">
                  {smsPrompt?.prompt_version || 'v1.0.0'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sms-prompt">System Prompt</Label>
                <Textarea
                  id="sms-prompt"
                  value={smsPromptText}
                  onChange={(e) => setSmsPromptText(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Enter your SMS agent system prompt here..."
                />
                <p className="text-xs text-gray-500">
                  {smsPromptText.length} characters • Keep responses concise for SMS
                </p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveSms} disabled={!smsPrompt}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline">Test Prompt</Button>
                <Button variant="outline">View History</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt Engineering Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Be Specific and Clear</p>
                <p className="text-gray-600">Provide explicit instructions on how to handle different scenarios</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Define Personality</p>
                <p className="text-gray-600">Describe the tone, style, and manner of communication</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Include Edge Cases</p>
                <p className="text-gray-600">Specify how to handle errors, confusion, or unexpected inputs</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Test Thoroughly</p>
                <p className="text-gray-600">Always test changes with various scenarios before deploying</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
