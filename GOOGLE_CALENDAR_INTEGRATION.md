# Google Calendar Integration Guide

This guide will help you implement Google Calendar integration for syncing appointments.

## Prerequisites

1. Google Cloud Console account
2. Next.js application (already set up)
3. Supabase database with appointments table

## Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure consent screen if prompted:
   - User Type: External
   - App name: Your app name
   - User support email: Your email
   - Developer contact: Your email
4. Application type: Web application
5. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```
6. Save the Client ID and Client Secret

## Step 3: Install Required Packages

```bash
npm install @react-oauth/google googleapis
npm install -D @types/google.auth
```

## Step 4: Add Environment Variables

Add to your `.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

## Step 5: Create API Route for OAuth Callback

Create `app/api/auth/callback/google/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // user_id

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', request.url));
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens in Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from('user_integrations')
      .upsert({
        user_id: state,
        provider: 'google_calendar',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date,
      });

    return NextResponse.redirect(new URL('/dashboard/settings?success=true', request.url));
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/dashboard/settings?error=oauth_failed', request.url));
  }
}
```

## Step 6: Create Database Table for Integrations

Run this SQL in Supabase:

```sql
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own integrations
CREATE POLICY "Users can manage their own integrations"
  ON user_integrations
  FOR ALL
  USING (auth.uid() = user_id);
```

## Step 7: Create Calendar Sync Function

Create `lib/google-calendar.ts`:

```typescript
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

export async function syncAppointmentToCalendar(
  userId: string,
  appointment: {
    title: string;
    scheduled_at: string;
    duration_minutes: number;
    customer_name: string;
    customer_phone: string;
  }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get user's Google Calendar tokens
  const { data: integration } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google_calendar')
    .single();

  if (!integration) {
    throw new Error('Google Calendar not connected');
  }

  // Set up OAuth client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
  });

  // Create calendar event
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const startTime = new Date(appointment.scheduled_at);
  const endTime = new Date(startTime.getTime() + appointment.duration_minutes * 60000);

  const event = {
    summary: appointment.title,
    description: `Customer: ${appointment.customer_name}\nPhone: ${appointment.customer_phone}`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'America/Toronto',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'America/Toronto',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return response.data;
}
```

## Step 8: Update Settings Page

The settings page has already been created with the UI. Now update it to use real OAuth:

```typescript
const handleConnectGoogleCalendar = async () => {
  setIsConnecting(true);
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: userId, // Pass user ID to callback
  });

  // Redirect to Google OAuth
  window.location.href = authUrl;
};
```

## Step 9: Auto-Sync on Appointment Creation

Update your appointment creation to automatically sync:

```typescript
// In your createAppointment mutation
onSuccess: async (data) => {
  queryClient.invalidateQueries({ queryKey: ['appointments'] });
  
  // Sync to Google Calendar if connected
  try {
    await fetch('/api/calendar/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: data.id }),
    });
  } catch (error) {
    console.error('Failed to sync to calendar:', error);
  }
}
```

## Testing

1. Go to Settings page
2. Click "Connect Google Calendar"
3. Authorize the app
4. Create a new appointment
5. Check your Google Calendar - the event should appear!

## Troubleshooting

- **"redirect_uri_mismatch"**: Make sure the redirect URI in Google Console matches exactly
- **"invalid_grant"**: Tokens expired, user needs to reconnect
- **"insufficient_permissions"**: Check OAuth scopes include calendar access

## Security Notes

- Never expose Client Secret in frontend code
- Store tokens securely in database
- Implement token refresh logic
- Use HTTPS in production
- Validate all user inputs

## Next Steps

- Add webhook for calendar event updates
- Implement two-way sync (Google → App)
- Add calendar selection (if user has multiple calendars)
- Handle timezone conversions properly
- Add conflict detection
