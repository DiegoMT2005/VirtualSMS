# 🤖 LLM Integration Guide - AI Conversation Agent

## Overview

Your SMS booking system now has an intelligent AI conversation agent that can:
- Have natural conversations with customers
- Check service availability in real-time
- Show available time slots
- Create bookings automatically
- Remember conversation context
- Use tools to interact with your database

## Architecture

```
Customer SMS → Twilio Webhook → AI Agent → Database Tools
                    ↓              ↓            ↓
                Save Message   OpenAI API   Supabase
                    ↓              ↓            ↓
                Response ← Natural Reply ← Data
```

## Setup Instructions

### 1. Install OpenAI SDK

```bash
npm install openai
```

### 2. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 3. Add to Environment Variables

Add to your `.env.local`:

```env
OPENAI_API_KEY=sk-your_actual_api_key_here
```

### 4. Test the Integration

Send a test SMS to your Twilio number:

```
Customer: "Hi"
AI: "Hey! 👋 I can help you book a pickup. What's your address?"

Customer: "123 Main St, Toronto M5V 2T6"
AI: "Perfect! We serve that area. We have Regular (48hr), Express (24hr), or Premium (same-day). Which works best?"

Customer: "Express please, 2 loads"
AI: "Got it - 2 loads of Express service. When would you like pickup?"

Customer: "Tomorrow at 2pm"
AI: "Great! Just to confirm:
📍 123 Main St, Toronto M5V 2T6
⚡ Express (24hr) - 2 loads
📅 Dec 22 at 2:00 PM
💰 Total: $44

What's your name?"

Customer: "John Smith"
AI: "Perfect! Your pickup is confirmed for Dec 22 at 2:00 PM. We'll text you when we're on the way! 🧺✨"
```

## How It Works

### 1. Conversation Handler (`lib/ai/conversation-agent.ts`)

The main function that processes messages:

```typescript
handleConversation(
  customerPhone: string,
  message: string,
  conversationHistory: any[],
  clientId: string
): Promise<string>
```

**What it does:**
- Builds conversation context from history
- Sends to OpenAI with system prompt
- Handles tool calls (database operations)
- Returns natural language response

### 2. System Prompt

Defines the AI's personality and behavior:
- Friendly and conversational (like texting a friend)
- Concise messages (under 160 chars when possible)
- Uses emojis occasionally 🧺 ✨ 📅
- Follows a structured booking flow
- Never makes up data - always uses tools

### 3. AI Tools (Function Calling)

The AI can call these functions to interact with your database:

#### `check_service_availability`
Checks if an address is in your service area
```typescript
// Input: { address: "123 Main St, Toronto M5V 2T6" }
// Output: { available: true, city: "Toronto", province: "ON" }
```

#### `get_available_time_slots`
Gets available pickup times for a date
```typescript
// Input: { date: "2024-12-22" }
// Output: { available_slots: [{ time: "09:00", label: "9:00 AM" }, ...] }
```

#### `create_booking`
Creates a confirmed booking
```typescript
// Input: {
//   customer_name: "John Smith",
//   customer_phone: "+15551234567",
//   address: "123 Main St",
//   service_type: "express",
//   number_of_loads: 2,
//   scheduled_date: "2024-12-22",
//   scheduled_time: "14:00"
// }
// Output: { success: true, booking_id: "uuid", total_amount: 44 }
```

#### `check_customer_exists`
Checks if customer has booked before
```typescript
// Input: { phone: "+15551234567" }
// Output: { exists: true, name: "John Smith", total_bookings: 5 }
```

## Customization

### Change AI Model

In `lib/ai/conversation-agent.ts`:

```typescript
// Use GPT-4 for best quality (more expensive)
model: 'gpt-4-turbo-preview'

// Use GPT-3.5 for cost savings (faster, cheaper)
model: 'gpt-3.5-turbo'
```

### Modify Personality

Edit the `SYSTEM_PROMPT` in `lib/ai/conversation-agent.ts`:

```typescript
const SYSTEM_PROMPT = `You are a friendly SMS booking assistant...

YOUR PERSONALITY:
- More formal and professional
- No emojis
- Detailed explanations
...
```

### Add New Tools

Add to the `tools` array:

```typescript
{
  type: 'function',
  function: {
    name: 'check_order_status',
    description: 'Check the status of an existing order',
    parameters: {
      type: 'object',
      properties: {
        order_id: { type: 'string' }
      },
      required: ['order_id']
    }
  }
}
```

Then implement the function:

```typescript
case 'check_order_status':
  toolResult = await checkOrderStatus(functionArgs);
  break;
```

### Update Service Areas

Modify the service area check in `checkServiceAvailability()`:

```typescript
// Add new postal codes
const isAvailable = areas?.some(area =>
  prefix.startsWith(area.postal_code_prefix || '')
);
```

### Adjust Response Length

Change `max_tokens` for longer/shorter responses:

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: messages,
  max_tokens: 150, // Increase for longer responses
});
```

## Cost Optimization

### 1. Use GPT-3.5 Instead of GPT-4

```typescript
model: 'gpt-3.5-turbo' // ~10x cheaper than GPT-4
```

**Pricing:**
- GPT-3.5: ~$0.002 per conversation
- GPT-4: ~$0.02 per conversation

### 2. Limit Conversation History

```typescript
// Only send last 10 messages
const recentHistory = conversationHistory.slice(-10);
```

### 3. Cache Common Responses

```typescript
const commonResponses = {
  greeting: "Hey! 👋 I can help you book a pickup. What's your address?",
  pricing: "Our pricing:\n• Regular: $15 + $8/load\n• Express: $20 + $12/load\n• Premium: $30 + $18/load"
};

// Check for exact matches before calling AI
if (message.toLowerCase() === 'hi') {
  return commonResponses.greeting;
}
```

### 4. Set Token Limits

```typescript
max_tokens: 100 // Shorter responses = lower cost
```

## Alternative LLM Providers

### Use Claude (Anthropic)

```bash
npm install @anthropic-ai/sdk
```

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await anthropic.messages.create({
  model: 'claude-3-sonnet-20240229',
  max_tokens: 150,
  messages: messages,
});
```

### Use Gemini (Google)

```bash
npm install @google/generative-ai
```

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const result = await model.generateContent(prompt);
```

### Use Local LLM (Ollama)

```bash
npm install ollama
```

```typescript
import ollama from 'ollama';

const response = await ollama.chat({
  model: 'llama2',
  messages: messages,
});
```

## Monitoring & Debugging

### Enable Detailed Logging

```typescript
console.log('🔧 AI calling tool:', functionName, functionArgs);
console.log('📊 Tool result:', toolResult);
console.log('💬 AI response:', response);
```

### Track Conversation State

Add to database:

```sql
ALTER TABLE sms_conversations
ADD COLUMN ai_state JSONB DEFAULT '{}';
```

Store context:

```typescript
await supabase
  .from('sms_conversations')
  .update({
    ai_state: {
      last_intent: 'booking',
      collected_data: { address: '123 Main St', loads: 2 }
    }
  })
  .eq('id', conversationId);
```

### Monitor API Usage

Track OpenAI costs:

```typescript
const response = await openai.chat.completions.create({...});

console.log('📊 Tokens used:', {
  prompt: response.usage?.prompt_tokens,
  completion: response.usage?.completion_tokens,
  total: response.usage?.total_tokens,
  estimated_cost: (response.usage?.total_tokens || 0) * 0.00002 // GPT-4 pricing
});
```

## Testing

### Test Individual Tools

```typescript
// Test service availability
const result = await checkServiceAvailability(
  { address: '123 Main St, Toronto M5V 2T6' },
  'your-client-id'
);
console.log(result);
```

### Test Full Conversation

```typescript
const response = await handleConversation(
  '+15551234567',
  'I want to book a pickup',
  [],
  'your-client-id'
);
console.log(response);
```

### Mock OpenAI for Testing

```typescript
// In test environment
if (process.env.NODE_ENV === 'test') {
  return 'Mock response for testing';
}
```

## Troubleshooting

### "Invalid API Key"
- Check `.env.local` has correct `OPENAI_API_KEY`
- Restart dev server after adding env vars

### "Tool not found"
- Ensure tool name in switch statement matches function name
- Check tool is defined in `tools` array

### "Response too long for SMS"
- Reduce `max_tokens` in OpenAI call
- Update system prompt to be more concise

### "AI not calling tools"
- Check tool descriptions are clear
- Verify `tool_choice: 'auto'` is set
- Try `tool_choice: 'required'` to force tool use

### "Database errors in tools"
- Check Supabase connection
- Verify table names and columns match
- Ensure `client_id` is valid

## Next Steps

1. ✅ Install OpenAI SDK: `npm install openai`
2. ✅ Add API key to `.env.local`
3. ✅ Test with SMS: Send "Hi" to your Twilio number
4. ✅ Monitor logs: Check console for AI responses
5. ✅ Customize: Edit system prompt for your brand
6. ✅ Optimize: Switch to GPT-3.5 if needed

## Support

- OpenAI Docs: https://platform.openai.com/docs
- Twilio Docs: https://www.twilio.com/docs/sms
- Supabase Docs: https://supabase.com/docs

Your AI booking agent is ready to handle customer conversations! 🚀
