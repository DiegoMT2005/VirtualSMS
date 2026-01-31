# 🚀 AI Agent Quick Reference

## Installation (3 Steps)

```bash
# 1. Install SDK
npm install openai

# 2. Add to .env.local
OPENAI_API_KEY=sk-your_key_here

# 3. Restart
npm run dev
```

## Test It

Send SMS: `"Hi"` → Should get AI response

## Key Files

| File | Purpose |
|------|---------|
| `lib/ai/conversation-agent.ts` | Main AI logic |
| `app/api/webhooks/twilio/sms/route.ts` | Webhook integration |
| `LLM_INTEGRATION_GUIDE.md` | Full docs |

## AI Tools Available

```typescript
check_service_availability(address) → { available: true/false }
get_available_time_slots(date) → { slots: [...] }
create_booking(details) → { success: true, booking_id }
check_customer_exists(phone) → { exists: true/false }
```

## Customize Personality

Edit `SYSTEM_PROMPT` in `lib/ai/conversation-agent.ts`:

```typescript
const SYSTEM_PROMPT = `You are a [friendly/professional/casual] assistant...`;
```

## Switch to Cheaper Model

```typescript
// In conversation-agent.ts
model: 'gpt-3.5-turbo' // 10x cheaper than GPT-4
```

## Cost Estimates

- **GPT-4:** $0.02/conversation
- **GPT-3.5:** $0.002/conversation

## Common Issues

| Issue | Fix |
|-------|-----|
| "Cannot find module 'openai'" | `npm install openai` |
| "Invalid API key" | Check `.env.local`, restart server |
| "AI not responding" | Check console logs for errors |
| "Response too long" | Reduce `max_tokens` to 100 |

## Add New Tool

```typescript
// 1. Add to tools array
{
  type: 'function',
  function: {
    name: 'your_tool_name',
    description: 'What it does',
    parameters: { /* schema */ }
  }
}

// 2. Add to switch statement
case 'your_tool_name':
  toolResult = await yourFunction(args);
  break;

// 3. Implement function
async function yourFunction(args: any) {
  // Your logic here
  return { result: 'data' };
}
```

## Monitor Costs

```typescript
console.log('Tokens:', response.usage?.total_tokens);
console.log('Cost:', response.usage?.total_tokens * 0.00002);
```

## Example Conversation Flow

```
Customer: "Hi"
AI: "Hey! 👋 What's your address?"

Customer: "123 Main St, Toronto M5V 2T6"
AI: [Calls check_service_availability tool]
AI: "Perfect! We serve that area. Regular, Express, or Premium?"

Customer: "Express, 2 loads"
AI: "When would you like pickup?"

Customer: "Tomorrow at 2pm"
AI: [Calls get_available_time_slots tool]
AI: "Great! What's your name?"

Customer: "John Smith"
AI: [Calls create_booking tool]
AI: "Confirmed! Pickup Dec 22 at 2:00 PM 🧺"
```

## Debugging

```bash
# Watch logs
npm run dev

# Look for:
🔧 AI calling tool: check_service_availability
📊 Tool result: { available: true }
💬 AI response: "Perfect! We serve that area..."
```

## Get Help

- Full guide: `LLM_INTEGRATION_GUIDE.md`
- Install guide: `INSTALL_AI.md`
- OpenAI docs: https://platform.openai.com/docs
