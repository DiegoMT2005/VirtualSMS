import { supabase } from './client'

// Type definitions
interface Call {
  id: string;
  created_at: string;
  updated_at: string;
  phone_number: string;
  customer_name: string | null;
  duration: number;
  status: 'completed' | 'failed' | 'no-answer' | 'busy' | 'in-progress';
  call_type: 'inbound' | 'outbound';
  recording_url: string | null;
  transcript: string | null;
  cost: number;
  notes: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  booking_id: string | null;
}

interface Booking {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show' | 'scheduled';
  source: 'voice' | 'sms' | 'manual';
  notes: string | null;
  reminder_sent: boolean;
  confirmation_sent: boolean;
  title?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  pickup_address?: string;
  payment_amount?: number;
  payment_currency?: string;
  payment_status?: 'pending' | 'paid' | 'failed';
  number_of_loads?: number;
}

interface SmsMessage {
  id: string;
  created_at: string;
  phone_number: string;
  direction: 'inbound' | 'outbound';
  message_body: string;
  status: 'sent' | 'delivered' | 'failed' | 'received';
  booking_id: string | null;
  cost: number;
}

interface Customer {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  email: string | null;
  total_bookings: number;
  total_calls: number;
  last_contact: string | null;
  notes: string | null;
  tags: string[];
  address?: string | null;
  total_spent?: number;
}

interface Analytics {
  id: string;
  date: string;
  total_calls: number;
  total_bookings: number;
  total_sms: number;
  total_cost: number;
  successful_calls: number;
  failed_calls: number;
  conversion_rate: number;
}

// Call helpers
export async function getCalls(limit = 50) {
  const { data, error } = await supabase
    .from('call_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as Call[]
}

export async function getCallById(id: string) {
  const { data, error } = await supabase
    .from('call_logs')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Call
}

export async function createCall(call: Omit<Call, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('call_logs')
    .insert(call)
    .select()
    .single()
  
  if (error) throw error
  return data as Call
}

export async function updateCall(id: string, updates: Partial<Call>) {
  const { data, error } = await supabase
    .from('call_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Call
}

export async function deleteCall(id: string) {
  const { error } = await supabase
    .from('call_logs')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Booking helpers
export async function getBookings(limit = 50) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('scheduled_at', { ascending: true })
    .limit(limit)
  
  if (error) throw error
  return data as Booking[]
}

export async function getBookingById(id: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Booking
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('appointments')
    .insert(booking)
    .select()
    .single()
  
  if (error) throw error
  return data as Booking
}

export async function updateBooking(id: string, updates: Partial<Booking>) {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Booking
}

export async function deleteBooking(id: string) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// SMS Message helpers
export async function getSmsMessages(limit = 50) {
  const { data, error } = await supabase
    .from('sms_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as SmsMessage[]
}

export async function getSmsMessageById(id: string) {
  const { data, error } = await supabase
    .from('sms_messages')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as SmsMessage
}

export async function createSmsMessage(message: Omit<SmsMessage, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('sms_messages')
    .insert(message)
    .select()
    .single()
  
  if (error) throw error
  return data as SmsMessage
}

// Customer helpers
export async function getCustomers(limit = 50) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('last_contact', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data as Customer[]
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Customer
}

export async function getCustomerByPhone(phone: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data as Customer
}

export async function createCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single()
  
  if (error) throw error
  return data as Customer
}

export async function updateCustomer(id: string, updates: Partial<Customer>) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Customer
}

// Analytics helpers
// Analytics helpers - Note: analytics table doesn't exist yet, returning mock data
export async function getAnalytics(startDate: string, endDate: string) {
  // TODO: Create analytics table in Supabase
  // For now, return empty analytics data
  return [] as Analytics[]
}

export async function getAnalyticsByDate(date: string) {
  // TODO: Create analytics table in Supabase
  // For now, return empty analytics data
  return {
    total_calls: 0,
    total_bookings: 0,
    total_sms: 0,
    total_cost: 0,
    successful_calls: 0,
  } as Analytics
}

// Dashboard summary helpers
export async function getDashboardSummary() {
  const today = new Date().toISOString().split('T')[0]
  
  const [calls, bookings, messages, analytics] = await Promise.all([
    getCalls(10),
    getBookings(10),
    getSmsMessages(10),
    getAnalyticsByDate(today)
  ])
  
  return {
    recentCalls: calls,
    upcomingBookings: bookings,
    recentMessages: messages,
    todayAnalytics: analytics
  }
}

// Search helpers
export async function searchBookings(query: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .or(`customer_name.ilike.%${query}%,customer_phone.ilike.%${query}%,customer_email.ilike.%${query}%`)
    .order('appointment_date', { ascending: true })
    .limit(20)
  
  if (error) throw error
  return data as Booking[]
}

export async function searchCustomers(query: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .order('last_contact', { ascending: false })
    .limit(20)
  
  if (error) throw error
  return data as Customer[]
}
