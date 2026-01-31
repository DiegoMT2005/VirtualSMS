# 🤖 AI SMS Booking Agent - Complete Integration

## What You Got

Your SMS booking system now has **intelligent conversation capabilities** powered by OpenAI. Customers can book laundry pickups through natural text conversations, and the AI handles everything automatically.

## 🎯 Key Features

✅ **Natural Language Understanding** - Understands customer intent, not just keywords
✅ **Context-Aware Conversations** - Remembers what was said earlier
✅ **Real-Time Database Integration** - Checks availability, creates bookings
✅ **Service Area Validation** - Verifies addresses are in coverage zones
✅ **Automatic Booking Creation** - Completes bookings without human intervention
✅ **Customer Recognition** - Identifies returning customers
✅ **Friendly Personality** - Warm, conversational tone with emojis 🧺✨

## 📦 What Was Created

### Core Files

1. **`lib/ai/conversation-agent.ts`** (350 lines)
   - OpenAI GPT-4 integration
   - 4 database tools (function calling)
   - System prompt defining AI personality
   - Conversation state management
   - Error handling with fallbacks

2. **`app/api/webhooks/twilio/sms/route.ts`** (Updated)
   - Integrated AI agent into Twilio webhook
   - Replaced keyword matching with intelligent responses
   - Maintains conversation history
   - Graceful error handling

### Documentation

3. **`LLM_INTEGRATION_GUIDE.md`** - Complete technical documentation
4. **`INSTALL_AI.md`** - Quick 4-step installation guide
5. **`AI_INTEGRATION_COMPLETE.md`** - Comprehensive overview
6. **`AI_QUICK_REFERENCE.md`** - Developer cheat sheet
7. **`README_AI_INTEGRATION.md`** - This file

### Testing & Config

8. **`lib/ai/test-agent.ts`** - Test script for AI conversations
9. **`.env.example`** - Updated with `OPENAI_API_KEY`
10. **`package.json`** - Added `test:ai` script

## 🚀 Quick Start (3 Steps)

### Step 1: Install OpenAI SDK

```bash
npm install openai
```

### Step 2: Add API Key

1. Get your key from: https://platform.openai.com/api-keys
2. Add to `.env.local`:

```env
OPENAI_API_KEY=sk-your_actual_openai_api_key_here
```

### Step 3: Restart & Test

```bash
npm run dev
```

Send an SMS to your Twilio number:
```
You: "Hi"
AI: "Hey! 👋 I can help you book a pickup. What's your address?"
```

**That's it!** Your AI agent is live. 🎉

## 💬 Example Conversation

```
Customer: Hi
AI: Hey! 👋 I can help you book a pickup. What's your address?

Customer: 123 Main St, Toronto M5V 2T6
AI: Perfect! We serve that area. We have Regular (48hr), Express (24hr), 
    or Premium (same-day). Which works best?

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
AI: Perfect! Your pickup is confirmed for Dec 22 at 2:00 PM. 
    We'll text you when we're on the way! 🧺✨
```

## 🛠️ How It Works

```
┌──────────────────────────────────────────────────────────────┐
│                     CONVERSATION FLOW                         │
└──────────────────────────────────────────────────────────────┘

Customer SMS
    ↓
Twilio Webhook
    ↓
Load Conversation History
    ↓
AI Agent (OpenAI GPT-4)
    ├─→ Analyze message + context
    ├─→ Decide what to do
    └─→ Call tools if needed
         ├─→ check_service_availability()
         ├─→ get_available_time_slots()
         ├─→ create_booking()
         └─→ check_customer_exists()
    ↓
Generate Natural Response
    ↓
Save to Database
    ↓
Send SMS Reply
```

## 🔧 AI Tools (Function Calling)

The AI can call these functions to interact with your database:

### 1. Check Service Availability
```typescript
check_service_availability({ address: "123 Main St, Toronto M5V 2T6" })
→ { available: true, city: "Toronto", province: "ON" }
```

### 2. Get Available Time Slots
```typescript
get_available_time_slots({ date: "2024-12-22" })
→ { available_slots: [{ time: "09:00", label: "9:00 AM" }, ...] }
```

### 3. Create Booking
```typescript
create_booking({
  customer_name: "John Smith",
  customer_phone: "+15551234567",
  address: "123 Main St",
  service_type: "express",
  number_of_loads: 2,
  scheduled_date: "2024-12-22",
  scheduled_time: "14:00"
})
→ { success: true, booking_id: "uuid", total_amount: 44 }
```

### 4. Check Customer Exists
```typescript
check_customer_exists({ phone: "+15551234567" })
→ { exists: true, name: "John Smith", total_bookings: 5 }
```

## 💰 Cost Estimates

### GPT-4 (Default - Best Quality)
- **Per conversation:** ~$0.02
- **100 conversations/day:** $2/day = **$60/month**
- **1000 conversations/day:** $20/day = **$600/month**

### GPT-3.5 (Budget - Good Quality)
- **Per conversation:** ~$0.002
- **100 conversations/day:** $0.20/day = **$6/month**
- **1000 conversations/day:** $2/day = **$60/month**

### Switch to GPT-3.5

Edit `lib/ai/conversation-agent.ts`:

```typescript
model: 'gpt-3.5-turbo' // Change from 'gpt-4-turbo-preview'
```

**Recommendation:** Start with GPT-3.5, upgrade to GPT-4 if needed.

## 🎨 Customization

### Change Personality

Edit `SYSTEM_PROMPT` in `lib/ai/conversation-agent.ts`:

```typescript
const SYSTEM_PROMPT = `You are a professional booking assistant...

YOUR PERSONALITY:
- Formal and courteous
- No emojis
- Detailed explanations
- Always use full sentences
...`;
```

### Add New Service Areas

Update postal codes in `checkServiceAvailability()`:

```typescript
// Add Ottawa (K1), Montreal (H2), etc.
const serviceAreas = ['M4', 'M5', 'L5', 'V6', 'K1', 'H2'];
```

### Add New Tools

```typescript
// 1. Add to tools array
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

// 2. Implement function
async function cancelBooking(args: any, clientId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', args.booking_id)
    .eq('client_id', clientId);
  
  return { success: !error };
}

// 3. Add to switch statement
case 'cancel_booking':
  toolResult = await cancelBooking(functionArgs, clientId);
  break;
```

## 🧪 Testing

### Manual Test
Send SMS to your Twilio number and have a conversation.

### Automated Test
```bash
npm run test:ai
```

### Check Logs
```bash
npm run dev

# Watch for:
🔧 AI calling tool: check_service_availability
📊 Tool result: { available: true }
💬 AI response: "Perfect! We serve that area..."
```

## 🐛 Troubleshooting

### "Cannot find module 'openai'"
```bash
npm install openai
```

### "Invalid API key"
1. Check `.env.local` has correct key
2. Verify key starts with `sk-`
3. Restart dev server: `npm run dev`

### "AI not responding"
1. Check console logs for errors
2. Verify Twilio webhook is configured
3. Test with: `npm run test:ai`

### "Response too long for SMS"
1. Reduce `max_tokens` to 100 in `conversation-agent.ts`
2. Update system prompt: "Keep responses under 160 characters"

### "Database errors in tools"
1. Check Supabase connection
2. Verify `DEFAULT_CLIENT_ID` is set in `.env.local`
3. Ensure tables exist: `service_areas`, `services`, `appointments`

## 🔒 Security

### API Key Protection
- ✅ Never commit `.env.local` to git
- ✅ Use environment variables in production
- ✅ Rotate keys regularly
- ✅ Monitor usage on OpenAI dashboard

### Input Validation
- ✅ AI validates addresses before booking
- ✅ Phone numbers are sanitized
- ✅ SQL injection protected by Supabase
- ✅ Twilio signature verification enabled

## 📊 Monitoring

### Track Costs
```typescript
// Add to conversation handler
console.log('📊 Tokens used:', response.usage?.total_tokens);
console.log('💰 Estimated cost:', response.usage?.total_tokens * 0.00002);
```

### Database Metrics
```sql
-- Add to sms_conversations table
ALTER TABLE sms_conversations
ADD COLUMN ai_tokens_used INTEGER DEFAULT 0,
ADD COLUMN ai_cost_cents INTEGER DEFAULT 0;
```

### OpenAI Dashboard
Monitor usage at: https://platform.openai.com/usage

## 🚀 Next Steps

### Immediate
1. ✅ Install OpenAI: `npm install openai`
2. ✅ Add API key to `.env.local`
3. ✅ Test with SMS
4. ✅ Monitor logs and costs

### Short Term
5. Customize personality for your brand
6. Add more tools (cancel booking, check status)
7. Set up cost monitoring
8. Configure rate limiting

### Long Term
9. Add multi-language support
10. Integrate voice calls (VAPI)
11. Build analytics dashboard
12. A/B test different prompts

## 📚 Documentation

- **Quick Start:** `INSTALL_AI.md`
- **Full Guide:** `LLM_INTEGRATION_GUIDE.md`
- **Complete Overview:** `AI_INTEGRATION_COMPLETE.md`
- **Developer Reference:** `AI_QUICK_REFERENCE.md`

## 🆘 Support Resources

- **OpenAI Docs:** https://platform.openai.com/docs
- **Function Calling:** https://platform.openai.com/docs/guides/function-calling
- **Twilio SMS:** https://www.twilio.com/docs/sms
- **Supabase:** https://supabase.com/docs

## 🎉 What's Next?

Your SMS booking system is now powered by AI! Customers can book laundry pickups through natural conversations, and the AI handles everything automatically.

**Key Benefits:**
- 24/7 automated booking
- No human intervention needed
- Natural, friendly conversations
- Real-time availability checking
- Automatic database updates

**Ready to go live?**
1. Install OpenAI SDK
2. Add your API key
3. Test it out
4. Start taking bookings!

---

**Questions?** Check the documentation files or review the code in `lib/ai/conversation-agent.ts`.

**Happy booking! 🧺✨**
