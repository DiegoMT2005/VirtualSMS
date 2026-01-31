-- ============================================
-- Verify Voice Agent Settings Changes
-- Run this in Supabase SQL Editor to check if values were saved
-- ============================================

-- 1. View all voice agents for 1StopLaundry
SELECT 
  id,
  name,
  voice_type,
  language,
  speech_speed,
  pitch,
  greeting_message,
  max_call_duration_minutes,
  silence_timeout_seconds,
  is_active,
  updated_at,
  created_at
FROM voice_agents
WHERE client_id = '9f58289f-b795-4c5c-aa0a-25be1df8ce6d'
ORDER BY updated_at DESC;

-- 2. Check the most recent update timestamp
SELECT 
  'Last updated: ' || updated_at::text as info,
  'Voice Type: ' || voice_type as voice,
  'Speech Speed: ' || speech_speed::text || 'x' as speed,
  'Pitch: ' || pitch::text as pitch_value
FROM voice_agents
WHERE client_id = '9f58289f-b795-4c5c-aa0a-25be1df8ce6d'
ORDER BY updated_at DESC
LIMIT 1;

-- 3. Verify the specific changes you made
-- Expected: voice_type = 'male', speech_speed = 1.2, pitch = 1.0
SELECT 
  CASE 
    WHEN voice_type = 'male' THEN '✅ Voice Type changed to Male'
    ELSE '❌ Voice Type NOT changed (current: ' || voice_type || ')'
  END as voice_check,
  CASE 
    WHEN speech_speed = 1.2 THEN '✅ Speech Speed changed to 1.2x'
    ELSE '❌ Speech Speed NOT changed (current: ' || speech_speed::text || ')'
  END as speed_check,
  CASE 
    WHEN pitch = 1.0 THEN '✅ Pitch is 1.0'
    ELSE '❌ Pitch NOT 1.0 (current: ' || pitch::text || ')'
  END as pitch_check
FROM voice_agents
WHERE client_id = '9f58289f-b795-4c5c-aa0a-25be1df8ce6d'
ORDER BY updated_at DESC
LIMIT 1;
