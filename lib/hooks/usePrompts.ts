import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface SystemPrompt {
  id: string;
  client_id: string;
  prompt_type: 'voice' | 'sms';
  system_prompt: string;
  prompt_version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePrompts(clientId: string) {
  return useQuery({
    queryKey: ['prompts', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_prompts')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SystemPrompt[];
    },
    enabled: !!clientId,
  });
}

export function useActivePrompt(clientId: string, promptType: 'voice' | 'sms') {
  return useQuery({
    queryKey: ['prompts', clientId, promptType, 'active'],
    queryFn: async () => {
      // First, try to get existing prompt
      const { data, error } = await supabase
        .from('system_prompts')
        .select('*')
        .eq('client_id', clientId)
        .eq('prompt_type', promptType)
        .eq('is_active', true)
        .maybeSingle();

      // If error and not "no rows" error, throw it
      if (error && error.code !== 'PGRST116') throw error;

      // If prompt exists, return it
      if (data) return data as SystemPrompt;

      // If no prompt exists, create a default one
      const defaultPrompt = promptType === 'voice' 
        ? 'You are a helpful voice assistant for booking appointments. Be friendly, professional, and concise.'
        : 'You are a helpful SMS assistant for booking appointments. Keep responses brief and clear.';

      const { data: newPrompt, error: insertError } = await supabase
        .from('system_prompts')
        .insert({
          client_id: clientId,
          prompt_type: promptType,
          company_name: '1Stop Laundry', // Required field
          agent_name: promptType === 'voice' ? 'Voice Assistant' : 'SMS Assistant',
          system_prompt: defaultPrompt,
          prompt_version: 'v1.0.0',
          is_active: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newPrompt as SystemPrompt;
    },
    enabled: !!clientId,
  });
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SystemPrompt> }) => {
      const { data, error } = await supabase
        .from('system_prompts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}
