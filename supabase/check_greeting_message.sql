-- Check the greeting message in database
SELECT 
  id,
  name,
  greeting_message,
  updated_at
FROM voice_agents
WHERE client_id = '9f58289f-b795-4c5c-aa0a-25be1df8ce6d'
ORDER BY updated_at DESC;
