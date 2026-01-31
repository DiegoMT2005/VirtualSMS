# Quick Start Guide

Get up and running with the Voice AI & SMS Booking Management Platform in minutes.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account (free tier works)
- Git

## 5-Minute Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd voice-ai-booking-platform

# Install dependencies
npm install
```

### 2. Set Up Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize
3. Copy your project URL and anon key from Settings > API

### 3. Configure Environment (1 minute)

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Quick Schema Setup

1. Go to your Supabase project
2. Click on "SQL Editor"
3. Create a new query
4. Copy and paste the schema from `DATABASE_SCHEMA.sql` (see below)
5. Click "Run"

### Minimal Schema (Copy & Paste)

```sql
-- Calls table
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
  booking_id UUID
);

-- Bookings table
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
  confirmation_sent BOOLEAN DEFAULT false
);

-- SMS Messages table
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  phone_number TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  message_body TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'delivered', 'failed', 'received')),
  booking_id UUID,
  cost DECIMAL(10,2) DEFAULT 0
);

-- Customers table
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
  tags TEXT[] DEFAULT '{}'
);

-- Analytics table
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

-- FAQs table
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

-- System Prompts table
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

-- Enable Row Level Security (RLS)
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - customize based on your needs)
CREATE POLICY "Allow all operations" ON calls FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON sms_messages FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON analytics FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON faqs FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON system_prompts FOR ALL USING (true);
```

## Sample Data (Optional)

Add some test data to see the dashboard in action:

```sql
-- Sample customers
INSERT INTO customers (name, phone, email, total_bookings, total_calls) VALUES
('John Doe', '+1-555-0101', 'john@example.com', 3, 5),
('Jane Smith', '+1-555-0102', 'jane@example.com', 2, 3),
('Bob Johnson', '+1-555-0103', 'bob@example.com', 1, 2);

-- Sample bookings
INSERT INTO bookings (customer_name, customer_phone, service_type, appointment_date, appointment_time, status, source) VALUES
('John Doe', '+1-555-0101', 'Consultation', '2024-01-15', '10:00 AM', 'confirmed', 'voice'),
('Jane Smith', '+1-555-0102', 'Follow-up', '2024-01-16', '2:00 PM', 'pending', 'sms'),
('Bob Johnson', '+1-555-0103', 'Initial Visit', '2024-01-17', '11:30 AM', 'confirmed', 'manual');

-- Sample calls
INSERT INTO calls (phone_number, customer_name, duration, status, call_type, cost, sentiment) VALUES
('+1-555-0101', 'John Doe', 180, 'completed', 'inbound', 0.50, 'positive'),
('+1-555-0102', 'Jane Smith', 120, 'completed', 'outbound', 0.35, 'neutral'),
('+1-555-0103', 'Bob Johnson', 90, 'completed', 'inbound', 0.25, 'positive');

-- Sample analytics
INSERT INTO analytics (date, total_calls, total_bookings, total_sms, total_cost, successful_calls, conversion_rate) VALUES
('2024-01-10', 15, 8, 25, 12.50, 12, 53.33),
('2024-01-11', 18, 10, 30, 15.75, 15, 55.56),
('2024-01-12', 20, 12, 28, 18.20, 17, 60.00);

-- Sample FAQs
INSERT INTO faqs (client_id, category, question, answer, keywords) VALUES
('default', 'Pricing', 'What are your rates?', 'Our rates start at $50 per hour for standard services.', ARRAY['price', 'cost', 'rate', 'fee']),
('default', 'Scheduling', 'How do I book an appointment?', 'You can book by calling us or through our online system.', ARRAY['book', 'schedule', 'appointment']);

-- Sample system prompts
INSERT INTO system_prompts (client_id, prompt_type, system_prompt, is_active) VALUES
('default', 'voice', 'You are a helpful assistant for booking appointments. Be friendly and professional.', true),
('default', 'sms', 'You are an SMS assistant. Keep responses brief and clear.', true);
```

## First Steps

### 1. Explore the Dashboard

Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to see:
- Overview metrics
- Recent calls
- Upcoming bookings
- Analytics charts

### 2. Add Your First Booking

1. Go to Appointments page
2. Click "Add Appointment"
3. Fill in the form
4. Click "Create Appointment"

### 3. Configure Voice Agent (Optional)

1. Go to Voice Agent page
2. Add your VAPI API key
3. Configure assistant settings
4. Test the connection

### 4. Set Up API Keys (Optional)

1. Go to API Settings
2. Add VAPI API key
3. Add Twilio credentials
4. Test connections

## Common Tasks

### Adding a Customer

```
Dashboard → Customers → Add Customer
```

### Viewing Call Logs

```
Dashboard → Call Logs → Apply Filters
```

### Managing FAQs

```
Dashboard → FAQs → Add FAQ
```

### Editing System Prompts

```
Dashboard → System Prompts → Select Tab → Edit → Save
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

### Database Connection Error

1. Check `.env.local` has correct Supabase URL and key
2. Verify Supabase project is running
3. Check internet connection

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Page Not Found

1. Ensure you're on the correct URL
2. Check that the page exists in `app/` directory
3. Restart the dev server

## Next Steps

1. **Customize**: Update branding, colors, and content
2. **Configure**: Set up VAPI and Twilio integrations
3. **Test**: Try all features with sample data
4. **Deploy**: Follow `DEPLOYMENT.md` to go live
5. **Monitor**: Set up analytics and error tracking

## Resources

- **Full Documentation**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Testing Guide**: See `TESTING.md`
- **Database Schema**: See `DATABASE_SCHEMA.md`

## Getting Help

- Check documentation files
- Review error messages in console
- Check Supabase logs
- Create an issue on GitHub

## Development Tips

### Hot Reload

The dev server automatically reloads when you save files.

### Environment Variables

Restart dev server after changing `.env.local`.

### Database Changes

Refresh the page after making database changes.

### Clearing Cache

```bash
rm -rf .next
npm run dev
```

## Production Checklist

Before deploying to production:

- [ ] Update environment variables
- [ ] Set up proper RLS policies
- [ ] Configure custom domain
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Test all features
- [ ] Review security settings
- [ ] Configure backups

## Success!

You should now have a fully functional Voice AI & SMS Booking Management Platform running locally. Explore the features, add your data, and customize it to your needs!

For detailed information on any feature, refer to the main `README.md` file.
