-- ============================================
-- Supabase Setup for System Prompts
-- Run this in your Supabase SQL Editor
-- ============================================

-- NOTE: Your system_prompts table already exists with the correct schema
-- This script only sets up RLS policies and seed data

-- 1. Create indexes for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_prompts_client ON system_prompts(client_id);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON system_prompts(prompt_type);
CREATE INDEX IF NOT EXISTS idx_prompts_active ON system_prompts(is_active);

-- 2. Enable Row Level Security (if not already enabled)
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on system_prompts" ON system_prompts;
DROP POLICY IF EXISTS "Enable read access for all users" ON system_prompts;
DROP POLICY IF EXISTS "Enable insert for all users" ON system_prompts;
DROP POLICY IF EXISTS "Enable update for all users" ON system_prompts;
DROP POLICY IF EXISTS "Enable delete for all users" ON system_prompts;

-- 4. Create permissive policies for demo/development
-- These allow all operations without authentication
-- For production, you should restrict these based on auth.uid()

CREATE POLICY "Enable read access for all users" ON system_prompts
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON system_prompts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON system_prompts
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON system_prompts
  FOR DELETE USING (true);

-- 5. Create trigger for updating updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_prompts_updated_at ON system_prompts;

CREATE TRIGGER update_prompts_updated_at 
  BEFORE UPDATE ON system_prompts
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Insert default prompts for the default client
-- Replace the client_id with your NEXT_PUBLIC_DEFAULT_CLIENT_ID from .env.local
INSERT INTO system_prompts (
  client_id, 
  prompt_type, 
  company_name,
  agent_name,
  system_prompt, 
  prompt_version, 
  is_active
)
VALUES 
  (
    '9f58289f-b795-4c5c-aa0a-25be1df8ce6d', 
    'voice',
    '1Stop Laundry',
    'Voice Assistant',
    'You are a professional voice assistant for 1Stop Laundry, a laundry pickup and delivery service.

Your role is to:
- Answer customer questions about our services
- Help customers schedule laundry pickup appointments
- Provide information about pricing and service areas
- Handle booking confirmations and changes
- Be friendly, professional, and efficient

Service Details:
- We offer pickup and delivery laundry service
- Operating hours: Monday-Saturday, 8 AM - 6 PM
- Service areas: Check customer address for availability
- Pricing: Based on weight and service type

When booking appointments:
1. Collect customer name and phone number
2. Get pickup address
3. Confirm preferred pickup date and time
4. Ask about any special instructions
5. Confirm all details before finalizing

Always be courteous, clear, and helpful. If you don''t know something, offer to have someone call them back.',
    'v1.0.0',
    true
  ),
  (
    '9f58289f-b795-4c5c-aa0a-25be1df8ce6d',
    'sms',
    '1Stop Laundry',
    'SMS Assistant',
    'You are an SMS assistant for 1Stop Laundry pickup and delivery service.

Keep responses brief and clear (SMS-friendly).

Your role:
- Answer service questions
- Help schedule pickups
- Confirm appointments
- Provide pricing info

Service Info:
- Pickup & delivery laundry service
- Mon-Sat, 8 AM - 6 PM
- Pricing based on weight

For bookings, collect:
- Name & phone
- Pickup address
- Preferred date/time
- Special instructions

Be friendly and concise. Use short sentences.',
    'v1.0.0',
    true
  )
ON CONFLICT DO NOTHING;

-- 7. Verify the setup
SELECT 
  'Setup complete! Found ' || COUNT(*) || ' system prompts' as status
FROM system_prompts
WHERE client_id = '9f58289f-b795-4c5c-aa0a-25be1df8ce6d';

-- Show the prompts
SELECT 
  prompt_type,
  company_name,
  agent_name,
  LEFT(system_prompt, 100) || '...' as prompt_preview,
  prompt_version,
  is_active,
  created_at
FROM system_prompts
WHERE client_id = '9f58289f-b795-4c5c-aa0a-25be1df8ce6d'
ORDER BY prompt_type;
