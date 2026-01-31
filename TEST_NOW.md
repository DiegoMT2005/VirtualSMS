# 🚀 Test Tool Database Queries - RIGHT NOW!

## ✅ Easiest Way to Test (No Setup Needed!)

### Step 1: Start Dev Server

```bash
npm run dev
```

### Step 2: Open Browser

Go to: **http://localhost:3000/api/test-tools**

### Step 3: Check Results

You'll see JSON output like this:

```json
{
  "timestamp": "2025-12-21T...",
  "clientId": "your-client-id",
  "tests": {
    "check_client": {
      "status": "PASS",
      "message": "No customers yet (OK)"
    },
    "check_services": {
      "status": "PASS",
      "message": "Found 3 services",
      "data": [
        { "name": "Regular Service", "price": 15 },
        { "name": "Express Service", "price": 20 },
        { "name": "Premium Service", "price": 30 }
      ]
    },
    ...
  },
  "summary": {
    "total": 7,
    "passed": 7,
    "failed": 0,
    "score": 100
  },
  "recommendations": []
}
```

---

## 📊 Understanding Results

### ✅ PASS - Tool Works!
```json
{
  "status": "PASS",
  "message": "Found 3 services"
}
```
**Meaning:** Tool can query database successfully ✅

### ⚠️ PASS with Warning
```json
{
  "status": "PASS",
  "message": "No services (will use defaults)"
}
```
**Meaning:** Tool works but table is empty (will use defaults) ⚠️

### ❌ FAIL - Error
```json
{
  "status": "FAIL",
  "error": "relation 'services' does not exist"
}
```
**Meaning:** Table is missing, need to run migrations ❌

---

## 🎯 What You're Looking For

### Perfect Score (100%):
```json
{
  "summary": {
    "total": 7,
    "passed": 7,
    "failed": 0,
    "score": 100
  }
}
```
**Status:** ✅ All tools working! Ready for SMS testing.

### Good Score (70-99%):
```json
{
  "summary": {
    "passed": 5,
    "failed": 2,
    "score": 71
  },
  "recommendations": [
    "Add services to database",
    "Add service areas"
  ]
}
```
**Status:** ⚠️ Most tools work, need to add some data.

### Poor Score (<70%):
```json
{
  "summary": {
    "passed": 2,
    "failed": 5,
    "score": 29
  }
}
```
**Status:** ❌ Database issues, check migrations and environment variables.

---

## 🔧 Quick Fixes

### If You See "No services"

**Add services to database:**

1. Go to Supabase Dashboard → SQL Editor
2. Run this:

```sql
INSERT INTO services (client_id, service_type, service_name, base_price, price_per_load, turnaround_hours, is_active)
VALUES 
  ('your-client-id', 'regular', 'Regular Service', 15, 8, 48, true),
  ('your-client-id', 'express', 'Express Service', 20, 12, 24, true),
  ('your-client-id', 'premium', 'Premium Service', 30, 18, 8, true);
```

Replace `'your-client-id'` with your DEFAULT_CLIENT_ID from .env.local

### If You See "No service areas"

**Add service areas:**

```sql
INSERT INTO service_areas (client_id, city, province, postal_code_prefix, is_active)
VALUES 
  ('your-client-id', 'Toronto', 'ON', 'M4', true),
  ('your-client-id', 'Toronto', 'ON', 'M5', true),
  ('your-client-id', 'Mississauga', 'ON', 'L5', true),
  ('your-client-id', 'Vancouver', 'BC', 'V6', true);
```

### If You See "Table does not exist"

**Run database migrations:**

1. Go to DATABASE_SCHEMA.md
2. Copy all SQL
3. Run in Supabase SQL Editor

---

## 🎨 Pretty View (Optional)

Want a nicer view? Install a JSON formatter browser extension:

- Chrome: "JSON Formatter"
- Firefox: "JSONView"

Then refresh http://localhost:3000/api/test-tools

---

## 📱 Alternative: Test via curl

```bash
# Start dev server first: npm run dev

# Then in another terminal:
curl http://localhost:3000/api/test-tools | json_pp
```

---

## ✅ Success Checklist

- [ ] Dev server running (`npm run dev`)
- [ ] Opened http://localhost:3000/api/test-tools
- [ ] See JSON results
- [ ] Score is 70%+ (5+ tools passing)
- [ ] No critical errors
- [ ] Recommendations followed (if any)

---

## 🚀 Next Steps

### If Score is 100%:
✅ **Perfect!** All tools working.  
**Next:** Test via SMS (send message to your Twilio number)

### If Score is 70-99%:
⚠️ **Good!** Most tools work.  
**Next:** Follow recommendations, then test via SMS

### If Score is <70%:
❌ **Issues found.**  
**Next:** Fix database issues, check environment variables

---

## 💡 Pro Tips

### Tip 1: Refresh to Re-test
After making changes, just refresh the browser to re-run tests.

### Tip 2: Check Console
Look at terminal where `npm run dev` is running for detailed logs.

### Tip 3: Use Supabase Dashboard
Visual way to see your data and verify changes.

### Tip 4: Test Incrementally
Fix one issue at a time, refresh, check if it's fixed.

---

## 🎯 What Each Test Checks

1. **check_client** - Can query customers table
2. **check_services** - Can query services table (needs data!)
3. **get_availability** - Can query availability_slots table
4. **update_address** - Can query service_areas table (needs data!)
5. **create_booking** - Can access appointments table
6. **create_new_client** - Can access customers table
7. **update_appointment** - Can update appointments table

---

## 📞 Quick Reference

| Action | Command |
|--------|---------|
| Start server | `npm run dev` |
| Test tools | Open http://localhost:3000/api/test-tools |
| Add data | Supabase SQL Editor |
| Check logs | Terminal where dev server runs |
| Re-test | Refresh browser |

---

**Ready? Start here:**

1. Run: `npm run dev`
2. Open: http://localhost:3000/api/test-tools
3. Check: Score should be 70%+

**That's it!** 🎉

---

## 🐛 Troubleshooting

### "Cannot connect to server"
**Solution:** Make sure `npm run dev` is running

### "Environment variable not found"
**Solution:** Check .env.local exists and has correct values

### "All tests fail"
**Solution:** Check SUPABASE_SERVICE_ROLE_KEY is correct (not anon key)

### "Score is 0%"
**Solution:** Database might be empty or migrations not run

---

**Start testing now:** `npm run dev` then open http://localhost:3000/api/test-tools 🚀
