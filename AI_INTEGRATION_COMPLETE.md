# ✅ AI Integration Complete - SMS Booking Agent

## What Was Built

Your SMS booking system now has a complete AI conversation layer that can:

✅ **Natural Conversations** - Chat naturally with customers like a human
✅ **Service Area Validation** - Check if addresses are in coverage zones
✅ **Real-time Availability** - Show available pickup time slots
✅ **Automatic Booking** - Create confirmed bookings in database
✅ **Customer Recognition** - Remember returning customers
✅ **Context Awareness** - Maintain conversation state across messages

## Files Created

### 1. `lib/ai/conversation-agent.ts` (Main AI Brain)
- OpenAI integration with GPT-4
- 4 database tools (availability, slots, booking, customer check)
- System prompt defining personality and behavior
- Conversation handler with tool calling
- Helper functions for data formatting

### 2. `app/api/webhooks/twilio/sms/route.ts` (Updated)
- Integrated AI agent into webhook
- Replaced keyword matching with intelligent responses
- Maintains conversation history
- Handles errors gracefully with fallbacks

### 3. `LLM_INTEGRATION_GUIDE.md`
- Complete documentation
- Setup instructions
- Customization guide
- Cost optimization tips
- Alternative LLM providers
- Troubleshooting section

### 4. `INSTALL_AI.md`
- Quick start guide
- 4-step installation
- Testing instructions
- Common issues

### 5. `lib/ai/test-agent.ts`
- Test script for AI agent
- Sample conversation flow
- Debugging tool

### 6. `.env.example` (Updated)
- Added `OPENAI_API_KEY` configuration

## How It Works

```
┌─────────────┐
│  Customer   │ "Hi, I need laundry pickup"
│   (SMS)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Twilio    │ Receives SMS, calls webhook
│  Webhook    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  AI Agent   │ Analyzes message + history
│  (OpenAI)   │ Decides what to do
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│   Tools     │   │  Response   │
│ (Database)  │   │  Generator  │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │  ┌──────────────┘
       │  │
       ▼  ▼
┌─────────────┐
│  Supabase   │ Store booking, update state
│  Database   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Customer   │ "Perfect! Your pickup is confirmed..."
│   (SMS)     │
└─────────────┘
```

## Example Conversation

```
Customer: Hi
AI: Hey! 👋 I can help you book a pickup. What's your address?

Customer: 123 Main St, Toronto M5V 2T6
AI: Perfect! We serve that area. We have Regular (48hr), Express (24hr), or Premium (same-day). Which works best?

Customer: Express please, 2 loads
AI: Got it - 2 loads of Express service. When would you like pickup?

Customer: Tomorrow at 2pm
AI: Great! Just to confirm:
📍 123 Main St, Toronto M5V 2T6
⚡ Express (24hr) - 2 loads
📅 Dec 22 at 2:00 PM
💰 Total: $44

What's your name?

Customer: John Smith
AI: Perfect! Your pickup is confirmed for Dec 22 at 2:00 PM. We'll text you when we're on the way! 🧺✨
```

## Installation Steps

### 1. Install OpenAI SDK
```bash
npm install openai
```

### 2. Get API Key
1. Go to https://platform.openai.com/api-keys
2. Create new key
3. Copy it (starts with `sk-`)

### 3. Add to Environment
Add to `.env.local`:
```env
OPENAI_API_KEY=sk-your_actual_key_here
```

### 4. Restart Server
```bash
npm run dev
```

### 5. Test It
Send SMS to your Twilio number: "Hi"

## AI Tools (Function Calling)

The AI can call these functions to interact with your database:

### 1. `check_service_availability`
**Purpose:** Validate if address is in service area
**Input:** `{ address: "123 Main St, Toronto M5V 2T6" }`
**Output:** `{ available: true, city: "Toronto", province: "ON" }`

### 2. `get_available_time_slots`
**Purpose:** Get available pickup times for a date
**Input:** `{ date: "2024-12-22" }`
**Output:** `{ available_slots: [{ time: "09:00", label: "9:00 AM" }, ...] }`

### 3. `create_booking`
**Purpose:** Create confirmed booking in database
**Input:** 
```json
{
  "customer_name": "John Smith",
  "customer_phone": "+15551234567",
  "address": "123 Main St",
  "service_type": "express",
  "number_of_loads": 2,
  "scheduled_date": "2024-12-22",
  "scheduled_time": "14:00"
}
```
**Output:** `{ success: true, booking_id: "uuid", total_amount: 44 }`

### 4. `check_customer_exists`
**Purpose:** Check if customer has booked before
**Input:** `{ phone: "+15551234567" }`
**Output:** `{ exists: true, name: "John Smith", total_bookings: 5 }`

## Customization Options

### Change AI Model
```typescript
// In lib/ai/conversation-agent.ts
model: 'gpt-3.5-turbo' // Cheaper, faster
model: 'gpt-4-turbo-preview' // Better quality
```

### Modify Personality
Edit `SYSTEM_PROMPT` in `lib/ai/conversation-agent.ts`:
```typescript
const SYSTEM_PROMPT = `You are a professional booking assistant...
- Formal tone
- No emojis
- Detailed responses
...`;
```

### Add New Tools
```typescript
{
  type: 'function',
  function: {
    name: 'cancel_booking',
    description: 'Cancel an existing booking',
    parameters: {
      type: 'object',
      properties: {
        booking_id: { type: 'string' }
      }
    }
  }
}
```

### Update Service Areas
Modify postal code prefixes in `checkServiceAvailability()`:
```typescript
// Add new areas
const serviceAreas = ['M4', 'M5', 'L5', 'V6', 'K1']; // Added K1 for Ottawa
```

## Cost Estimates

### GPT-4 (Default)
- **Per conversation:** ~$0.02
- **100 conversations/day:** ~$2/day = $60/month
- **Best quality, most reliable**

### GPT-3.5 (Budget)
- **Per conversation:** ~$0.002
- **100 conversations/day:** ~$0.20/day = $6/month
- **Good quality, 10x cheaper**

### Optimization Tips
1. Use GPT-3.5 for most conversations
2. Limit conversation history to last 10 messages
3. Cache common responses (greetings, pricing)
4. Set `max_tokens: 100` for shorter responses

## Alternative LLM Providers

### Claude (Anthropic)
```bash
npm install @anthropic-ai/sdk
```
- Similar pricing to GPT-4
- Better at following instructions
- Longer context window

### Gemini (Google)
```bash
npm install @google/generative-ai
```
- Free tier available
- Good for high-volume
- Slightly lower quality

### Ollama (Local)
```bash
npm install ollama
```
- Completely free
- Runs on your server
- Requires GPU for good performance

## Monitoring

### View Logs
```bash
# Watch for AI responses
npm run dev

# Look for:
🔧 AI calling tool: check_service_availability
📊 Tool result: { available: true }
💬 AI response: "Perfect! We serve that area..."
```

### Track Costs
Add to conversation handler:
```typescript
console.log('📊 Tokens used:', response.usage?.total_tokens);
console.log('💰 Estimated cost:', response.usage?.total_tokens * 0.00002);
```

### Database Tracking
```sql
-- Add AI metrics to conversations table
ALTER TABLE sms_conversations
ADD COLUMN ai_tokens_used INTEGER DEFAULT 0,
ADD COLUMN ai_cost_cents INTEGER DEFAULT 0;
```

## Testing

### Manual Test
```bash
# Send SMS to your Twilio number
"Hi" → Should get greeting
"123 Main St, Toronto M5V 2T6" → Should check availability
"Express, 2 loads" → Should ask for time
```

### Automated Test
```bash
# Run test script
npx ts-node lib/ai/test-agent.ts
```

### Mock for Development
```typescript
// In conversation-agent.ts
if (process.env.NODE_ENV === 'development') {
  return 'Mock response for testing';
}
```

## Troubleshooting

### "Cannot find module 'openai'"
```bash
npm install openai
```

### "Invalid API key"
- Check `.env.local` has correct key
- Restart dev server: `npm run dev`
- Verify key starts with `sk-`

### "AI not calling tools"
- Check tool descriptions are clear
- Verify database has data (service_areas, services)
- Try `tool_choice: 'required'` to force tool use

### "Response too long for SMS"
- Reduce `max_tokens` to 100
- Update system prompt: "Keep responses under 160 chars"

### "Database errors"
- Check Supabase connection
- Verify `DEFAULT_CLIENT_ID` is set
- Ensure tables exist (service_areas, services, appointments)

## Security Considerations

### API Key Protection
- Never commit `.env.local` to git
- Use environment variables in production
- Rotate keys regularly

### Input Validation
- AI validates addresses before booking
- Phone numbers are sanitized
- SQL injection protected by Supabase

### Rate Limiting
Add to webhook:
```typescript
// Limit to 10 messages per minute per customer
const rateLimitKey = `sms:${fromNumber}`;
const count = await redis.incr(rateLimitKey);
if (count > 10) {
  return respondWithError('Too many messages');
}
```

## Next Steps

1. ✅ Install OpenAI: `npm install openai`
2. ✅ Add API key to `.env.local`
3. ✅ Test with SMS
4. ✅ Monitor logs and costs
5. ✅ Customize personality
6. ✅ Add more tools as needed
7. ✅ Set up monitoring dashboard
8. ✅ Configure rate limiting

## Support Resources

- **OpenAI Docs:** https://platform.openai.com/docs
- **Twilio SMS:** https://www.twilio.com/docs/sms
- **Supabase:** https://supabase.com/docs
- **Function Calling:** https://platform.openai.com/docs/guides/function-calling

## What's Next?

Your AI booking agent is ready! Consider adding:

- **Voice calls** - Integrate with VAPI for phone bookings
- **Multi-language** - Support Spanish, French, etc.
- **Sentiment analysis** - Detect frustrated customers
- **Proactive messages** - Send reminders, updates
- **Analytics dashboard** - Track conversation metrics
- **A/B testing** - Test different prompts

---

**Your SMS booking system is now powered by AI! 🚀**

Customers can book laundry pickups through natural conversation, and the AI handles everything automatically.
