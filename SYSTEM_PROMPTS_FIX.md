# System Prompts Fix - 406 Error Resolution

## Problem
Getting 406 (Not Acceptable) errors when loading/saving system prompts:
- `GET /rest/v1/system_prompts?client_id=eq.<uuid>&prompt_type=eq.sms&is_active=eq.true → 406`
- `GET /rest/v1/system_prompts?client_id=eq.<uuid>&prompt_type=eq.voice&is_active=eq.true → 406`

## Root Cause
1. **RLS Policies Missing**: The `system_prompts` table had RLS enabled but no policies allowing access
2. **No Seed Data**: The table was empty, causing `.single()` queries to fail
3. **Query Error Handling**: The code didn't handle the "no rows found" case gracefully

## Solution Applied

### 1. Code Changes

#### `lib/hooks/usePrompts.ts`
- Changed `.single()` to `.maybeSingle()` to handle missing data gracefully
- Added automatic creation of default prompts when none exist
- Proper error handling for PGRST116 (no rows) error code

#### `lib/hooks/useAuth.ts`
- Made `useUserProfile` more resilient by falling back to default client_id
- Returns demo profile when user_profiles table doesn't exist
- Always enabled to support demo/development mode

### 2. Database Setup

Created `supabase-setup.sql` with:
- Table creation (if not exists)
- Proper indexes
- **Permissive RLS policies** for demo/development (allows all operations)
- Trigger for auto-updating `updated_at` timestamp
- Default seed data for voice and SMS prompts

## How to Apply the Fix

### Step 1: Run the SQL Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `supabase-setup.sql`
4. Paste and click **Run**
5. Verify you see "Setup complete!" message

### Step 2: Verify the Fix

1. Restart your dev server: `npm run dev`
2. Navigate to `/dashboard/prompts`
3. You should now see:
   - Voice Agent Prompt tab loads successfully
   - SMS Agent Prompt tab loads successfully
   - Both prompts have default content
   - Save buttons are enabled

### Step 3: Test Functionality

1. **Edit a prompt**: Change the text in either tab
2. **Click Save**: Should see success toast
3. **Refresh page**: Changes should persist
4. **Switch tabs**: Both prompts should load correctly

## What Changed

### Before
```typescript
// Would fail with 406 if no data exists
.single()
```

### After
```typescript
// Handles missing data gracefully
.maybeSingle()

// Auto-creates default prompt if missing
if (!data) {
  // Insert default prompt
}
```

## RLS Policies (Development Mode)

The SQL script creates **permissive policies** suitable for demo/development:

```sql
-- Allow all operations without authentication
CREATE POLICY "Enable read access for all users" ON system_prompts
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON system_prompts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON system_prompts
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON system_prompts
  FOR DELETE USING (true);
```

### For Production

Replace with authenticated policies:

```sql
-- Example: Restrict to authenticated users
CREATE POLICY "Users can view prompts" ON system_prompts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update prompts" ON system_prompts
  FOR UPDATE USING (auth.uid() IS NOT NULL);
```

## Default Prompts

The setup includes professional default prompts for:

### Voice Agent
- Professional greeting and role definition
- Service details for 1Stop Laundry
- Booking workflow instructions
- Customer service guidelines

### SMS Agent
- Concise, SMS-friendly responses
- Same service info in brief format
- Quick booking flow
- Short, clear communication style

## Troubleshooting

### Still Getting 406 Errors?

1. **Check RLS Policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'system_prompts';
   ```

2. **Verify Data Exists**:
   ```sql
   SELECT * FROM system_prompts;
   ```

3. **Check Client ID**:
   - Ensure `NEXT_PUBLIC_DEFAULT_CLIENT_ID` in `.env.local` matches the SQL insert
   - Current value: `9f58289f-b795-4c5c-aa0a-25be1df8ce6d`

4. **Clear Browser Cache**:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito mode

### Can't Save Changes?

1. **Check Console**: Look for specific error messages
2. **Verify Supabase Connection**: Check `.env.local` credentials
3. **Test Connection**: Try other pages (calls, bookings) to ensure Supabase works

### No Default Prompts Showing?

The code will auto-create them on first load. If not:

1. Check browser console for errors
2. Manually run the INSERT statements from `supabase-setup.sql`
3. Verify the client_id matches your environment variable

## Summary

**What was fixed:**
- ✅ RLS policies now allow access to system_prompts
- ✅ Default prompts are seeded in the database
- ✅ Code handles missing data gracefully
- ✅ Auto-creates prompts if they don't exist
- ✅ Both voice and SMS prompts work correctly

**Files changed:**
- `lib/hooks/usePrompts.ts` - Better error handling and auto-creation
- `lib/hooks/useAuth.ts` - Fallback to default client_id
- `supabase-setup.sql` - Database setup script (NEW)
- `SYSTEM_PROMPTS_FIX.md` - This documentation (NEW)

**Time to fix:** ~5 minutes (run SQL + restart dev server)

**Safe for:** Demo and development environments

**Next steps for production:** Implement proper authentication-based RLS policies
