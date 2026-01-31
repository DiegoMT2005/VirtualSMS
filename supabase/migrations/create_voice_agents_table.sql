-- ============================================
-- Voice Agents Table Setup (Compatible with existing schema)
-- ============================================
-- NOTE: The voice_agents table already exists in your database.
-- This migration only adds missing columns and updates the trigger.

-- Add 'name' and 'description' columns if they don't exist (they already exist in your schema)
-- These are already present, so we skip them

-- Ensure the updated_at trigger exists
CREATE OR REPLACE FUNCTION update_voice_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS voice_agents_updated_at ON voice_agents;
CREATE TRIGGER voice_agents_updated_at
  BEFORE UPDATE ON voice_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_agents_updated_at();

-- Enable RLS if not already enabled
ALTER TABLE voice_agents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own voice agents" ON voice_agents;
DROP POLICY IF EXISTS "Users can update their own voice agents" ON voice_agents;
DROP POLICY IF EXISTS "Users can insert their own voice agents" ON voice_agents;
DROP POLICY IF EXISTS "Allow public read access" ON voice_agents;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON voice_agents;

-- Create RLS Policies (using client_id from user_profiles)
CREATE POLICY "Users can view their own voice agents"
  ON voice_agents FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own voice agents"
  ON voice_agents FOR UPDATE
  USING (
    client_id IN (
      SELECT client_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own voice agents"
  ON voice_agents FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT client_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_voice_agents_client_id ON voice_agents(client_id);
CREATE INDEX IF NOT EXISTS idx_voice_agents_active ON voice_agents(is_active);

-- Insert default voice agent for existing clients (if they don't have one)
INSERT INTO voice_agents (client_id, name, voice_type, language, greeting_message)
SELECT 
  id,
  'Default Voice Agent',
  'female',
  'en-US',
  'Hello! Thank you for calling. How can I assist you today?'
FROM clients
WHERE NOT EXISTS (
  SELECT 1 FROM voice_agents WHERE voice_agents.client_id = clients.id
)
ON CONFLICT DO NOTHING;
