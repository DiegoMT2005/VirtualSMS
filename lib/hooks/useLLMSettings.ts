import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface LLMSettings {
  id: string;
  client_id: string;
  llm_provider: 'openai' | 'claude' | 'gemini';
  llm_api_key: string;
  llm_model?: string;
  llm_is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useLLMSettings(clientId: string) {
  return useQuery({
    queryKey: ['llm-settings', clientId],
    queryFn: async (): Promise<LLMSettings | null> => {
      const { data, error } = await supabase
        .from('api_settings')
        .select('*')
        .eq('client_id', clientId)
        .eq('key_name', 'LLM Configuration')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data;
    },
    enabled: !!clientId,
  });
}

export function useUpdateLLMSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      provider,
      apiKey,
      model,
    }: {
      clientId: string;
      provider: 'openai' | 'claude' | 'gemini';
      apiKey: string;
      model?: string;
    }) => {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('api_settings')
        .select('id')
        .eq('client_id', clientId)
        .eq('key_name', 'LLM Configuration')
        .single();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('api_settings')
          .update({
            llm_provider: provider,
            llm_api_key: apiKey,
            llm_model: model,
            llm_is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('api_settings')
          .insert({
            client_id: clientId,
            key_name: 'LLM Configuration',
            api_key: apiKey,
            key_type: 'live',
            llm_provider: provider,
            llm_api_key: apiKey,
            llm_model: model,
            llm_is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-settings'] });
    },
  });
}
