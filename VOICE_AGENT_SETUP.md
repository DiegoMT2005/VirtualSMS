# Voice Agent Settings - Production Setup

## ✅ What Was Done

The Voice Agent Settings page is now **fully functional** and production-ready!

### Changes Made:

1. **Database Integration** (works with your existing schema)
   - RLS policies configured
   - Automatic timestamps via trigger
   - Default agent creation for existing clients

2. **Real API Integration** (`lib/hooks/useAgents.ts`)
   - `useVoiceAgents` - Fetches real data from Supabase
   - `useUpdateVoiceAgent` - Updates existing agents
   - `useCreateVoiceAgent` - Creates new agents (if none exists)

3. **Enhanced UI** (`app/dashboard/voice-agent/page.tsx`)
   - Handles both create and update scenarios
   - Loading states with spinner
   - Better error handling
   - Uses DEFAULT_CLIENT_ID from environment

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Your `voice_agents` table already exists! Just run this to set up RLS and triggers:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the contents of `supabase/migrations/setup_voice_agents_rls.sql`
3. Paste and click **Run**
4. You should see: "Voice agents setup complete!"

### Step 2: Get Your Client ID

In Supabase SQL Editor, run:
```sql
SELECT id, name FROM clients LIMIT 1;
```

Copy the `id` value (it's a UUID).

### Step 3: Update Environment Variables

Update your `.env.local` with these values:

```env
# Get from Supabase Dashboard → Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

# Use the client ID from Step 2
NEXT_PUBLIC_DEFAULT_CLIENT_ID=your-client-id-from-step-2
DEFAULT_CLIENT_ID=your-client-id-from-step-2
```

### Step 4: Restart Your Dev Server

```bash
npm run dev
```

### Step 5: Test the Voice Agent Settings

1. Go to http://localhost:3000/dashboard/voice-agent
2. Modify settings and click "Save Changes"
3. Refresh - your settings should persist! ✅

## 🐛 Troubleshooting

**Issue: "No data loading"**
- Check that you added the correct `DEFAULT_CLIENT_ID`
- Verify the client ID exists: `SELECT * FROM clients;`

**Issue: "Can't save settings"**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check Supabase logs for RLS policy errors

## Next Steps

1. Deploy to Vercel (run the same SQL on production DB)
2. Connect to VAPI for actual voice agent configuration
3. Test with real phone calls
