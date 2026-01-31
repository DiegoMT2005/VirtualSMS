-- Debug: Check voice agent data
SELECT 
  id,
  name,
  voice_type,
  language,
  speech_speed,
  pitch,
  is_active,
  updated_at
FROM voice_agents
WHERE client_id = '9f58289f-b795-4c5c-aa0a-25be1df8ce6d'
ORDER BY updated_at DESC;
