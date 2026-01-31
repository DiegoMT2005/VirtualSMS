// Database types matching actual Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          plan: 'starter' | 'professional' | 'enterprise' | null;
          status: 'active' | 'inactive' | null;
          total_calls: number | null;
          joined_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          plan?: 'starter' | 'professional' | 'enterprise' | null;
          status?: 'active' | 'inactive' | null;
          total_calls?: number | null;
          joined_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          plan?: 'starter' | 'professional' | 'enterprise' | null;
          status?: 'active' | 'inactive' | null;
          total_calls?: number | null;
          joined_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          role: 'super_admin' | 'client_admin' | 'viewer';
          client_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          role: 'super_admin' | 'client_admin' | 'viewer';
          client_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'super_admin' | 'client_admin' | 'viewer';
          client_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      call_logs: {
        Row: {
          id: string;
          client_id: string;
          voice_agent_id: string | null;
          call_sid: string | null;
          direction: 'inbound' | 'outbound';
          from_number: string | null;
          to_number: string | null;
          phone_number: string | null;
          status: string;
          duration_seconds: number | null;
          started_at: string | null;
          ended_at: string | null;
          transcript: string | null;
          summary: string | null;
          sentiment: 'positive' | 'neutral' | 'negative' | null;
          recording_url: string | null;
          cost_amount: number | null;
          booking_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          voice_agent_id?: string | null;
          call_sid?: string | null;
          direction: 'inbound' | 'outbound';
          from_number?: string | null;
          to_number?: string | null;
          phone_number?: string | null;
          status?: string;
          duration_seconds?: number | null;
          started_at?: string | null;
          ended_at?: string | null;
          transcript?: string | null;
          summary?: string | null;
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          recording_url?: string | null;
          cost_amount?: number | null;
          booking_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          voice_agent_id?: string | null;
          call_sid?: string | null;
          direction?: 'inbound' | 'outbound';
          from_number?: string | null;
          to_number?: string | null;
          phone_number?: string | null;
          status?: string;
          duration_seconds?: number | null;
          started_at?: string | null;
          ended_at?: string | null;
          transcript?: string | null;
          summary?: string | null;
          sentiment?: 'positive' | 'neutral' | 'negative' | null;
          recording_url?: string | null;
          cost_amount?: number | null;
          booking_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          customer_id: string | null;
          title: string;
          scheduled_at: string;
          duration_minutes: number;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          status: string;
          payment_status: string | null;
          payment_amount: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          customer_id?: string | null;
          title: string;
          scheduled_at: string;
          duration_minutes?: number;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          status?: string;
          payment_status?: string | null;
          payment_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          customer_id?: string | null;
          title?: string;
          scheduled_at?: string;
          duration_minutes?: number;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          status?: string;
          payment_status?: string | null;
          payment_amount?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          client_id: string;
          phone: string;
          name: string | null;
          email: string | null;
          address: string | null;
          total_bookings: number | null;
          total_spent: number | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          phone: string;
          name?: string | null;
          email?: string | null;
          address?: string | null;
          total_bookings?: number | null;
          total_spent?: number | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          phone?: string;
          name?: string | null;
          email?: string | null;
          address?: string | null;
          total_bookings?: number | null;
          total_spent?: number | null;
          tags?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sms_conversations: {
        Row: {
          id: string;
          client_id: string;
          customer_phone: string;
          direction: 'inbound' | 'outbound';
          status: string;
          message_count: number | null;
          last_message_at: string | null;
          booking_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          customer_phone: string;
          direction: 'inbound' | 'outbound';
          status?: string;
          message_count?: number | null;
          last_message_at?: string | null;
          booking_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          customer_phone?: string;
          direction?: 'inbound' | 'outbound';
          status?: string;
          message_count?: number | null;
          last_message_at?: string | null;
          booking_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      faqs: {
        Row: {
          id: string;
          client_id: string;
          category: string;
          question: string;
          answer: string;
          keywords: string[] | null;
          usage_count: number | null;
          is_active: boolean;
          display_order: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          category: string;
          question: string;
          answer: string;
          keywords?: string[] | null;
          usage_count?: number | null;
          is_active?: boolean;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          category?: string;
          question?: string;
          answer?: string;
          keywords?: string[] | null;
          usage_count?: number | null;
          is_active?: boolean;
          display_order?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      system_prompts: {
        Row: {
          id: string;
          client_id: string;
          prompt_name: string;
          prompt_version: string;
          prompt_type: 'voice' | 'sms' | null;
          system_prompt: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          prompt_name?: string;
          prompt_version?: string;
          prompt_type?: 'voice' | 'sms' | null;
          system_prompt: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          prompt_name?: string;
          prompt_version?: string;
          prompt_type?: 'voice' | 'sms' | null;
          system_prompt?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      voice_agents: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          description: string | null;
          voice_type: string;
          language: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          description?: string | null;
          voice_type?: string;
          language?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          name?: string;
          description?: string | null;
          voice_type?: string;
          language?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          client_id: string;
          service_name: string;
          service_type: string;
          base_price: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          service_name: string;
          service_type: string;
          base_price: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          service_name?: string;
          service_type?: string;
          base_price?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      api_settings: {
        Row: {
          id: string;
          client_id: string;
          key_name: string;
          api_key: string;
          key_type: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          key_name: string;
          api_key: string;
          key_type?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          key_name?: string;
          api_key?: string;
          key_type?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

// Exported types for easy use
export type Client = Tables<'clients'>;
export type UserProfile = Tables<'user_profiles'>;
export type CallLog = Tables<'call_logs'>;
export type Appointment = Tables<'appointments'>;
export type Customer = Tables<'customers'>;
export type SmsConversation = Tables<'sms_conversations'>;
export type Faq = Tables<'faqs'>;
export type SystemPrompt = Tables<'system_prompts'>;
export type VoiceAgent = Tables<'voice_agents'>;
export type Service = Tables<'services'>;
export type ApiSetting = Tables<'api_settings'>;

// Legacy type aliases for backward compatibility
export type Call = CallLog;
export type Booking = Appointment;
export type SmsMessage = SmsConversation;
