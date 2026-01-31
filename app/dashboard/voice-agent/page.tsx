'use client';

import { useState, useEffect } from 'react';
import { useVoiceAgents, useUpdateVoiceAgent, useCreateVoiceAgent } from '@/lib/hooks/useAgents';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Mic, Loader2 } from 'lucide-react';

export default function VoiceAgentPage() {
  const { user } = useAuth();
  const clientId = process.env.NEXT_PUBLIC_DEFAULT_CLIENT_ID || '';
  const { data: agents, isLoading } = useVoiceAgents(clientId);
  const updateAgent = useUpdateVoiceAgent();
  const createAgent = useCreateVoiceAgent();
  const { toast } = useToast();

  const agent = agents?.[0]; // For now, use first agent

  const [formData, setFormData] = useState({
    voice_type: 'female' as 'female' | 'male' | 'neutral',
    language: 'en-US',
    speech_speed: 1.0,
    pitch: 1.0,
    greeting_message: 'Hello! How can I help you today?',
    max_call_duration_minutes: 30,
    silence_timeout_seconds: 5,
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        voice_type: agent.voice_type,
        language: agent.language,
        speech_speed: agent.speech_speed,
        pitch: agent.pitch,
        greeting_message: agent.greeting_message,
        max_call_duration_minutes: agent.max_call_duration_minutes,
        silence_timeout_seconds: agent.silence_timeout_seconds,
      });
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (agent) {
        // Update existing agent
        await updateAgent.mutateAsync({
          id: agent.id,
          updates: formData,
        });
      } else {
        // Create new agent
        await createAgent.mutateAsync({
          client_id: clientId,
          ...formData,
        });
      }

      toast({
        title: 'Success',
        description: 'Voice agent settings saved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Voice Agent Settings</h1>
        <p className="text-gray-600 mt-1">Configure your AI voice agent</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" key={agent?.id || 'new'}>
        {/* Voice Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Mic className="h-5 w-5 text-blue-600" />
              <CardTitle>Voice Configuration</CardTitle>
            </div>
            <CardDescription>Configure the AI agent voice settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Voice Type */}
              <div className="space-y-2">
                <Label htmlFor="voice_type">Voice Type</Label>
                <select
                  id="voice_type"
                  value={formData.voice_type}
                  onChange={(e) =>
                    setFormData({ ...formData, voice_type: e.target.value as any })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                </select>
              </div>
            </div>

            {/* Speech Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Speech Speed: {formData.speech_speed.toFixed(1)}x</Label>
                <Input
                  type="number"
                  value={formData.speech_speed}
                  onChange={(e) =>
                    setFormData({ ...formData, speech_speed: parseFloat(e.target.value) || 1.0 })
                  }
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-20"
                />
              </div>
              <Slider
                value={[formData.speech_speed]}
                onValueChange={([value]) =>
                  setFormData({ ...formData, speech_speed: value })
                }
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Adjust how fast the AI speaks (0.5x - 2.0x)
              </p>
            </div>

            {/* Pitch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pitch: {formData.pitch.toFixed(1)}</Label>
                <Input
                  type="number"
                  value={formData.pitch}
                  onChange={(e) =>
                    setFormData({ ...formData, pitch: parseFloat(e.target.value) || 1.0 })
                  }
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-20"
                />
              </div>
              <Slider
                value={[formData.pitch]}
                onValueChange={([value]) =>
                  setFormData({ ...formData, pitch: value })
                }
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Adjust the voice pitch (0.5 - 2.0)
              </p>
            </div>

            {/* Greeting Message */}
            <div className="space-y-2">
              <Label htmlFor="greeting_message">Greeting Message</Label>
              <Textarea
                id="greeting_message"
                value={formData.greeting_message}
                onChange={(e) =>
                  setFormData({ ...formData, greeting_message: e.target.value })
                }
                placeholder="Enter the greeting message..."
                rows={3}
              />
              <p className="text-xs text-gray-500">
                The message the AI will say when answering calls
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Call Settings</CardTitle>
            <CardDescription>Configure call behavior and timeouts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Max Call Duration */}
              <div className="space-y-2">
                <Label htmlFor="max_call_duration_minutes">
                  Max Call Duration (minutes)
                </Label>
                <Input
                  id="max_call_duration_minutes"
                  type="number"
                  value={formData.max_call_duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_call_duration_minutes: parseInt(e.target.value),
                    })
                  }
                  min={1}
                  max={120}
                />
              </div>

              {/* Silence Timeout */}
              <div className="space-y-2">
                <Label htmlFor="silence_timeout_seconds">
                  Silence Timeout (seconds)
                </Label>
                <Input
                  id="silence_timeout_seconds"
                  type="number"
                  value={formData.silence_timeout_seconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      silence_timeout_seconds: parseInt(e.target.value),
                    })
                  }
                  min={1}
                  max={30}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={updateAgent.isPending || createAgent.isPending}
          >
            {(updateAgent.isPending || createAgent.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
