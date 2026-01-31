import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Create Supabase client with service role (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server
);

// Verify VAPI webhook signature for security
function verifyVapiSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return signature === digest;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-vapi-signature') || '';
    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
    
    // Verify signature if secret is configured
    if (webhookSecret && !verifyVapiSignature(body, signature, webhookSecret)) {
      console.error('Invalid VAPI signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Parse the event
    const event = JSON.parse(body);
    console.log('📞 VAPI Webhook:', event.type, event.call?.id);
    
    // Get client_id (use default or from event metadata)
    const clientId = event.metadata?.client_id || process.env.DEFAULT_CLIENT_ID;
    
    if (!clientId) {
      console.error('No client_id found');
      return NextResponse.json({ error: 'No client_id' }, { status: 400 });
    }
    
    // Handle different event types
    switch (event.type) {
      case 'call.started': {
        // Create new call log entry
        const { data, error } = await supabase
          .from('call_logs')
          .insert({
            client_id: clientId,
            vapi_call_id: event.call.id,
            direction: event.call.type === 'inbound' ? 'inbound' : 'outbound',
            from_number: event.call.customer?.number || 'Unknown',
            to_number: event.call.phoneNumber,
            status: 'in_progress',
            started_at: new Date().toISOString(),
            phone_number: event.call.customer?.number,
            language: event.call.language || 'en',
            metadata: event.call.metadata || {},
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating call log:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log('✅ Call log created:', data.id);
        return NextResponse.json({ success: true, call_log_id: data.id });
      }
      
      case 'call.ended':
      case 'call.completed': {
        // Update call log with final data
        const duration = event.call.duration ? Math.floor(event.call.duration) : 0;
        
        const { data, error } = await supabase
          .from('call_logs')
          .update({
            status: event.call.endedReason === 'hangup' ? 'completed' : 'failed',
            duration_seconds: duration,
            talk_time_seconds: duration,
            ended_at: new Date().toISOString(),
            transcript: event.call.transcript || event.transcript?.text || null,
            summary: event.call.summary || null,
            sentiment: event.call.analysis?.sentiment || 'neutral',
            outcome: event.call.analysis?.successEvaluation || null,
            booking_status: event.call.metadata?.booking_confirmed ? 'booked' : 'not_applicable',
            booking_details: event.call.metadata?.booking_data || null,
          })
          .eq('vapi_call_id', event.call.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating call log:', error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // If booking was confirmed, create appointment
        if (event.call.metadata?.booking_confirmed && event.call.metadata?.booking_data) {
          await createAppointmentFromCall(event.call, clientId);
        }

        console.log('✅ Call completed and updated');
        return NextResponse.json({ success: true });
      }
      
      case 'transcript.ready': {
        // Update with full transcript
        await supabase
          .from('call_logs')
          .update({
            transcript: event.transcript.text,
          })
          .eq('vapi_call_id', event.call.id);

        console.log('✅ Transcript updated');
        return NextResponse.json({ success: true });
      }
      
      case 'call.failed': {
        // Mark call as failed
        await supabase
          .from('call_logs')
          .update({
            status: 'failed',
            error_code: event.error?.code || 'unknown',
            error_message: event.error?.message || 'Call failed',
            ended_at: new Date().toISOString(),
          })
          .eq('vapi_call_id', event.call.id);

        console.log('❌ Call failed');
        return NextResponse.json({ success: true });
      }
      
      default:
        console.log('Unhandled event type:', event.type);
        return NextResponse.json({ success: true, message: 'Event type not handled' });
    }
  } catch (error: any) {
    console.error('❌ VAPI webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function: Create appointment from successful booking call
async function createAppointmentFromCall(call: any, clientId: string) {
  try {
    const bookingData = call.metadata?.booking_data;
    
    if (!bookingData || !bookingData.scheduled_time) {
      console.log('No booking data or scheduled_time found');
      return;
    }

    // Find or create customer
    let customerId: string | undefined;
    
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('client_id', clientId)
      .eq('phone', call.customer?.number)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Create new customer
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
          client_id: clientId,
          phone: call.customer?.number,
          name: bookingData.customer_name || 'Unknown',
          email: bookingData.customer_email || null,
          address: bookingData.address || null,
          city: bookingData.city || null,
          province: bookingData.province || null,
          postal_code: bookingData.postal_code || null,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        return;
      }
      customerId = newCustomer.id;
    }

    // Create appointment
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        customer_id: customerId,
        service_id: bookingData.service_id || null,
        title: 'Laundry Pickup',
        scheduled_at: bookingData.scheduled_time,
        duration_minutes: 30,
        customer_name: bookingData.customer_name || 'Unknown',
        customer_phone: call.customer?.number,
        customer_email: bookingData.customer_email || null,
        pickup_address: bookingData.address || null,
        number_of_loads: bookingData.loads || 1,
        special_instructions: bookingData.notes || null,
        status: 'scheduled',
        payment_status: 'pending',
        payment_amount: bookingData.total_amount || 0,
        payment_currency: 'CAD',
        timezone: 'America/Toronto',
      })
      .select()
      .single();

    if (apptError) {
      console.error('Error creating appointment:', apptError);
      return;
    }

    console.log('✅ Appointment created:', appointment.id);
  } catch (error) {
    console.error('Error in createAppointmentFromCall:', error);
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'VAPI webhook endpoint is active',
    endpoint: '/api/webhooks/vapi'
  });
}
