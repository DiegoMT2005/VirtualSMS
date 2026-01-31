# Supabase Connection Guide

This guide will help you connect your application to your existing Supabase database.

## ✅ Your Database is Ready!

Your Supabase database schema is already set up with all the necessary tables:
- clients
- user_profiles
- call_logs
- appointments
- customers
- sms_conversations
- faqs
- system_prompts
- voice_agents
- services
- api_settings
- And more...

## 🔌 Connection Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on "Settings" (gear icon) in the sidebar
3. Click on "API" under Project Settings
4. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 2. Configure Environment Variables

Create or update your `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Replace the values with your actual Supabase credentials!

### 3. Set Up Row Level Security (RLS) Policies

Your database has RLS enabled. You need to create policies to allow access.

#### Option A: Development/Testing (Allow All)

Run this SQL in your Supabase SQL Editor:

```sql
-- Allow all operations for authenticated users (DEVELOPMENT ONLY)
CREATE POLICY "Allow authenticated users" ON clients FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON user_profiles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON call_logs FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON appointments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON customers FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON sms_conversations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON faqs FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON system_prompts FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON voice_agents FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON services FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON api_settings FOR ALL USING (auth.uid() IS NOT NULL);
```

#### Option B: Production (Client-Based Access)

For production, use client-based policies:

```sql
-- Example: Users can only see their own client's data
CREATE POLICY "Users see own client data" ON call_logs
  FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Repeat similar policies for other tables
```

### 4. Create a Test User

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User"
3. Enter email and password
4. Click "Create User"

### 5. Create User Profile

After creating a user, you need to create their profile:

```sql
-- Replace with your actual user ID and client ID
INSERT INTO user_profiles (id, email, role, client_id)
VALUES (
  'user-uuid-from-auth-users',
  'user@example.com',
  'client_admin',
  'client-uuid-from-clients-table'
);
```

Or if you don't have a client yet:

```sql
-- First create a client
INSERT INTO clients (name, email, status)
VALUES ('My Company', 'company@example.com', 'active')
RETURNING id;

-- Then create user profile with that client_id
INSERT INTO user_profiles (id, email, role, client_id)
VALUES (
  'user-uuid-from-auth-users',
  'user@example.com',
  'client_admin',
  'client-id-from-previous-query'
);
```

### 6. Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Try to login with your test user credentials

4. If successful, you should see the dashboard!

## 🔍 Troubleshooting

### "Failed to fetch" or Connection Errors

**Check:**
- ✅ Environment variables are correct
- ✅ Supabase project is running (not paused)
- ✅ Internet connection is working
- ✅ No typos in the URL or key

**Fix:**
```bash
# Restart the dev server after changing .env.local
npm run dev
```

### "No rows returned" or Empty Data

**Check:**
- ✅ RLS policies are created
- ✅ User profile exists in `user_profiles` table
- ✅ User is authenticated

**Fix:**
Run the RLS policy SQL from Step 3 above.

### "Row Level Security Policy Violation"

**Check:**
- ✅ RLS policies exist for the table
- ✅ Policies allow the current user to access data

**Fix:**
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';

-- If no policies, create them (see Step 3)
```

### User Can't Login

**Check:**
- ✅ User exists in Authentication > Users
- ✅ Email is confirmed (or email confirmation is disabled)
- ✅ User profile exists in `user_profiles` table

**Fix:**
1. Go to Authentication > Users
2. Click on the user
3. Click "Confirm Email" if needed
4. Ensure user_profile record exists

## 📊 Verify Data Access

Test that you can query your tables:

```sql
-- Check if you have clients
SELECT * FROM clients LIMIT 5;

-- Check if you have user profiles
SELECT * FROM user_profiles LIMIT 5;

-- Check if you have call logs
SELECT * FROM call_logs LIMIT 5;
```

## 🎯 Next Steps

Once connected:

1. **Add Sample Data** (optional):
   ```sql
   -- Add a sample FAQ
   INSERT INTO faqs (client_id, category, question, answer, is_active)
   VALUES (
     'your-client-id',
     'General',
     'What are your hours?',
     'We are open Monday-Friday, 9 AM - 5 PM',
     true
   );
   
   -- Add a sample system prompt
   INSERT INTO system_prompts (
     client_id,
     company_name,
     system_prompt,
     prompt_type,
     is_active
   )
   VALUES (
     'your-client-id',
     'My Company',
     'You are a helpful AI assistant for My Company.',
     'voice',
     true
   );
   ```

2. **Configure API Settings**:
   - Go to `/dashboard/api-settings`
   - Add your VAPI and Twilio credentials

3. **Explore the Dashboard**:
   - View call logs
   - Manage appointments
   - Check analytics
   - Configure voice agents

## 🔐 Security Best Practices

### For Development
- ✅ Use "Allow authenticated users" policies
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Don't commit credentials to Git

### For Production
- ✅ Implement proper RLS policies
- ✅ Use client-based access control
- ✅ Enable email confirmation
- ✅ Set up proper user roles
- ✅ Regular security audits
- ✅ Monitor access logs

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## 🆘 Still Having Issues?

1. Check Supabase logs: Dashboard > Logs
2. Check browser console for errors
3. Check Network tab in DevTools
4. Verify environment variables are loaded
5. Try creating a new user and profile

## ✅ Connection Checklist

- [ ] Supabase credentials added to `.env.local`
- [ ] Development server restarted
- [ ] RLS policies created
- [ ] Test user created in Authentication
- [ ] User profile created in `user_profiles` table
- [ ] Client record exists in `clients` table
- [ ] Can login successfully
- [ ] Dashboard loads without errors
- [ ] Can view data in tables

Once all items are checked, you're ready to use the application! 🎉
