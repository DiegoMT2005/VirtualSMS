# 🚀 Quick Test - Tool Database Queries

## Step 1: Check Environment Variables ✅

Open your `.env.local` file and verify you have:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEFAULT_CLIENT_ID=your-client-id
```

**Don't have these?** 
- Get them from your Supabase project dashboard
- Settings → API → Project URL and service_role key

---

## Step 2: Run Automated Test 🧪

```bash
npx tsx test-tools.ts
```

**Expected Output:**
```
✅ Loaded .env.local
📋 Test 1: check_client
   ✅ Customer found OR ℹ️ Customer not found (OK)
📋 Test 2: check_services
   ✅ Found 3 services OR ⚠️ No services (will use defaults)
📋 Test 3: get_availability
   ✅ Found slots OR ⚠️ No slots (will use defaults)
...
✅ All tool database queries are working!
```

---

## Step 3: Manual Database Check (If Test Fails) 🔍

### Option A: Via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor" in sidebar
4. Check these tables exist:
   - ✅ customers
   - ✅ services
   - ✅ service_areas
   - ✅ availability_slots
   - ✅ appointments
   - ✅ sms_conversations
   - ✅ sms_messages

### Option B: Via SQL Editor

1. Go to "SQL Editor" in Supabase
2. Run this query:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected:** Should see all 7 tables listed

---

## Step 4: Add Sample Data (If Tables Are Empty) 📝

### Add Services:

```sql
INSERT INTO services (client_id, service_type, service_name, base_price, price_per_load, turnaround_hours, is_active)
VALUES 
  ('your-client-id', 'regular', 'Regular Service', 15, 8, 48, true),
  ('your-client-id', 'express', 'Express Service', 20, 12, 24, true),
  ('your-client-id', 'premium', 'Premium Service', 30, 18, 8, true);
```

### Add Service Areas:

```sql
INSERT INTO service_areas (client_id, city, province, postal_code_prefix, is_active)
VALUES 
  ('your-client-id', 'Toronto', 'ON', 'M4', true),
  ('your-client-id', 'Toronto', 'ON', 'M5', true),
  ('your-client-id', 'Mississauga', 'ON', 'L5', true),
  ('your-client-id', 'Vancouver', 'BC', 'V6', true);
```

### Add Availability Slots (Optional):

```sql
INSERT INTO availability_slots (client_id, slot_date, slot_time, is_available)
VALUES 
  ('your-client-id', '2025-12-22', '09:00', true),
  ('your-client-id', '2025-12-22', '11:00', true),
  ('your-client-id', '2025-12-22', '14:00', true),
  ('your-client-id', '2025-12-22', '16:00', true);
```

**Note:** Replace `'your-client-id'` with your actual DEFAULT_CLIENT_ID

---

## Step 5: Test Via SMS (Real Test) 📱

### Setup:
1. Make sure your Twilio webhook is configured
2. Point it to: `https://your-domain.com/api/webhooks/twilio/sms`
3. Send SMS to your Twilio number

### Test Conversation:

```
You: Hi
Bot: Hey! 👋 Need a laundry pickup?

You: Yes
Bot: What's your address?

You: 123 Main St, Toronto M5V 2T6
Bot: Perfect! We serve that area. We have Regular (48hr), Express (24hr), or Premium (same-day). Which works best?

You: Express
Bot: Got it! How many loads?

You: 2
Bot: Perfect - 2 loads of Express. When would you like pickup?

You: Tomorrow at 2pm
Bot: Awesome! So that's 2 loads of Express on Dec 22 at 2pm for $44. Sound good?

You: Yes
Bot: All set! ✅ Pickup confirmed for Dec 22 at 2pm.
```

### What to Check:
- ✅ Bot responds naturally (not robotic)
- ✅ Validates address correctly
- ✅ Shows real service options
- ✅ Shows available time slots
- ✅ Creates booking in database
- ✅ No made-up information

---

## 🐛 Common Issues

### Issue 1: "supabaseUrl is required"
**Solution:** Add NEXT_PUBLIC_SUPABASE_URL to .env.local

### Issue 2: "No services found"
**Solution:** Add services using SQL above (or tool will use defaults)

### Issue 3: "Table does not exist"
**Solution:** Run database migrations from DATABASE_SCHEMA.md

### Issue 4: Bot doesn't respond
**Solution:** 
- Check Twilio webhook is configured
- Check logs: `npm run dev` and watch console
- Verify environment variables are loaded

### Issue 5: Bot sounds robotic
**Solution:** This is fixed in the code! Just needs testing to verify.

---

## ✅ Success Checklist

- [ ] Environment variables configured
- [ ] Test script runs without errors
- [ ] All 7 tools query database successfully
- [ ] Services table has data (or using defaults)
- [ ] Service areas table has data
- [ ] SMS test completes full booking
- [ ] Bot sounds natural (not robotic)
- [ ] No hallucinations (only uses tool data)
- [ ] State persists across messages

---

## 📊 Quick Status Check

Run this to see what's working:

```bash
# Test database queries
npx tsx test-tools.ts

# Check for errors
echo $?
# 0 = success, 1 = errors
```

---

## 🎯 What You're Testing

### Tool Database Queries:
1. **check_client** - Can query customers table
2. **check_services** - Can query services table
3. **get_availability** - Can query availability_slots table
4. **update_address** - Can query service_areas table
5. **create_booking** - Can insert into appointments table
6. **create_new_client** - Can insert into customers table
7. **update_appointment** - Can update appointments table

### Expected Results:
- All queries run without errors ✅
- Tables are accessible ✅
- Data is returned (or defaults used) ✅
- No permission errors ✅

---

## 🚀 Next Steps After Testing

Once tools work:

1. **Test conversation quality** - Does it sound human?
2. **Test edge cases** - Invalid addresses, outside hours
3. **Test FAQ handling** - Ask questions mid-booking
4. **Test state persistence** - Stop and resume conversation
5. **Run 50+ test conversations** - Various scenarios

---

## 💡 Pro Tips

### Tip 1: Use Supabase Logs
- Go to Supabase Dashboard → Logs
- See all database queries in real-time
- Helps debug issues

### Tip 2: Test Incrementally
- Test one tool at a time
- Fix issues before moving to next
- Don't test everything at once

### Tip 3: Check Console Logs
- Run `npm run dev` in terminal
- Watch for tool execution logs
- Look for "🔧 AI calling tool: ..."

### Tip 4: Use Test Phone Number
- Don't use real customer numbers
- Use +15551234567 or similar
- Easy to identify test data

---

**Ready? Start with:** `npx tsx test-tools.ts` 🚀

**Need help?** Check TESTING_GUIDE.md for detailed instructions.
