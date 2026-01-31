# 🧪 How to Test Tool Database Queries

## TL;DR - Quick Answer

**To test tool database queries, you have 3 options:**

### Option 1: Automated Test (Easiest) ⚡
```bash
npx tsx test-tools.ts
```
This tests all 7 tools automatically and shows you what works/doesn't work.

### Option 2: Manual SQL Queries 🔍
Open Supabase SQL Editor and run queries from TESTING_GUIDE.md

### Option 3: Real SMS Test 📱
Send SMS messages to your Twilio number and verify bookings work end-to-end

---

## 📋 What You're Testing

The 7 tools that need database access:

1. ✅ **check_client** - Query customers table
2. ✅ **check_services** - Query services table  
3. ✅ **get_availability** - Query availability_slots table
4. ✅ **update_address** - Query service_areas table
5. ✅ **create_booking** - Insert into appointments table
6. ✅ **create_new_client** - Insert into customers table
7. ✅ **update_appointment** - Update appointments table

---

## 🚀 Step-by-Step Testing

### Step 1: Check Prerequisites

**Do you have .env.local?**
```bash
# Check if file exists
ls .env.local

# If not, create it:
# Copy .env.example to .env.local
# Add your Supabase credentials
```

**Required variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
DEFAULT_CLIENT_ID=your-client-id
```

### Step 2: Run Automated Test

```bash
npx tsx test-tools.ts
```

**What it does:**
- ✅ Checks all 7 tools
- ✅ Tests database connections
- ✅ Shows what data is missing
- ✅ Gives recommendations

**Expected output:**
```
✅ Loaded .env.local
📋 Test 1: check_client
   ✅ Customer found
📋 Test 2: check_services
   ✅ Found 3 services
...
✅ All tool database queries are working!
```

### Step 3: Fix Any Issues

**If test shows missing data:**

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run SQL from QUICK_TEST.md to add sample data
4. Re-run test

**If test shows errors:**

1. Check environment variables
2. Verify Supabase project is active
3. Check service_role key has permissions
4. Review error messages

### Step 4: Test Via SMS

**Send test messages:**
```
You: Hi
Bot: Hey! 👋 Need a laundry pickup?

You: Yes, 123 Main St Toronto M5V 2T6
Bot: Perfect! We serve that area...
```

**Check:**
- ✅ Bot responds
- ✅ Uses real data from database
- ✅ Creates booking
- ✅ No errors in console

---

## 📊 Understanding Test Results

### ✅ PASS - Tool Works
```
✅ check_client
   Customer found: John Doe
   Phone: +15551234567
```
**Meaning:** Tool can query database successfully

### ⚠️ WARNING - Missing Data
```
⚠️ check_services
   No services found
   Using default services
```
**Meaning:** Tool works but table is empty (will use defaults)

### ❌ FAIL - Error
```
❌ check_client
   Error: relation "customers" does not exist
```
**Meaning:** Table is missing, need to run migrations

---

## 🔧 Common Fixes

### Fix 1: Missing Tables
**Problem:** "relation does not exist"  
**Solution:** Run DATABASE_SCHEMA.md migrations in Supabase

### Fix 2: Empty Tables
**Problem:** "No services found"  
**Solution:** Add sample data using SQL from QUICK_TEST.md

### Fix 3: Permission Denied
**Problem:** "permission denied for table"  
**Solution:** Use SUPABASE_SERVICE_ROLE_KEY (not anon key)

### Fix 4: Connection Error
**Problem:** "Failed to connect"  
**Solution:** Check NEXT_PUBLIC_SUPABASE_URL is correct

---

## 📁 Testing Files Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| **test-tools.ts** | Automated test script | Run first to check all tools |
| **TESTING_GUIDE.md** | Detailed testing guide | When you need step-by-step help |
| **QUICK_TEST.md** | Quick reference | When you need fast answers |
| **HOW_TO_TEST.md** | This file | Overview and quick start |

---

## 🎯 Success Criteria

You're done testing when:

1. ✅ `npx tsx test-tools.ts` shows all tools working
2. ✅ No database errors
3. ✅ SMS test completes full booking
4. ✅ Booking appears in database
5. ✅ Bot uses real data (not made up)

---

## 💡 Quick Tips

### Tip 1: Test One at a Time
Don't try to fix everything at once. Test each tool individually.

### Tip 2: Check Logs
Run `npm run dev` and watch console for tool execution logs.

### Tip 3: Use Supabase Dashboard
Visual way to see your data and run queries.

### Tip 4: Start Simple
Test with automated script first, then move to SMS testing.

---

## 🚀 What to Do Next

### After Tools Work:
1. Test conversation quality (sounds human?)
2. Test edge cases (invalid inputs)
3. Test FAQ handling (interruptions)
4. Run 50+ test conversations
5. Deploy to production

### If Tools Don't Work:
1. Check error messages
2. Review TESTING_GUIDE.md
3. Fix database schema
4. Add sample data
5. Re-run tests

---

## 📞 Quick Commands

```bash
# Run automated test
npx tsx test-tools.ts

# Start dev server (to test via SMS)
npm run dev

# Check environment variables
cat .env.local

# Run audit to see progress
npx tsx audit-requirements.ts
```

---

## ✅ Checklist

Before moving forward:

- [ ] Environment variables configured
- [ ] Automated test runs successfully
- [ ] All 7 tools query database
- [ ] Sample data added to tables
- [ ] SMS test completes booking
- [ ] No errors in console
- [ ] Booking appears in database

---

**Start here:** `npx tsx test-tools.ts`

**Need help?** Read TESTING_GUIDE.md

**Quick reference?** Check QUICK_TEST.md

**Ready to test!** 🚀
