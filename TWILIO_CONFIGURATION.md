# Twilio Webhook Configuration Guide

## Step-by-Step Configuration

### Step 1: Access Twilio Console

1. Go to https://console.twilio.com
2. Log in to your account
3. Navigate to **Phone Numbers** → **Manage** → **Active numbers**

### Step 2: Select Your Phone Number

1. Click on your phone number from the list
2. You'll see the phone number configuration page

### Step 3: Configure Messaging Webhooks

Scroll down to the **Messaging** section:

#### A Message Comes In
```
Webhook URL: https://your-domain.com/api/webhooks/twilio/sms
HTTP Method: POST
```

**Example URLs:**
- Production: `https://your-app.vercel.app/api/webhooks/twilio/sms`
- Staging: `https://staging.your-app.com/api/webhooks/twilio/sms`
- Local (with ngrok): `https://abc123.ngrok.io/api/webhooks/twilio/sms`

#### Primary Handler Fails (Optional)
Leave this blank or set to the same URL for redundancy.

### Step 4: Configure Status Callback

Still in the **Messaging** section:

#### Status Callback URL
```
URL: https://your-domain.com/api/webhooks/twilio/status
HTTP Method: POST
```

**Example URLs:**
- Production: `https://your-app.vercel.app/api/webhooks/twilio/status`
- Staging: `https://staging.your-app.com/api/webhooks/twilio/status`
- Local (with ngrok): `https://abc123.ngrok.io/api/webhooks/twilio/status`

### Step 5: Save Configuration

1. Scroll to the bottom of the page
2. Click **Save** button
3. Wait for confirmation message

## Configuration Checklist

- [ ] Webhook URLs use HTTPS (required)
- [ ] URLs are correct (no typos)
- [ ] HTTP method is set to POST
- [ ] Configuration saved successfully
- [ ] Test message sent and received

## Visual Reference

```
┌─────────────────────────────────────────────────────────┐
│ Phone Number Configuration                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Phone Number: +1 555 123 4567                          │
│                                                          │
│ ┌─────────────────────────────────────────────────┐   │
│ │ MESSAGING                                        │   │
│ ├─────────────────────────────────────────────────┤   │
│ │                                                  │   │
│ │ Configure With:                                  │   │
│ │ ○ Webhooks, TwiML Bins, Functions, Studio, etc. │   │
│ │                                                  │   │
│ │ A MESSAGE COMES IN                               │   │
│ │ ┌──────────────────────────────────────────┐    │   │
│ │ │ https://your-app.vercel.app/api/...  ▼  │    │   │
│ │ └──────────────────────────────────────────┘    │   │
│ │ HTTP [POST ▼]                                    │   │
│ │                                                  │   │
│ │ PRIMARY HANDLER FAILS                            │   │
│ │ ┌──────────────────────────────────────────┐    │   │
│ │ │                                       ▼  │    │   │
│ │ └──────────────────────────────────────────┘    │   │
│ │                                                  │   │
│ │ STATUS CALLBACK URL                              │   │
│ │ ┌──────────────────────────────────────────┐    │   │
│ │ │ https://your-app.vercel.app/api/...  ▼  │    │   │
│ │ └──────────────────────────────────────────┘    │   │
│ │                                                  │   │
│ └─────────────────────────────────────────────────┘   │
│                                                          │
│                                    [Save Configuration]  │
└─────────────────────────────────────────────────────────┘
```

## Testing Your Configuration

### Test 1: Send SMS
```bash
# Send a test SMS to your Twilio number
# From your phone, send: "Hello"

# Expected result:
# You should receive an auto-response like:
# "Thanks for reaching out! I can help you book laundry pickup..."
```

### Test 2: Check Dashboard
```bash
# 1. Go to your dashboard: https://your-app.com/dashboard/sms
# 2. You should see a new conversation
# 3. Click "View Messages"
# 4. You should see both messages (yours and the auto-response)
```

### Test 3: Verify Status Updates
```bash
# 1. Send another SMS
# 2. Wait 5-10 seconds
# 3. Refresh the message view
# 4. Status should change from "queued" → "sent" → "delivered"
```

## Troubleshooting

### Issue: No Response Received

**Possible Causes:**
1. Webhook URL is incorrect
2. Application not deployed
3. Environment variables not set

**Solution:**
1. Double-check webhook URL (copy-paste from Vercel)
2. Verify app is deployed and running
3. Check Vercel environment variables

### Issue: Response Received but Not in Dashboard

**Possible Causes:**
1. Database connection issue
2. Service role key not set
3. Client ID not configured

**Solution:**
1. Check Vercel logs for errors
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Verify `DEFAULT_CLIENT_ID` is set

### Issue: Status Not Updating

**Possible Causes:**
1. Status callback URL not configured
2. Status callback URL incorrect

**Solution:**
1. Verify status callback URL is set in Twilio
2. Check URL matches exactly (including https://)
3. Check Vercel logs for status callback requests

## Debugging Tools

### Twilio Debugger
```
URL: https://console.twilio.com/monitor/debugger
```

Shows:
- All incoming/outgoing messages
- Webhook requests and responses
- Error messages
- Response times

### Vercel Logs
```
URL: https://vercel.com/[your-team]/[your-project]/logs
```

Filter by:
- Function: `/api/webhooks/twilio/sms`
- Function: `/api/webhooks/twilio/status`

Look for:
- `📱 Twilio SMS received`
- `📊 Twilio Status Update`
- Any error messages

## Local Development with ngrok

For testing webhooks locally:

### Install ngrok
```bash
# Download from https://ngrok.com
# Or install via npm
npm install -g ngrok
```

### Start ngrok
```bash
# Start your Next.js app
npm run dev

# In another terminal, start ngrok
ngrok http 3000
```

### Configure Twilio
```
Use the ngrok URL in Twilio:
https://abc123.ngrok.io/api/webhooks/twilio/sms
https://abc123.ngrok.io/api/webhooks/twilio/status
```

**Note:** ngrok URLs change each time you restart. Update Twilio webhooks accordingly.

## Security Best Practices

1. ✅ Always use HTTPS URLs
2. ✅ Keep `TWILIO_AUTH_TOKEN` secret
3. ✅ Enable signature verification in production
4. ✅ Monitor webhook logs regularly
5. ✅ Set up alerts for failed webhooks
6. ✅ Rotate credentials periodically

## Advanced Configuration

### Multiple Phone Numbers

If you have multiple Twilio numbers:

1. Configure each number with the same webhook URLs
2. The webhook will automatically handle routing
3. Use `data.To` to identify which number received the message

### Messaging Service (Recommended for Scale)

For better management:

1. Go to **Messaging** → **Services**
2. Create a new Messaging Service
3. Add your phone numbers to the service
4. Configure webhooks at the service level
5. All numbers in the service will use the same webhooks

**Benefits:**
- Centralized webhook configuration
- Better for multiple numbers
- Advanced features (sender pool, sticky sender, etc.)

## Next Steps

After configuration:
1. ✅ Test with real SMS
2. ✅ Verify dashboard updates
3. ✅ Check status updates
4. ✅ Monitor logs for issues
5. ✅ Customize auto-responder messages

## Support Resources

- Twilio Docs: https://www.twilio.com/docs/sms/tutorials
- Twilio Support: https://support.twilio.com
- Webhook Debugging: https://www.twilio.com/docs/usage/webhooks/debugging

Your Twilio webhooks are now configured! 🎉
