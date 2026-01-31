# 🏗️ AI Agent Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMS BOOKING SYSTEM                            │
│                   with AI Conversation Agent                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Customer   │  "Hi, I need laundry pickup at 123 Main St"
│    Phone     │
└──────┬───────┘
       │ SMS
       ▼
┌──────────────┐
│    Twilio    │  Receives SMS, validates signature
│   Platform   │
└──────┬───────┘
       │ HTTP POST
       ▼
┌──────────────────────────────────────────────────────────────┐
│  /api/webhooks/twilio/sms                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. Parse incoming message                              │  │
│  │ 2. Load conversation history from database            │  │
│  │ 3. Call AI conversation agent                         │  │
│  │ 4. Save response to database                          │  │
│  │ 5. Return TwiML response                              │  │
│  └────────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  lib/ai/conversation-agent.ts                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ handleConversation()                                   │  │
│  │ ├─ Build message history                              │  │
│  │ ├─ Add system prompt                                  │  │
│  │ ├─ Call OpenAI API                                    │  │
│  │ └─ Handle tool calls                                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│   OpenAI     │  GPT-4 / GPT-3.5
│   API        │  - Analyzes conversation
│              │  - Decides what to do
│              │  - Calls tools if needed
└──────┬───────┘
       │
       ├─────────────────────────────────────────────────────┐
       │                                                      │
       ▼                                                      ▼
┌──────────────┐                                    ┌──────────────┐
│  Direct      │                                    │  Tool Call   │
│  Response    │                                    │  Required    │
└──────┬───────┘                                    └──────┬───────┘
       │                                                    │
       │                                                    ▼
       │                                    ┌───────────────────────┐
       │                                    │  Execute Tool         │
       │                                    │  ├─ check_service_... │
       │                                    │  ├─ get_available_... │
       │                                    │  ├─ create_booking    │
       │                                    │  └─ check_customer... │
       │                                    └──────┬────────────────┘
       │                                           │
       │                                           ▼
       │                                    ┌──────────────┐
       │                                    │  Supabase    │
       │                                    │  Database    │
       │                                    │  ├─ Query    │
       │                                    │  ├─ Insert   │
       │                                    │  └─ Update   │
       │                                    └──────┬───────┘
       │                                           │
       │                                           ▼
       │                                    ┌──────────────┐
       │                                    │  Tool Result │
       │                                    └──────┬───────┘
       │                                           │
       │                                           ▼
       │                                    ┌──────────────┐
       │                                    │  OpenAI API  │
       │                                    │  (2nd call)  │
       │                                    │  Generate    │
       │                                    │  natural     │
       │                                    │  response    │
       │                                    └──────┬───────┘
       │                                           │
       └───────────────────┬───────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  AI Response │
                    │  "Perfect!   │
                    │  We serve    │
                    │  that area"  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Save to DB  │
                    │  (sms_msgs)  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Return      │
                    │  TwiML       │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Twilio     │
                    │   Sends SMS  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Customer   │
                    │   Receives   │
                    └──────────────┘
```

## Data Flow

### 1. Incoming Message

```typescript
{
  From: "+15551234567",
  To: "+15559876543",
  Body: "Hi, I need laundry pickup",
  MessageSid: "SM..."
}
```

### 2. Conversation History

```typescript
[
  { direction: 'inbound', body: 'Hi' },
  { direction: 'outbound', body: 'Hey! What\'s your address?' },
  { direction: 'inbound', body: '123 Main St, Toronto M5V 2T6' }
]
```

### 3. OpenAI Request

```typescript
{
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: 'Hi' },
    { role: 'assistant', content: 'Hey! What\'s your address?' },
    { role: 'user', content: '123 Main St, Toronto M5V 2T6' }
  ],
  tools: [...],
  tool_choice: 'auto'
}
```

### 4. Tool Call

```typescript
{
  tool_calls: [{
    id: 'call_abc123',
    function: {
      name: 'check_service_availability',
      arguments: '{"address":"123 Main St, Toronto M5V 2T6"}'
    }
  }]
}
```

### 5. Tool Result

```typescript
{
  available: true,
  city: 'Toronto',
  province: 'ON'
}
```

### 6. Final Response

```typescript
{
  role: 'assistant',
  content: 'Perfect! We serve that area. We have Regular (48hr), Express (24hr), or Premium (same-day). Which works best?'
}
```

## Database Schema

### sms_conversations
```sql
id                UUID PRIMARY KEY
client_id         UUID REFERENCES clients(id)
customer_phone    TEXT
direction         TEXT ('inbound' | 'outbound')
status            TEXT ('active' | 'completed')
conversation_state TEXT
message_count     INTEGER
started_at        TIMESTAMP
last_message_at   TIMESTAMP
```

### sms_messages
```sql
id                UUID PRIMARY KEY
conversation_id   UUID REFERENCES sms_conversations(id)
message_sid       TEXT
direction         TEXT ('inbound' | 'outbound')
from_number       TEXT
to_number         TEXT
body              TEXT
status            TEXT
created_at        TIMESTAMP
```

### appointments
```sql
id                UUID PRIMARY KEY
client_id         UUID
customer_id       UUID
service_id        UUID
scheduled_at      TIMESTAMP
customer_name     TEXT
customer_phone    TEXT
pickup_address    TEXT
number_of_loads   INTEGER
status            TEXT
payment_status    TEXT
payment_amount    DECIMAL
```

## AI Tools Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AI TOOLS                              │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  check_service_availability                              │
│  ├─ Extract postal code from address                    │
│  ├─ Query service_areas table                           │
│  ├─ Check if postal code prefix matches                 │
│  └─ Return { available: true/false, city, province }    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  get_available_time_slots                                │
│  ├─ Query availability_slots table                      │
│  ├─ Filter by date and is_available                     │
│  ├─ Format times (24hr → 12hr)                          │
│  └─ Return { available_slots: [...] }                   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  create_booking                                          │
│  ├─ Find or create customer                             │
│  ├─ Get service details                                 │
│  ├─ Calculate total amount                              │
│  ├─ Insert appointment record                           │
│  └─ Return { success: true, booking_id, total_amount }  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  check_customer_exists                                   │
│  ├─ Query customers table by phone                      │
│  ├─ Get booking history                                 │
│  └─ Return { exists: true/false, name, total_bookings } │
└──────────────────────────────────────────────────────────┘
```

## Conversation State Machine

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  GREETING   │  "Hi" → "Hey! What's your address?"
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  COLLECTING │  "123 Main St" → Check availability
│  ADDRESS    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ VALIDATING  │  Tool: check_service_availability
│  ADDRESS    │
└──────┬──────┘
       │
       ├─ Not Available → "Sorry, we don't serve that area"
       │
       └─ Available ▼
┌─────────────┐
│ SELECTING   │  "Express, 2 loads" → Get time slots
│  SERVICE    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ SELECTING   │  Tool: get_available_time_slots
│   TIME      │  "Tomorrow at 2pm" → Confirm details
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ CONFIRMING  │  "John Smith" → Create booking
│  BOOKING    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  CREATING   │  Tool: create_booking
│  BOOKING    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ COMPLETED   │  "Confirmed! Pickup Dec 22 at 2pm"
└─────────────┘
```

## Error Handling

```
┌──────────────────────────────────────────────────────────┐
│                   ERROR HANDLING                          │
└──────────────────────────────────────────────────────────┘

OpenAI API Error
    ├─ Network timeout → Retry with exponential backoff
    ├─ Rate limit → Wait and retry
    ├─ Invalid API key → Log error, return fallback response
    └─ Unknown error → Return friendly error message

Tool Execution Error
    ├─ Database connection → Return "Service temporarily unavailable"
    ├─ Invalid data → Ask customer to clarify
    ├─ Not found → Provide alternative options
    └─ Unknown error → Offer human assistance

Twilio Webhook Error
    ├─ Invalid signature → Return 403 Forbidden
    ├─ Missing data → Log error, return error TwiML
    └─ Unknown error → Return generic error TwiML

Fallback Response
    └─ "Thanks for reaching out! I can help you book laundry pickup.
        Reply: BOOK to schedule, PRICE for rates, HELP for options"
```

## Performance Optimization

```
┌──────────────────────────────────────────────────────────┐
│              PERFORMANCE OPTIMIZATIONS                    │
└──────────────────────────────────────────────────────────┘

1. Conversation History Limiting
   └─ Only send last 10 messages to OpenAI
   └─ Reduces token usage and cost

2. Response Caching
   └─ Cache common responses (greetings, pricing)
   └─ Skip OpenAI call for exact matches

3. Token Limits
   └─ max_tokens: 150 for concise SMS responses
   └─ Prevents overly long messages

4. Model Selection
   └─ GPT-3.5 for simple queries
   └─ GPT-4 for complex booking flows

5. Database Connection Pooling
   └─ Reuse Supabase client
   └─ Faster query execution

6. Parallel Tool Calls
   └─ Execute multiple tools simultaneously
   └─ Reduce total response time
```

## Security Layers

```
┌──────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                          │
└──────────────────────────────────────────────────────────┘

Layer 1: Twilio Signature Verification
    └─ Validates request came from Twilio
    └─ Prevents unauthorized webhook calls

Layer 2: Environment Variables
    └─ API keys stored in .env.local
    └─ Never committed to git

Layer 3: Supabase Row Level Security
    └─ client_id filtering on all queries
    └─ Prevents cross-client data access

Layer 4: Input Sanitization
    └─ Phone numbers normalized
    └─ Addresses validated
    └─ SQL injection protected

Layer 5: Rate Limiting (Optional)
    └─ Limit messages per customer per minute
    └─ Prevents spam and abuse
```

## Monitoring Points

```
┌──────────────────────────────────────────────────────────┐
│                  MONITORING POINTS                        │
└──────────────────────────────────────────────────────────┘

1. Webhook Endpoint
   └─ Log: Incoming messages, response times
   └─ Alert: High error rates, slow responses

2. AI Agent
   └─ Log: Tool calls, token usage, costs
   └─ Alert: API errors, high costs

3. Database
   └─ Log: Query times, connection errors
   └─ Alert: Slow queries, connection failures

4. Twilio
   └─ Log: Message delivery status
   └─ Alert: Failed deliveries, high costs

5. Business Metrics
   └─ Track: Bookings created, conversion rate
   └─ Alert: Low conversion, high abandonment
```

---

This architecture provides a robust, scalable foundation for AI-powered SMS booking with clear separation of concerns and comprehensive error handling.
