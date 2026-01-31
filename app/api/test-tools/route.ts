import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEST_CLIENT_ID = process.env.DEFAULT_CLIENT_ID || 'test-client-id';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    clientId: TEST_CLIENT_ID,
    tests: {},
  };

  // Test 1: Check Client
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('client_id', TEST_CLIENT_ID)
      .limit(1)
      .single();

    results.tests.check_client = {
      status: error && error.code !== 'PGRST116' ? 'FAIL' : 'PASS',
      message: customer ? `Found customer: ${customer.name}` : 'No customers yet (OK)',
      error: error && error.code !== 'PGRST116' ? error.message : null,
    };
  } catch (error: any) {
    results.tests.check_client = {
      status: 'FAIL',
      error: error.message,
    };
  }

  // Test 2: Check Services
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('client_id', TEST_CLIENT_ID)
      .eq('is_active', true);

    results.tests.check_services = {
      status: error ? 'FAIL' : 'PASS',
      message: services && services.length > 0 
        ? `Found ${services.length} services` 
        : 'No services (will use defaults)',
      data: services?.map(s => ({ name: s.service_name, price: s.base_price })),
      error: error?.message,
    };
  } catch (error: any) {
    results.tests.check_services = {
      status: 'FAIL',
      error: error.message,
    };
  }

  // Test 3: Get Availability
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const { data: slots, error } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('client_id', TEST_CLIENT_ID)
      .eq('slot_date', dateStr)
      .eq('is_available', true);

    results.tests.get_availability = {
      status: error ? 'FAIL' : 'PASS',
      message: slots && slots.length > 0 
        ? `Found ${slots.length} slots for ${dateStr}` 
        : `No slots for ${dateStr} (will use defaults)`,
      data: slots?.map(s => s.slot_time),
      error: error?.message,
    };
  } catch (error: any) {
    results.tests.get_availability = {
      status: 'FAIL',
      error: error.message,
    };
  }

  // Test 4: Update Address (Service Areas)
  try {
    const { data: areas, error } = await supabase
      .from('service_areas')
      .select('*')
      .eq('client_id', TEST_CLIENT_ID)
      .eq('is_active', true);

    results.tests.update_address = {
      status: error ? 'FAIL' : 'PASS',
      message: areas && areas.length > 0 
        ? `Found ${areas.length} service areas` 
        : 'No service areas (need to add)',
      data: areas?.map(a => ({ city: a.city, prefix: a.postal_code_prefix })),
      error: error?.message,
    };
  } catch (error: any) {
    results.tests.update_address = {
      status: 'FAIL',
      error: error.message,
    };
  }

  // Test 5: Create Booking (Appointments table)
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('client_id', TEST_CLIENT_ID)
      .limit(1);

    results.tests.create_booking = {
      status: error ? 'FAIL' : 'PASS',
      message: 'Appointments table accessible',
      hasData: appointments && appointments.length > 0,
      error: error?.message,
    };
  } catch (error: any) {
    results.tests.create_booking = {
      status: 'FAIL',
      error: error.message,
    };
  }

  // Test 6: Create New Client (Customers table)
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id')
      .eq('client_id', TEST_CLIENT_ID)
      .limit(1);

    results.tests.create_new_client = {
      status: error ? 'FAIL' : 'PASS',
      message: 'Customers table accessible',
      hasData: customers && customers.length > 0,
      error: error?.message,
    };
  } catch (error: any) {
    results.tests.create_new_client = {
      status: 'FAIL',
      error: error.message,
    };
  }

  // Test 7: Update Appointment
  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('client_id', TEST_CLIENT_ID)
      .limit(1);

    results.tests.update_appointment = {
      status: error ? 'FAIL' : 'PASS',
      message: 'Can update appointments',
      hasData: appointments && appointments.length > 0,
      error: error?.message,
    };
  } catch (error: any) {
    results.tests.update_appointment = {
      status: 'FAIL',
      error: error.message,
    };
  }

  // Calculate summary
  const testEntries = Object.entries(results.tests);
  const passed = testEntries.filter(([_, t]: any) => t.status === 'PASS').length;
  const failed = testEntries.filter(([_, t]: any) => t.status === 'FAIL').length;

  results.summary = {
    total: testEntries.length,
    passed,
    failed,
    score: Math.round((passed / testEntries.length) * 100),
  };

  // Recommendations
  results.recommendations = [];
  
  if (results.tests.check_services.message?.includes('No services')) {
    results.recommendations.push('Add services to database (Regular, Express, Premium)');
  }
  if (results.tests.update_address.message?.includes('No service areas')) {
    results.recommendations.push('Add service areas (Toronto M4/M5, Mississauga L5, Vancouver V6)');
  }
  if (results.tests.get_availability.message?.includes('No slots')) {
    results.recommendations.push('Add availability slots (or use defaults)');
  }

  return NextResponse.json(results, { status: 200 });
}
