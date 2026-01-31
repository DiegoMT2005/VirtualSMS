# Database Schema

Complete database schema for the Voice AI & SMS Booking Management Platform.

## Overview

The application uses PostgreSQL (via Supabase) with the following tables:
- calls
- bookings
- sms_messages
- customers
- analytics
- faqs
- system_prompts

## Tables

### calls

Stores call records and transcripts.

```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  phone_number TEXT NOT NULL,
  customer_name TEXT,
  duration INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('completed', 'failed', 'no-answer', 'busy', 'in-progress')),
  call_type TEXT CHECK (call_type IN ('inbound', 'outbound')),
  recording_url TEXT,
  transcript TEXT,
  cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  booking_id UUID REFERENCES bookings(id)
);

CREATE INDEX idx_calls_phone ON calls(phone_number);
CREATE INDEX idx_calls_status ON calls(status);
CREATE INDEX idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX idx_calls_booking_id ON calls(booking_id);
```

**Fields:**
- `id`: Unique identifier
- `created_at`: Timestamp when record was created
- `updated_at`: Timestamp when record was last updated
- `phone_number`: Customer phone number
- `customer_name`: Customer name (optional)
- `duration`: Call duration in seconds
- `status`: Call status (completed, failed, no-answer, busy, in-progress)
- `call_type`: Type of call (inbound, outbound)
- `recording_url`: URL to call recording
- `transcript`: Call transcript text
- `cost`: Cost of the call in dollars
- `notes`: Additional notes
- `sentiment`: Sentiment analysis result (positive, neutral, negative)
- `booking_id`: Reference to related booking

### bookings

Stores appointment bookings.

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  service_type TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'scheduled')),
  source TEXT CHECK (source IN ('voice', 'sms', 'manual')),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  confirmation_sent BOOLEAN DEFAULT false,
  title TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  pickup_address TEXT,
  payment_amount DECIMAL(10,2),
  payment_currency TEXT DEFAULT 'USD',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')),
  number_of_loads INTEGER
);

CREATE INDEX idx_bookings_phone ON bookings(customer_phone);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(appointment_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
```

**Fields:**
- `id`: Unique identifier
- `created_at`: Timestamp when record was created
- `updated_at`: Timestamp when record was last updated
- `customer_name`: Customer full name
- `customer_phone`: Customer phone number
- `customer_email`: Customer email (optional)
- `service_type`: Type of service booked
- `appointment_date`: Date of appointment (YYYY-MM-DD)
- `appointment_time`: Time of appointment (HH:MM AM/PM)
- `status`: Booking status
- `source`: How booking was created (voice, sms, manual)
- `notes`: Additional notes
- `reminder_sent`: Whether reminder was sent
- `confirmation_sent`: Whether confirmation was sent
- `title`: Booking title (optional)
- `scheduled_at`: Scheduled timestamp (optional)
- `duration_minutes`: Duration in minutes (optional)
- `pickup_address`: Pickup address (optional)
- `payment_amount`: Payment amount (optional)
- `payment_currency`: Currency code (optional)
- `payment_status`: Payment status (optional)
- `number_of_loads`: Number of loads (optional)

### sms_messages

Stores SMS message history.

```sql
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  phone_number TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  message_body TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'delivered', 'failed', 'received')),
  booking_id UUID REFERENCES bookings(id),
  cost DECIMAL(10,2) DEFAULT 0
);

CREATE INDEX idx_sms_phone ON sms_messages(phone_number);
CREATE INDEX idx_sms_created_at ON sms_messages(created_at DESC);
CREATE INDEX idx_sms_booking_id ON sms_messages(booking_id);
```

**Fields:**
- `id`: Unique identifier
- `created_at`: Timestamp when message was sent/received
- `phone_number`: Customer phone number
- `direction`: Message direction (inbound, outbound)
- `message_body`: Message content
- `status`: Message status (sent, delivered, failed, received)
- `booking_id`: Reference to related booking (optional)
- `cost`: Cost of the SMS in dollars

### customers

Stores customer information.

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  total_bookings INTEGER DEFAULT 0,
  total_calls INTEGER DEFAULT 0,
  last_contact TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  address TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
```

**Fields:**
- `id`: Unique identifier
- `created_at`: Timestamp when record was created
- `updated_at`: Timestamp when record was last updated
- `name`: Customer full name
- `phone`: Customer phone number (unique)
- `email`: Customer email (optional)
- `total_bookings`: Total number of bookings
- `total_calls`: Total number of calls
- `last_contact`: Last contact timestamp
- `notes`: Additional notes
- `tags`: Array of tags
- `address`: Customer address (optional)
- `total_spent`: Total amount spent (optional)

### analytics

Stores daily analytics data.

```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TEXT NOT NULL UNIQUE,
  total_calls INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_sms INTEGER DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  successful_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0
);

CREATE INDEX idx_analytics_date ON analytics(date DESC);
```

**Fields:**
- `id`: Unique identifier
- `date`: Date (YYYY-MM-DD, unique)
- `total_calls`: Total calls for the day
- `total_bookings`: Total bookings for the day
- `total_sms`: Total SMS messages for the day
- `total_cost`: Total cost for the day
- `successful_calls`: Number of successful calls
- `failed_calls`: Number of failed calls
- `conversion_rate`: Conversion rate percentage

### faqs

Stores frequently asked questions.

```sql
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT NOT NULL,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faqs_client ON faqs(client_id);
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_active ON faqs(is_active);
```

**Fields:**
- `id`: Unique identifier
- `client_id`: Client identifier
- `category`: FAQ category
- `question`: Question text
- `answer`: Answer text
- `keywords`: Array of keywords for search
- `is_active`: Whether FAQ is active
- `display_order`: Display order
- `usage_count`: Number of times FAQ was used
- `created_at`: Timestamp when record was created
- `updated_at`: Timestamp when record was last updated

### system_prompts

Stores AI agent system prompts.

```sql
CREATE TABLE system_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id TEXT NOT NULL,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('voice', 'sms')),
  system_prompt TEXT NOT NULL,
  prompt_version TEXT DEFAULT 'v1.0.0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prompts_client ON system_prompts(client_id);
CREATE INDEX idx_prompts_type ON system_prompts(prompt_type);
CREATE INDEX idx_prompts_active ON system_prompts(is_active);
```

**Fields:**
- `id`: Unique identifier
- `client_id`: Client identifier
- `prompt_type`: Type of prompt (voice, sms)
- `system_prompt`: Prompt text
- `prompt_version`: Version string
- `is_active`: Whether prompt is active
- `created_at`: Timestamp when record was created
- `updated_at`: Timestamp when record was last updated

## Row Level Security (RLS)

Enable RLS on all tables:

```sql
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;
```

## Basic Policies (Development)

For development, allow all operations:

```sql
CREATE POLICY "Allow all operations" ON calls FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON sms_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON faqs FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON system_prompts FOR ALL USING (true);
```

## Production Policies (Recommended)

For production, implement proper RLS policies based on user authentication:

```sql
-- Example: Only allow users to see their own client's data
CREATE POLICY "Users can view own client data" ON calls
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert own client data" ON calls
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own client data" ON calls
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own client data" ON calls
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Repeat for other tables...
```

## Triggers

### Update updated_at timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON system_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Relationships

```
customers (1) ----< (many) bookings
customers (1) ----< (many) calls
bookings (1) ----< (many) calls
bookings (1) ----< (many) sms_messages
```

## Sample Queries

### Get customer with booking history
```sql
SELECT c.*, 
  COUNT(DISTINCT b.id) as booking_count,
  COUNT(DISTINCT ca.id) as call_count
FROM customers c
LEFT JOIN bookings b ON c.phone = b.customer_phone
LEFT JOIN calls ca ON c.phone = ca.phone_number
WHERE c.id = 'customer-uuid'
GROUP BY c.id;
```

### Get daily analytics
```sql
SELECT 
  date,
  total_calls,
  total_bookings,
  total_sms,
  total_cost,
  ROUND((successful_calls::DECIMAL / NULLIF(total_calls, 0) * 100), 2) as success_rate
FROM analytics
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

### Get recent conversations
```sql
SELECT 
  phone_number,
  COUNT(*) as message_count,
  MAX(created_at) as last_message_at,
  STRING_AGG(message_body, ' | ' ORDER BY created_at) as conversation
FROM sms_messages
GROUP BY phone_number
ORDER BY last_message_at DESC
LIMIT 20;
```

## Backup & Restore

Supabase provides automatic backups. For manual backup:

```bash
# Export schema
pg_dump -h db.xxx.supabase.co -U postgres -d postgres --schema-only > schema.sql

# Export data
pg_dump -h db.xxx.supabase.co -U postgres -d postgres --data-only > data.sql

# Restore
psql -h db.xxx.supabase.co -U postgres -d postgres < schema.sql
psql -h db.xxx.supabase.co -U postgres -d postgres < data.sql
```

## Migrations

For schema changes, create migration files:

```sql
-- migrations/001_initial_schema.sql
-- migrations/002_add_payment_fields.sql
-- migrations/003_add_indexes.sql
```

Run migrations in order using Supabase dashboard or CLI.

## Performance Optimization

1. **Indexes**: Already created on frequently queried columns
2. **Partitioning**: Consider partitioning large tables by date
3. **Archiving**: Archive old data (> 1 year) to separate tables
4. **Vacuum**: Regular VACUUM ANALYZE for performance
5. **Connection Pooling**: Use Supabase connection pooling

## Monitoring

Monitor these metrics:
- Table sizes
- Query performance
- Index usage
- Connection count
- Cache hit ratio

Use Supabase dashboard or pg_stat_* views for monitoring.
