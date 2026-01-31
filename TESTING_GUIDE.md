# 🧪 Testing Guide - Tool Database Queries

This guide walks you through testing all 7 tools to verify they work with your database.

---

## 🚀 Quick Start

### Option 1: Automated Test Script (Recommended)

```bash
# Run the automated test script
npx tsx test-tools.ts
```

This will test all 7 tools and show you:
- ✅ Which tools work
- ❌ Which tools have issues
- ⚠️ What data is missing
- 📋 Recommendations for setup

### Option 2: Manual Testing (Step-by-step)

Follow the sections below to test each tool individually.

---

## 📋 Prerequisites

### 1. Check Environment Variables

Make sure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DEFAULT_CLIENT_ID=your_client_id
```

### 2. Check Database Tables

Required tables:
- ✅ customers
- ✅ services
- ✅ service_areas
- ✅ availability_slots
- ✅ appointments
- ✅ sms_conversations
- ✅ sms_messages

---

## 🔧 Testing Each Tool

### Tool 1: check_client

**Purpose:** Verify if customer exists by phone number

**Test Query:**
```sql
SELECT * FROM customers 
WHERE client_id = 'your-client-id' 
AND phone = '+15551234567';
```

**Expected Results:**
- If customer exists: Returns customer data
- If new customer: Returns empty (this is OK)

**Test via Code:**
```typescript
const { data } = await supabase
  .from('customers')
  .select('*')
  .eq('client_id', clientId)
  .eq('phone', '+15551234567')
  .single();

console.log('Customer:', data);
```

**Success Criteria:**
- ✅ Query runs without errors
- ✅ Returns data if customer exists
- ✅ Returns null if customer doesn't exist

---

### Tool 2: check_services

**Purpose:** Get available service tiers and pricing

**Test Query:**
```sql
SELECT * FROM services 
WHERE client_id = 'your-client-id' 
AND is_active = true;
```

**Expected Results:**
- Returns list of services (Regular, Express, Premium)
- Each service has: name, base_price, price_per_load

**Setup if Empty:**
```sql
INSERT INTO services (client_id, service_type, service_name, base_price, price_per_load, is_active)
VALUES 
  ('your-client-id', 'regular', 'Regular Service', 15, 8, true),
  ('your-client-id', 'express', 'Express Service', 20, 12, true),
  ('your-client-id', 'premium', 'Premium Service', 30, 18, true);
```

**Test via Code:**
```typescript
const { data: services } = await supabase
  .from('services')
  .select('*')
  .eq('client_id', clientId)
  .eq('is_active', true);

console.log('Services:', services);
```

**Success Criteria:**
- ✅ Query runs without errors
- ✅ Returns at least 1 service
- ✅ Each service has pricing info

---

### Tool 3: get_availability

**Purpose:** Get available time slots for a date

**Test Query:**
```sql
SELECT * FROM availability_slots 
WHERE client_id = 'your-client-id' 
AND slot_date = '2025-12-22'
AND is_available = true
ORDER BY slot_time;
```

**Expected Results:**
- Returns list of available time slots
- Each slot has: time, date, availability

**Setup if Empty:**
```sql
INSERT INTO availability_slots (client_id, slot_date, slot_time, is_available)
VALUES 
  ('your-client-id', '2025-12-22', '09:00', true),
  ('your-client-id', '2025-12-22', '11:00', true),
  ('your-client-id', '2025-12-22', '14:00', true),
  ('your-client-id', '2025-12-22', '16:00', true);
```

**Test via Code:**
```typescript
const { data: slots } = await supabase
  .from('availability_slots')
  .select('*')
  .eq('client_id', clientId)
  .eq('slot_date', '2025-12-22')
  .eq('is_available', true);

console.log('Available slots:', slots);
```

**Success Criteria:**
- ✅ Query runs without errors
- ✅ Returns time slots (or uses defaults)
- ✅ Slots are properly formatted

---

### Tool 4: update_address

**Purpose:** Validate address is in service area

**Test Query:**
```sql
SELECT * FROM service_areas 
WHERE client_id = 'your-client-id' 
AND is_active = true;
```

**Expected Results:**
- Returns list of service areas
- Each area has: city, province, postal_code_prefix

**Setup if Empty:**
```sql
INSERT INTO service_areas (client_id, city, province, postal_code_prefix, is_active)
VALUES 
  ('your-client-id', 'Toronto', 'ON', 'M4', true),
  ('your-client-id', 'Toronto', 'ON', 'M5', true),
  ('your-client-id', 'Mississauga', 'ON', 'L5', true),
  ('your-client-id', 'Vancouver', 'BC', 'V6', true);
```

**Test Addresses:**
- ✅ "123 Main St, Toronto M5V 2T6" (should work)
- ✅ "456 Oak Ave, Vancouver V6B 1A1" (should work)
- ❌ "789 Pine Rd, Calgary T2P 1J9" (should fail)

**Test via Code:**
```typescript
const address = "123 Main St, Toronto M5V 2T6";
const postalMatch = address.match(/[A-Z]\d[A-Z]/i);
const prefix = postalMatch?.[0]?.substring(0, 3);

const { data: areas } = await supabase
  .from('service_areas')
  .select('*')
  .eq('client_id', clientId)
  .eq('is_active', true);

const inArea = areas?.some(area => 
  prefix?.startsWith(area.postal_code_prefix)
);

console.log('Address valid:', inArea);
```

**Success Criteria:**
- ✅ Query runs without errors
- ✅ Correctly identifies valid addresses
- ✅ Rejects invalid addresses

---

### Tool 5: create_booking

**Purpose:** Create a confirmed booking

**Test Query:**
```sql
-- Check if we can insert into appointments
SELECT * FROM appointments 
WHERE client_id = 'your-client-id' 
LIMIT 1;
```

**Expected Results:**
- Table is accessible
- Can insert new appointments

**Test via Code:**
```typescript
// This will be tested via actual SMS conversation
// For now, just verify table access
const { data } = await supabase
  .from('appointments')
  .select('*')
  .eq('client_id', clientId)
  .limit(1);

console.log('Appointments table accessible:', !!data);
```

**Success Criteria:**
- ✅ Table exists and is accessible
- ✅ Can query appointments
- ✅ Ready to insert bookings

---

### Tool 6: create_new_client

**Purpose:** Add new customer to system

**Test Query:**
```sql
-- Check if we can insert into customers
SELECT * FROM customers 
WHERE client_id = 'your-client-id' 
LIMIT 1;
```

**Expected Results:**
- Table is accessible
- Can insert new customers

**Test via Code:**
```typescript
// This will be tested via actual SMS conversation
// For now, just verify table access
const { data } = await supabase
  .from('customers')
  .select('*')
  .eq('client_id', clientId)
  .limit(1);

console.log('Customers table accessible:', !!data);
```

**Success Criteria:**
- ✅ Table exists and is accessible
- ✅ Can query customers
- ✅ Ready to insert new customers

---

### Tool 7: update_appointment

**Purpose:** Modify existing booking

**Test Query:**
```sql
-- Check if we can update appointments
SELECT * FROM appointments 
WHERE client_id = 'your-client-id' 
LIMIT 1;
```

**Expected Results:**
- Table is accessible
- Can update appointments

**Test via Code:**
```typescript
// This will be tested via actual SMS conversation
// For now, just verify table access
const { data } = await supabase
  .from('appointments')
  .select('*')
  .eq('client_id', clientId)
  .limit(1);

console.log('Can update appointments:', !!data);
```

**Success Criteria:**
- ✅ Table exists and is accessible
- ✅ Can query appointments
- ✅ Ready to update bookings

---

## 🧪 End-to-End Testing via SMS

After verifying database queries work, test the full flow via SMS:

### Test Scenario 1: New Customer Booking

```
Customer: Hi
Bot: Hey! 👋 Need a laundry pickup?

Customer: Yes
Bot: What's your address?

Customer: 123 Main St, Toronto M5V 2T6
Bot: Perfect! We serve that area. We have Regular (48hr), Express (24hr), or Premium (same-day). Which works best?

Customer: Express, 2 loads
Bot: Got it - 2 loads of Express service. When would you like pickup? We have 9am, 11am, 2pm, or 4pm

Customer: 2pm tomorrow
Bot: Perfect! So that's 2 loads of Express on Dec 22 at 2pm for $44. Sound good?

Customer: Yes
Bot: All set! ✅ Pickup confirmed for Dec 22 at 2pm. We'll text you 30 min before arrival!
```

**Verify:**
- ✅ check_client called (customer not found)
- ✅ update_address called (address validated)
- ✅ check_services called (got pricing)
- ✅ get_availability called (got time slots)
- ✅ create_new_client called (customer created)
- ✅ create_booking called (booking created)

### Test Scenario 2: Returning Customer

```
Customer: Hi
Bot: Hey John! 👋 Need another pickup?

Customer: Yes, same address
Bot: Perfect! We have Regular (48hr), Express (24hr), or Premium (same-day). Which works best?
```

**Verify:**
- ✅ check_client called (customer found)
- ✅ Uses existing customer data
- ✅ Skips address collection

### Test Scenario 3: FAQ Interruption

```
Customer: Hi
Bot: Hey! 👋 Need a laundry pickup?

Customer: How much is express?
Bot: Express is $20 base + $12 per load, done in 24hrs ⚡ So, need a pickup?

Customer: Yes, 123 Main St
Bot: Perfect! We serve that area...
```

**Verify:**
- ✅ Answers question
- ✅ Returns to booking flow
- ✅ Doesn't lose context

---

## 📊 Test Results Checklist

### Database Queries:
- [ ] check_client - Works
- [ ] check_services - Works
- [ ] get_availability - Works
- [ ] update_address - Works
- [ ] create_booking - Works
- [ ] create_new_client - Works
- [ ] update_appointment - Works

### Database Setup:
- [ ] services table has data
- [ ] service_areas table has data
- [ ] availability_slots table has data (or using defaults)
- [ ] All tables accessible

### End-to-End:
- [ ] New customer booking works
- [ ] Returning customer works
- [ ] FAQ interruption works
- [ ] State persists across messages
- [ ] No hallucinations
- [ ] Natural conversation tone

---

## 🐛 Troubleshooting

### Error: "relation does not exist"
**Problem:** Table is missing  
**Solution:** Run database migrations from DATABASE_SCHEMA.md

### Error: "permission denied"
**Problem:** Wrong API key  
**Solution:** Use SUPABASE_SERVICE_ROLE_KEY, not anon key

### Error: "No rows returned"
**Problem:** Missing data  
**Solution:** Add sample data using SQL inserts above

### Tool returns empty results
**Problem:** No data in table  
**Solution:** Either add data or tool will use defaults

---

## 🚀 Quick Commands

### Run automated tests:
```bash
npx tsx test-tools.ts
```

### Check database schema:
```bash
# In Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Add sample data:
```bash
# Copy SQL from sections above
# Run in Supabase SQL Editor
```

### Test via SMS:
```bash
# Send SMS to your Twilio number
# Check logs in terminal or Supabase
```

---

## ✅ Success Criteria

You're ready to move forward when:

1. ✅ All 7 tools query database without errors
2. ✅ Required tables have sample data
3. ✅ End-to-end SMS test completes booking
4. ✅ No hallucinations in responses
5. ✅ State persists across messages

---

## 📞 Next Steps

After tools are tested:

1. **Run 10+ test conversations** - Various scenarios
2. **Test edge cases** - Invalid addresses, outside hours, etc.
3. **Verify conversation quality** - Sounds human?
4. **Check for hallucinations** - Only uses tool data?
5. **Test FAQ handling** - Returns to correct state?

---

**Ready to test? Run:** `npx tsx test-tools.ts` 🚀
