# 🚀 Quick Install - AI Conversation Agent

## 1. Install OpenAI SDK

```bash
npm install openai
```

## 2. Add API Key

Add to `.env.local`:

```env
OPENAI_API_KEY=sk-your_actual_openai_api_key
```

Get your key from: https://platform.openai.com/api-keys

## 3. Restart Dev Server

```bash
npm run dev
```

## 4. Test It!

Send an SMS to your Twilio number:

```
You: "Hi"
AI: "Hey! 👋 I can help you book a pickup. What's your address?"
```

## That's It! 🎉

Your AI agent is now handling conversations automatically.

See `LLM_INTEGRATION_GUIDE.md` for full documentation.

## Cost Estimate

- GPT-4: ~$0.02 per conversation
- GPT-3.5: ~$0.002 per conversation

To use cheaper GPT-3.5, edit `lib/ai/conversation-agent.ts`:

```typescript
model: 'gpt-3.5-turbo' // Change from 'gpt-4-turbo-preview'
```

## Troubleshooting

**"Module not found: openai"**
→ Run `npm install openai`

**"Invalid API key"**
→ Check `.env.local` has correct key
→ Restart dev server

**"AI not responding"**
→ Check console logs for errors
→ Verify Twilio webhook is configured
