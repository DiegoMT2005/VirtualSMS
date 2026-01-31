# Webhook Setup Guide

## Prerequisites

1. Supabase account with database set up
2. Twilio account with phone number
3. VAPI account (optional, for voice calls)
4. Vercel account (for deployment)

## Step 1: Get Your Credentials

### Supabase
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep this secret!

### Twilio
1. Go to Twilio Console: https://console.twilio.com
2. Copy from dashboard:
   - `Account SID` → `TWILIO_ACCOUNT_SID`
   - `Auth Token` → `TWILIO_AUTH_TOKEN`
3. Go to Phone Numbers → Manage → Active numbers
4. Copy your phone number → `TWILIO_PHONE_NUMBER`

### VAPI (Optional)
1. Go to VAPI Dashboard: https://dashboard.vapi.ai
2. Navigate to Settings → API Keys
3. Copy:
   - `API Key` → `VAPI_API_KEY`
   - `Webhook Secret` → `VAPI_WEBHOOK_SECRET`

### Client ID
1. Go to your Supabase project
2. Open SQL Editor
3. Run: `SELECT id FROM clients LIMIT 1;`
4. Copy the UUID → `DEFAULT_CLIENT_ID`

## Step 2: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567

# VAPI Configuration (Optional)
VAPI_WEBHOOK_SECRET=your_vapi_webhook_secret
VAPI_API_KEY=your_vapi_api_key

# Default Client ID
DEFAULT_CLIENT_ID=9f58289f-b795-4c5c-aa0a-25be1df8ce6d

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Deploy to Production

### Deploy to Vercel

1. Push your code to GitHub
2. Go to Vercel: https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Add all environment variables from `.env.local`
6. Click "Deploy"
7. Copy your production URL (e.g., `https://your-app.vercel.app`)

## Step 4: Configure Webhooks

### Twilio SMS Webhook

**Quick Setup:**
1. Go to Twilio Console → Phone Numbers → Manage → Active numbers
2. Click on your phone number
3. Scroll to "Messaging Configuration"
4. Under "A MESSAGE COMES IN":
   - Webhook: `https://your-app.vercel.app/api/webhooks/twilio/sms`
   - HTTP Method: `POST`
5. Under "STATUS CALLBACK URL":
   - URL: `https://your-app.vercel.app/api/webhooks/twilio/status`
   - HTTP Method: `POST`
6. Click "Save"

**📖 Detailed Instructions:** See `TWILIO_CONFIGURATION.md` for step-by-step guide with screenshots and troubleshooting.

### VAPI Webhook (Optional)

1. Go to VAPI Dashboard: https://dashboard.vapi.ai
2. Navigate to your assistant
3. Under "Webhooks" → "Server URL":
   - URL: `https://your-app.vercel.app/api/webhooks/vapi`
4. Select events to receive:
   - ✅ call.started
   - ✅ call.ended
   - ✅ call.completed
   - ✅ transcript.ready
   - ✅ call.failed
5. Click "Save"

## Step 5: Test Your Webhooks

### Test SMS Webhook

1. Send an SMS to your Twilio number
2. You should receive an auto-response
3. Check your dashboard at `/dashboard/sms`
4. You should see the conversation

### Test Status Callback

1. Send another SMS
2. Wait a few seconds
3. Click "View Messages" in the dashboard
4. Message status should update from "queued" → "sent" → "delivered"

### Test VAPI Webhook

1. Make a call to your VAPI number
2. Have a conversation with the AI
3. Hang up
4. Check your dashboard at `/dashboard/calls`
5. You should see the call log with transcript

## Step 6: Monitor Logs

### Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Logs" tab
4. Filter by function: `/api/webhooks/*`
5. Look for:
   - ✅ `📞 VAPI Webhook: call.started`
   - ✅ `📱 Twilio SMS received`
   - ✅ `📊 Twilio Status Update`

### Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to Database → Tables
3. Check:
   - `call_logs` - Should have new entries
   - `sms_conversations` - Should have new conversations
   - `sms_messages` - Should have individual messages

## Troubleshooting

### Webhook Not Receiving Data

**Check:**
1. Webhook URL is correct (no typos)
2. URL is HTTPS (required by Twilio/VAPI)
3. Environment variables are set in Vercel
4. Check Vercel logs for errors

### Signature Verification Failing

**Fix:**
1. Ensure `TWILIO_AUTH_TOKEN` is correct
2. Ensure `VAPI_WEBHOOK_SECRET` is correct
3. Check that URL in webhook config matches exactly (including https://)

### Messages Not Saving

**Check:**
1. `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Database tables exist (`sms_messages`, `sms_conversations`)
3. Check Vercel logs for database errors

### Auto-Responder Not Working

**Check:**
1. Twilio webhook is configured correctly
2. Check Vercel logs for errors in `/api/webhooks/twilio/sms`
3. Ensure TwiML response is being returned

## Security Best Practices

1. ✅ Never commit `.env.local` to Git
2. ✅ Use environment variables in Vercel
3. ✅ Keep `SUPABASE_SERVICE_ROLE_KEY` secret
4. ✅ Enable signature verification in production
5. ✅ Use HTTPS for all webhook URLs
6. ✅ Rotate API keys regularly

## Next Steps

1. Customize auto-responder messages
2. Integrate with OpenAI/Claude for smarter responses
3. Add more webhook event handlers
4. Set up monitoring and alerts
5. Add rate limiting for security

## Support

If you encounter issues:
1. Check Vercel logs
2. Check Supabase logs
3. Check Twilio debugger: https://console.twilio.com/monitor/debugger
4. Review `WEBHOOK_IMPLEMENTATION.md` for technical details

Your webhooks are now live! 🎉
