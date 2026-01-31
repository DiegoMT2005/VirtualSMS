import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
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
