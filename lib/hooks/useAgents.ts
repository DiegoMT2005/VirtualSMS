import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface VoiceAgent {
  id: string;
  client_id: string;
  voice_type: 'female' | 'male' | 'neutral';
  language: string;
  speech_speed: number;
  pitch: number;
  greeting_message: string;
  max_call_duration_minutes: number;
  silence_timeout_seconds: number;
  created_at: string;
  updated_at: string;
}

export function useVoiceAgents(clientId: string) {
  return useQuery({
    queryKey: ['voice-agents', clientId],
    queryFn: async (): Promise<VoiceAgent[]> => {
      const { data, error } = await supabase
        .from('voice_agents')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId,
  });
}

export function useUpdateVoiceAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<VoiceAgent>;
    }) => {
      const { data, error } = await supabase
        .from('voice_agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-agents'] });
    },
  });
}

export function useCreateVoiceAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agent: Omit<VoiceAgent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('voice_agents')
        .insert(agent)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voice-agents'] });
    },
  });
}
