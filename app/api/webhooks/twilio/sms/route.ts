import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { handleConversation } from '@/lib/ai/conversation-agent';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

// Verify Twilio request signature (SECURITY)
function verifyTwilioSignature(request: NextRequest, body: Record<string, string>): boolean {
  const signature = request.headers.get('x-twilio-signature');
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!signature || !authToken) {
    console.warn('⚠️ Missing signature or auth token');
    return false;
  }
  
  // Reconstruct URL (needed for signature verification)
  const url = request.url;
  
  // Verify using Twilio's built-in validator
  const isValid = twilio.validateRequest(authToken, signature, url, body);
  
  return isValid;
}

// AI-powered auto-responder using LLM conversation agent with state persistence
async function generateAIResponse(
  message: string,
  conversationHistory: any[],
  customerPhone: string,
  clientId: string,
  conversationId: string,
  currentState?: string
): Promise<string> {
  try {
    // Use the AI conversation agent for intelligent responses
    const result = await handleConversation(
      customerPhone,
      message,
      conversationHistory,
      clientId,
      conversationId,
      currentState as any
    );
    
    console.log(`🤖 AI Response generated. State: ${result.newState}, Tools used: ${result.toolsUsed.join(', ')}`);
    
    return result.response;
  } catch (error: any) {
    console.error('❌ AI response error:', error);
    
    // Fallback to simple response if AI fails
    return `Thanks for reaching out! I can help you book laundry pickup. Reply:\n• BOOK to schedule\n• PRICE for rates\n• HELP for options`;
  }
}


export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase configuration missing');
      return new NextResponse('Configuration error', { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse form data (Twilio sends application/x-www-form-urlencoded)
    const formData = await request.formData();
    const data: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('📱 Twilio SMS received:', {
      MessageSid: data.MessageSid,
      From: data.From,
      Body: data.Body?.substring(0, 50) + '...',
    });

    // SECURITY: Verify Twilio signature
    const isValidSignature = verifyTwilioSignature(request, data);
    
    if (!isValidSignature && process.env.NODE_ENV === 'production') {
      console.error('❌ Invalid Twilio signature');
      return new NextResponse('Forbidden', { status: 403 });
    }

    const clientId = process.env.DEFAULT_CLIENT_ID;

    if (!clientId) {
      console.error('❌ No DEFAULT_CLIENT_ID configured');
      return respondWithError('Configuration error');
    }

    // Extract message data
    const fromNumber = data.From;
    const toNumber = data.To;
    const messageBody = data.Body || '';
    const messageSid = data.MessageSid;
    const numMedia = parseInt(data.NumMedia || '0');
    const mediaUrls: string[] = [];

    // Collect media URLs if present
    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = data[`MediaUrl${i}`];
      if (mediaUrl) mediaUrls.push(mediaUrl);
    }

    // Find or create conversation
    let { data: conversations } = await supabase
      .from('sms_conversations')
      .select('*')
      .eq('client_id', clientId)
      .eq('customer_phone', fromNumber)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    let conversation = conversations?.[0];

    if (!conversation) {
      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('sms_conversations')
        .insert({
          client_id: clientId,
          customer_phone: fromNumber,
          direction: 'inbound',
          status: 'active',
          conversation_state: 'initiated',
          started_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (convError) {
        console.error('❌ Error creating conversation:', convError);
        return respondWithError('Database error');
      }

      conversation = newConv;
      console.log('✅ New conversation created:', conversation.id);
    }

    // Save incoming message
    const { error: msgError } = await supabase
      .from('sms_messages')
      .insert({
        conversation_id: conversation.id,
        message_sid: messageSid,
        direction: 'inbound',
        from_number: fromNumber,
        to_number: toNumber,
        body: messageBody,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        status: 'received',
      });

    if (msgError) {
      console.error('❌ Error saving message:', msgError);
      // Continue anyway - we still want to respond
    }

    // Update conversation
    const { data: messages } = await supabase
      .from('sms_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    await supabase
      .from('sms_conversations')
      .update({
        message_count: messages?.length || 1,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversation.id);

    // Generate AI response with state persistence
    const responseText = await generateAIResponse(
      messageBody,
      messages || [],
      fromNumber,
      clientId,
      conversation.id,
      conversation.conversation_state
    );

    // Save outgoing message
    const { data: outgoingMsg } = await supabase
      .from('sms_messages')
      .insert({
        conversation_id: conversation.id,
        message_sid: `generated-${Date.now()}`, // Twilio will update this
        direction: 'outbound',
        from_number: toNumber,
        to_number: fromNumber,
        body: responseText,
        status: 'sending',
      })
      .select()
      .single();

    console.log('✅ Auto-response generated:', responseText.substring(0, 50) + '...');

    // Return TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(responseText)}</Message>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error: any) {
    console.error('❌ Twilio webhook error:', error);
    return respondWithError('Internal error');
  }
}

// Helper: Escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper: Return error as TwiML
function respondWithError(message: string): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Sorry, we're experiencing technical difficulties. Please try again later or call us directly.</Message>
</Response>`;

  return new NextResponse(twiml, {
    status: 200, // Always 200 for Twilio
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/twilio/sms',
    features: [
      'Signature verification',
      'Media attachment support',
      'Auto-responder',
      'Conversation tracking',
      'Message history',
    ],
  });
}

