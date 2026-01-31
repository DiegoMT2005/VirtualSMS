-- ============================================
-- Add LLM Configuration to API Settings
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add LLM provider columns to api_settings table
ALTER TABLE api_settings 
ADD COLUMN IF NOT EXISTS llm_provider TEXT CHECK (llm_provider IN ('openai', 'claude', 'gemini')),
ADD COLUMN IF NOT EXISTS llm_api_key TEXT,
ADD COLUMN IF NOT EXISTS llm_model TEXT,
ADD COLUMN IF NOT EXISTS llm_is_active BOOLEAN DEFAULT false;

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_settings_llm_provider ON api_settings(llm_provider);
CREATE INDEX IF NOT EXISTS idx_api_settings_llm_active ON api_settings(llm_is_active);

-- 3. Insert default LLM configuration for existing clients (if they don't have one)
INSERT INTO api_settings (client_id, key_name, api_key, key_type, llm_provider, llm_is_active)
SELECT 
  id,
  'LLM Configuration',
  '',
  'live',
  'openai',
  false
FROM clients
WHERE NOT EXISTS (
  SELECT 1 FROM api_settings 
  WHERE api_settings.client_id = clients.id 
  AND api_settings.key_name = 'LLM Configuration'
)
ON CONFLICT DO NOTHING;

-- Done! ✅
SELECT 'LLM configuration columns added successfully!' as status;
