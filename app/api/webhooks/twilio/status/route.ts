import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const formData = await request.formData();
    const data: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('📊 Twilio Status Update:', {
      MessageSid: data.MessageSid,
      MessageStatus: data.MessageStatus,
    });

    // Update message status
    await supabase
      .from('sms_messages')
      .update({
        status: data.MessageStatus,
        error_code: data.ErrorCode || null,
        error_message: data.ErrorMessage || null,
      })
      .eq('message_sid', data.MessageSid);

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('❌ Status callback error:', error);
    return new NextResponse('OK', { status: 200 }); // Always return 200
  }
}
