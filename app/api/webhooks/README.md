# Webhook Endpoints

## Available Endpoints

### 1. VAPI Voice Call Webhook
**Endpoint:** `/api/webhooks/vapi`  
**Method:** POST  
**Purpose:** Receives voice call events from VAPI

**Events handled:**
- `call.started` - New call initiated
- `call.ended` / `call.completed` - Call finished
- `transcript.ready` - Full transcript available
- `call.failed` - Call failed

**Security:** HMAC SHA-256 signature verification

---

### 2. Twilio SMS Webhook
**Endpoint:** `/api/webhooks/twilio/sms`  
**Method:** POST  
**Purpose:** Receives incoming SMS messages

**Features:**
- Auto-responds to customer messages
- Tracks conversations
- Supports media attachments
- Stores message history

**Security:** Twilio signature verification

---

### 3. Twilio Status Callback
**Endpoint:** `/api/webhooks/twilio/status`  
**Method:** POST  
**Purpose:** Tracks SMS delivery status

**Status updates:**
- `queued` - Message queued
- `sending` - Being sent
- `sent` - Sent to carrier
- `delivered` - Delivered to recipient
- `failed` - Failed to send
- `undelivered` - Not delivered

---

## Testing

All endpoints support GET requests for health checks:

```bash
curl https://yourdomain.com/api/webhooks/vapi
curl https://yourdomain.com/api/webhooks/twilio/sms
curl https://yourdomain.com/api/webhooks/twilio/status
```

## Configuration

See `WEBHOOK_IMPLEMENTATION.md` for full setup instructions.
