-- ============================================
-- Quick Setup: Voice Agents RLS & Trigger
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION update_voice_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS voice_agents_updated_at ON voice_agents;
CREATE TRIGGER voice_agents_updated_at
  BEFORE UPDATE ON voice_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_agents_updated_at();

-- 2. Enable RLS
ALTER TABLE voice_agents ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies (if any)
DROP POLICY IF EXISTS "Users can view their own voice agents" ON voice_agents;
DROP POLICY IF EXISTS "Users can update their own voice agents" ON voice_agents;
DROP POLICY IF EXISTS "Users can insert their own voice agents" ON voice_agents;

-- 4. Create new RLS policies
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

-- 5. Create indexes (if not exist)
CREATE INDEX IF NOT EXISTS idx_voice_agents_client_id ON voice_agents(client_id);
CREATE INDEX IF NOT EXISTS idx_voice_agents_active ON voice_agents(is_active);

-- 6. Insert default voice agent for clients without one
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

-- Done! ✅
SELECT 'Voice agents setup complete!' as status;
