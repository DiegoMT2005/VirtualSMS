import OpenAI from 'openai';
import { supabase } from '@/lib/supabase/client';

// Initialize OpenAI (or use Claude/Gemini)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define conversation states
export type ConversationState =
  | 'greeting'
  | 'collecting_address'
  | 'validating_address'
  | 'selecting_service'
  | 'selecting_time'
  | 'confirming_booking'
  | 'completed'
  | 'faq'; // For handling questions/interruptions

// Track tool execution to prevent loops
interface ToolExecutionTracker {
  [toolName: string]: {
    count: number;
    lastArgs: string;
  };
}

// Tools the AI can call - ALL 7 REQUIRED TOOLS
const tools = [
  {
    type: 'function',
    function: {
      name: 'check_client',
      description: 'Verify if a customer exists in the system by phone number. Use this FIRST when a conversation starts.',
      parameters: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            description: 'Customer phone number',
          },
        },
        required: ['phone'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_services',
      description: 'Get available service tiers and pricing information',
      parameters: {
        type: 'object',
        properties: {
          service_type: {
            type: 'string',
            enum: ['all', 'regular', 'express', 'premium'],
            description: 'Specific service type or "all" for all services',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_availability',
      description: 'Get available pickup time slots for a specific date',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Date in YYYY-MM-DD format',
          },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_address',
      description: 'Validate and update customer address using Google Maps',
      parameters: {
        type: 'object',
        properties: {
          address: {
            type: 'string',
            description: 'Full customer address',
          },
          customer_id: {
            type: 'string',
            description: 'Customer ID if updating existing customer',
          },
        },
        required: ['address'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_booking',
      description: 'Create a confirmed laundry pickup booking. Only call this after confirming ALL details with customer.',
      parameters: {
        type: 'object',
        properties: {
          customer_name: { type: 'string' },
          customer_phone: { type: 'string' },
          customer_email: { type: 'string' },
          address: { type: 'string' },
          service_type: {
            type: 'string',
            enum: ['regular', 'express', 'premium'],
          },
          number_of_loads: { type: 'number' },
          scheduled_date: { type: 'string' },
          scheduled_time: { type: 'string' },
        },
        required: ['customer_name', 'customer_phone', 'address', 'service_type', 'scheduled_date', 'scheduled_time'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_new_client',
      description: 'Add a new customer to the system',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          address: { type: 'string' },
        },
        required: ['name', 'phone', 'address'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_appointment',
      description: 'Modify an existing booking',
      parameters: {
        type: 'object',
        properties: {
          booking_id: { type: 'string' },
          scheduled_date: { type: 'string' },
          scheduled_time: { type: 'string' },
          number_of_loads: { type: 'number' },
        },
        required: ['booking_id'],
      },
    },
  },
];

// System prompt that defines AI behavior
const SYSTEM_PROMPT = `🚨 CRITICAL RULES - READ FIRST (NEVER VIOLATE THESE):

1. NEVER make up information not provided by tools
2. NEVER execute the same tool twice with identical parameters
3. NEVER invent appointment times, prices, or confirmations
4. ONLY use data from actual tool responses
5. If you don't have information, say "Let me check that for you" and use a tool
6. If a tool fails, offer to connect with a human - NEVER make up an answer
7. Maximum 2 tool calls per conversation turn
8. If customer asks a question mid-booking, answer it then return to where you were

═══════════════════════════════════════════════════════════════

YOU ARE: A friendly SMS booking assistant for 1StopLaundry

YOUR PERSONALITY:
- Warm, helpful, and efficient - like texting a friend who runs the business
- Natural and conversational - NEVER robotic or formal
- Keep messages concise (under 160 chars when possible)
- Use emojis occasionally (🧺 ✨ 📅) but don't overdo it
- Match the customer's energy and communication style

NEVER SAY (Too Robotic):
❌ "I will now proceed to..."
❌ "Thank you for providing that information"
❌ "Processing your request"
❌ "Your booking has been received and will be confirmed shortly"
❌ "I am here to assist you with..."
❌ "Please be advised that..."

ALWAYS SAY (Natural & Human):
✅ "Perfect! When works for you?"
✅ "Got it - 123 Main St, right?"
✅ "Sweet! We serve that area"
✅ "Awesome! I'll get that booked"
✅ "Quick question - how many loads?"
✅ "Sounds good!"

═══════════════════════════════════════════════════════════════

SERVICES & PRICING (Use check_services tool for current pricing):
- Regular: $15 base + $8/load (48-hour turnaround) 🧺
- Express: $20 base + $12/load (24-hour turnaround) ⚡
- Premium: $30 base + $18/load (same-day service) ⭐

SERVICE AREAS:
- Toronto (M4, M5 postal codes)
- Mississauga (L5 postal codes)
- Vancouver (V6 postal codes)

HOURS:
- Monday-Saturday, 8am-8pm
- Pickups available during business hours

═══════════════════════════════════════════════════════════════

STATE-BASED BOOKING FLOW:

STATE: GREETING
- Greet warmly: "Hey! 👋 Need a laundry pickup?"
- If they say yes → Move to COLLECTING_ADDRESS
- If they ask a question → Answer it (FAQ state) then return here

STATE: COLLECTING_ADDRESS
- Ask: "What's your address?"
- When you get address → Use update_address tool to validate
- If valid → Move to SELECTING_SERVICE
- If invalid → Ask them to clarify
- If they ask "how much?" → Answer, then return to collecting address

STATE: SELECTING_SERVICE
- Show options: "We have Regular (48hr), Express (24hr), or Premium (same-day). Which works best?"
- Get their choice and number of loads
- Move to SELECTING_TIME

STATE: SELECTING_TIME
- Use get_availability tool to get real time slots
- Show options: "When would you like pickup? We have 9am, 11am, 2pm, or 4pm"
- Get their choice → Move to CONFIRMING

STATE: CONFIRMING
- Recap everything: "Perfect! So that's [X] loads of [service] on [date] at [time] for $[amount]. Sound good?"
- If yes → Use create_booking tool
- If they want to change something → Go back to that state

STATE: COMPLETED
- Confirm: "All set! ✅ Pickup confirmed for [date] at [time]. We'll text you 30 min before arrival!"
- Offer help: "Need anything else?"

═══════════════════════════════════════════════════════════════

FAQ CIRCUIT BREAKER (Handling Interruptions):

If customer asks a question at ANY point:
1. Answer the question naturally
2. Remember what state you were in
3. Return to that exact state after answering
4. Don't lose any collected information

Examples:
- Customer: "Wait, how much is express?" (during address collection)
  You: "Express is $20 base + $12 per load, done in 24hrs ⚡ So what's your address?"
  
- Customer: "Do you do same-day?" (during time selection)
  You: "Yep! That's our Premium service - $30 base + $18/load ⭐ Back to pickup time - 9am, 11am, 2pm, or 4pm?"

FAQ Limit: If they ask more than 3 questions without booking, offer human help:
"Want me to have someone call you to go over everything? 📞"

═══════════════════════════════════════════════════════════════

TOOL USAGE INSTRUCTIONS:

check_client:
- Use at start of conversation to see if returning customer
- If exists: "Hey [name]! 👋 Need another pickup?"
- If new: Continue with normal flow

check_services:
- Use when customer asks about pricing or services
- Use when you need current pricing info
- NEVER make up prices

get_availability:
- Use when customer is ready to pick a time
- ONLY show times returned by the tool
- NEVER invent time slots

update_address:
- Use to validate address is in service area
- Use to check postal code
- If not in area: "Sorry, we don't serve that area yet 😔 We cover Toronto, Mississauga, and Vancouver"

create_booking:
- ONLY use after confirming ALL details with customer
- Double-check you have: name, phone, address, service, loads, date, time
- After booking: Give confirmation with all details

create_new_client:
- Use for first-time customers after getting their info
- Saves their details for future bookings

update_appointment:
- Use when customer wants to change existing booking
- Need booking_id from previous conversation

═══════════════════════════════════════════════════════════════

EDGE CASE HANDLING:

Customer goes silent:
- After 2 hours of no response: "Still there? Let me know if you want to continue booking! 👋"

Customer outside service area:
- "Sorry, we don't serve that area yet 😔 We cover Toronto (M4, M5), Mississauga (L5), and Vancouver (V6). Know anyone in those areas?"

Tool fails:
- "Oops, having a tech hiccup. Want me to have someone call you? 📞"

Invalid input:
- "Hmm, didn't quite catch that. Could you try again?"

Customer wants to cancel:
- "No problem! Changed your mind? Just text back if you need us later 👋"

═══════════════════════════════════════════════════════════════

CONVERSATION MEMORY:
- Remember everything said in this conversation
- Track what state you're in
- If interrupted with FAQ, return to previous state
- Never re-ask for information already provided
- Keep context of the entire conversation

═══════════════════════════════════════════════════════════════

TONE CHECK - Would a real person say this?

Before responding, ask yourself:
1. Would I text this to a friend?
2. Does it sound natural when read aloud?
3. Am I being helpful without being robotic?
4. Am I keeping it concise?

If you answered NO to any → Rewrite it!

═══════════════════════════════════════════════════════════════

Remember: You're having a friendly text conversation, not writing a business email. Be human! 🙂`;


// Main conversation handler with state persistence and hallucination prevention
export async function handleConversation(
  customerPhone: string,
  message: string,
  conversationHistory: any[],
  clientId: string,
  conversationId?: string,
  currentState?: ConversationState
): Promise<{ response: string; newState?: ConversationState; toolsUsed: string[] }> {
  // Track tool executions to prevent loops
  const toolExecutionTracker: ToolExecutionTracker = {};
  const toolsUsed: string[] = [];

  try {
    // Build message history for OpenAI (limit to last 10 messages for context)
    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history (last 10 messages to prevent token overflow)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach((msg) => {
      messages.push({
        role: msg.direction === 'inbound' ? 'user' : 'assistant',
        content: msg.body,
      });
    });

    // Add current state context if available
    if (currentState && currentState !== 'greeting') {
      messages.push({
        role: 'system',
        content: `CURRENT STATE: ${currentState}. Remember where you are in the conversation.`,
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call OpenAI with tools
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for cost savings
      messages: messages,
      tools: tools as any,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 150, // Keep responses concise for SMS
    });

    const assistantMessage = response.choices[0].message;

    // Handle tool calls if any
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      // Limit to 2 tool calls per turn to prevent loops
      const toolCallsToProcess = assistantMessage.tool_calls.slice(0, 2);
      
      for (const toolCall of toolCallsToProcess) {
        // Type guard for function tool calls
        if (toolCall.type !== 'function' || !toolCall.function) continue;
        
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        const argsKey = JSON.stringify(functionArgs);

        // Check if we've already called this tool with same args (HALLUCINATION PREVENTION)
        if (toolExecutionTracker[functionName]) {
          if (toolExecutionTracker[functionName].lastArgs === argsKey) {
            console.warn(`⚠️ Prevented duplicate tool call: ${functionName}`);
            continue; // Skip duplicate call
          }
          if (toolExecutionTracker[functionName].count >= 2) {
            console.warn(`⚠️ Tool execution limit reached: ${functionName}`);
            continue; // Prevent infinite loops
          }
        }

        // Track this execution
        toolExecutionTracker[functionName] = {
          count: (toolExecutionTracker[functionName]?.count || 0) + 1,
          lastArgs: argsKey,
        };
        toolsUsed.push(functionName);

        console.log(`🔧 AI calling tool: ${functionName}`, functionArgs);

        // Execute the tool
        let toolResult: any;

        switch (functionName) {
          case 'check_client':
            toolResult = await checkClient(functionArgs.phone, clientId);
            break;
          case 'check_services':
            toolResult = await checkServices(functionArgs.service_type, clientId);
            break;
          case 'get_availability':
            toolResult = await getAvailability(functionArgs.date, clientId);
            break;
          case 'update_address':
            toolResult = await updateAddress(functionArgs, clientId);
            break;
          case 'create_booking':
            toolResult = await createBooking(functionArgs, clientId, customerPhone);
            break;
          case 'create_new_client':
            toolResult = await createNewClient(functionArgs, clientId);
            break;
          case 'update_appointment':
            toolResult = await updateAppointment(functionArgs, clientId);
            break;
          default:
            toolResult = { error: 'Unknown tool' };
        }

        // Send tool result back to AI to generate natural response
        messages.push(assistantMessage);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      // Get final response from AI with tool results
      const finalResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages,
        temperature: 0.7,
        max_tokens: 150,
      });

      const responseText = finalResponse.choices[0].message.content || 'Got it! What else can I help with?';
      
      // Detect new state from response (simple heuristic)
      const newState = detectState(responseText, currentState);

      // Save state to database if conversation ID provided
      if (conversationId && newState) {
        await saveConversationState(conversationId, newState);
      }

      return { response: responseText, newState, toolsUsed };
    }

    // Return direct response if no tools needed
    const responseText = assistantMessage.content || 'I\'m here to help! What do you need?';
    const newState = detectState(responseText, currentState);

    if (conversationId && newState) {
      await saveConversationState(conversationId, newState);
    }

    return { response: responseText, newState, toolsUsed };
  } catch (error: any) {
    console.error('❌ Conversation error:', error);
    return {
      response: 'Oops! Something went wrong. Can you try that again?',
      toolsUsed: [],
    };
  }
}

// Helper: Detect conversation state from response
function detectState(response: string, currentState?: ConversationState): ConversationState {
  const lowerResponse = response.toLowerCase();
  
  if (lowerResponse.includes('address') && lowerResponse.includes('?')) {
    return 'collecting_address';
  }
  if (lowerResponse.includes('regular') || lowerResponse.includes('express') || lowerResponse.includes('premium')) {
    return 'selecting_service';
  }
  if (lowerResponse.includes('time') || lowerResponse.includes('pickup')) {
    return 'selecting_time';
  }
  if (lowerResponse.includes('confirm') || lowerResponse.includes('sound good')) {
    return 'confirming_booking';
  }
  if (lowerResponse.includes('all set') || lowerResponse.includes('confirmed')) {
    return 'completed';
  }
  
  return currentState || 'greeting';
}

// Helper: Save conversation state to database
async function saveConversationState(conversationId: string, state: ConversationState) {
  try {
    await supabase
      .from('sms_conversations')
      .update({ conversation_state: state })
      .eq('id', conversationId);
  } catch (error) {
    console.error('Error saving state:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// TOOL IMPLEMENTATIONS - ALL 7 REQUIRED TOOLS
// ═══════════════════════════════════════════════════════════════

// Tool 1: Check if customer exists (check_client)
async function checkClient(phone: string, clientId: string) {
  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('client_id', clientId)
      .eq('phone', phone)
      .single();

    if (customer) {
      return {
        exists: true,
        customer_id: customer.id,
        name: customer.name,
        email: customer.email,
        address: customer.address,
        total_bookings: customer.total_bookings || 0,
        last_booking: customer.last_booking_date,
      };
    }

    return { exists: false };
  } catch (error) {
    console.error('check_client error:', error);
    return { exists: false, error: 'Could not check customer' };
  }
}

// Tool 2: Get service information (check_services)
async function checkServices(serviceType: string = 'all', clientId: string) {
  try {
    let query = supabase
      .from('services')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true);

    if (serviceType && serviceType !== 'all') {
      query = query.eq('service_type', serviceType);
    }

    const { data: services } = await query;

    if (!services || services.length === 0) {
      // Return default services if none in database
      return {
        services: [
          {
            service_type: 'regular',
            service_name: 'Regular Service',
            base_price: 15,
            price_per_load: 8,
            turnaround_hours: 48,
            description: '48-hour turnaround',
          },
          {
            service_type: 'express',
            service_name: 'Express Service',
            base_price: 20,
            price_per_load: 12,
            turnaround_hours: 24,
            description: '24-hour turnaround',
          },
          {
            service_type: 'premium',
            service_name: 'Premium Service',
            base_price: 30,
            price_per_load: 18,
            turnaround_hours: 8,
            description: 'Same-day service',
          },
        ],
      };
    }

    return { services };
  } catch (error) {
    console.error('check_services error:', error);
    return { error: 'Could not fetch services' };
  }
}

// Tool 3: Get available time slots (get_availability)
async function getAvailability(date: string, clientId: string) {
  try {
    const { data: slots } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('client_id', clientId)
      .eq('slot_date', date)
      .eq('is_available', true)
      .order('slot_time', { ascending: true });

    if (!slots || slots.length === 0) {
      // Generate default slots if none exist
      return {
        date,
        available_slots: [
          { time: '09:00', label: '9:00 AM', available: true },
          { time: '11:00', label: '11:00 AM', available: true },
          { time: '14:00', label: '2:00 PM', available: true },
          { time: '16:00', label: '4:00 PM', available: true },
        ],
      };
    }

    return {
      date,
      available_slots: slots.map(slot => ({
        time: slot.slot_time,
        label: formatTime(slot.slot_time),
        available: slot.is_available,
      })),
    };
  } catch (error) {
    console.error('get_availability error:', error);
    return { error: 'Could not fetch availability' };
  }
}

// Tool 4: Validate and update address (update_address)
async function updateAddress(args: any, clientId: string) {
  const { address, customer_id } = args;

  try {
    // Extract postal code from address
    const postalMatch = address.match(/[A-Z]\d[A-Z]\s?\d[A-Z]\d/i);
    const postalCode = postalMatch?.[0]?.toUpperCase();
    const prefix = postalCode?.substring(0, 3);

    if (!prefix) {
      return {
        valid: false,
        reason: 'Could not determine postal code from address',
      };
    }

    // Check against service areas
    const { data: areas } = await supabase
      .from('service_areas')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true);

    const serviceArea = areas?.find(area =>
      prefix.startsWith(area.postal_code_prefix || '')
    );

    if (!serviceArea) {
      return {
        valid: false,
        in_service_area: false,
        postal_code: postalCode,
        reason: `Sorry, we don't serve ${prefix} yet. We cover: M4, M5 (Toronto), L5 (Mississauga), V6 (Vancouver)`,
      };
    }

    // Update customer address if customer_id provided
    if (customer_id) {
      await supabase
        .from('customers')
        .update({ address, postal_code: postalCode })
        .eq('id', customer_id)
        .eq('client_id', clientId);
    }

    return {
      valid: true,
      in_service_area: true,
      postal_code: postalCode,
      city: serviceArea.city,
      province: serviceArea.province,
      formatted_address: address,
    };
  } catch (error) {
    console.error('update_address error:', error);
    return { valid: false, error: 'Could not validate address' };
  }
}

// Tool 5: Create booking (create_booking)
async function createBooking(args: any, clientId: string, customerPhone: string) {
  try {
    // Find or create customer
    let { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('client_id', clientId)
      .eq('phone', customerPhone)
      .single();

    if (!customer) {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          client_id: clientId,
          phone: customerPhone,
          name: args.customer_name,
          email: args.customer_email || null,
          address: args.address,
        })
        .select()
        .single();

      customer = newCustomer;
    }

    // Get service ID
    const { data: service } = await supabase
      .from('services')
      .select('*')
      .eq('client_id', clientId)
      .eq('service_type', args.service_type)
      .single();

    if (!service) {
      return { success: false, error: 'Service not found' };
    }

    // Calculate amount
    const totalAmount = service.base_price + (service.price_per_load! * (args.number_of_loads || 1));

    // Create appointment
    const scheduledAt = `${args.scheduled_date}T${args.scheduled_time}:00`;

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        client_id: clientId,
        customer_id: customer!.id,
        service_id: service.id,
        title: 'Laundry Pickup',
        scheduled_at: scheduledAt,
        duration_minutes: 30,
        customer_name: args.customer_name,
        customer_phone: customerPhone,
        customer_email: args.customer_email || null,
        pickup_address: args.address,
        number_of_loads: args.number_of_loads || 1,
        status: 'scheduled',
        payment_status: 'pending',
        payment_amount: totalAmount,
        timezone: 'America/Toronto',
      })
      .select()
      .single();

    if (error) {
      console.error('Booking error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      booking_id: appointment.id,
      scheduled_time: scheduledAt,
      total_amount: totalAmount,
      service_name: service.service_name,
      number_of_loads: args.number_of_loads || 1,
    };
  } catch (error: any) {
    console.error('Create booking error:', error);
    return { success: false, error: error.message };
  }
}

// Tool 6: Create new customer (create_new_client)
async function createNewClient(args: any, clientId: string) {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        client_id: clientId,
        name: args.name,
        phone: args.phone,
        email: args.email || null,
        address: args.address,
        total_bookings: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Create customer error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      customer_id: customer.id,
      name: customer.name,
      phone: customer.phone,
    };
  } catch (error: any) {
    console.error('Create new client error:', error);
    return { success: false, error: error.message };
  }
}

// Tool 7: Update existing appointment (update_appointment)
async function updateAppointment(args: any, clientId: string) {
  try {
    const updateData: any = {};

    if (args.scheduled_date && args.scheduled_time) {
      updateData.scheduled_at = `${args.scheduled_date}T${args.scheduled_time}:00`;
    }
    if (args.number_of_loads) {
      updateData.number_of_loads = args.number_of_loads;
      
      // Recalculate amount if loads changed
      const { data: appointment } = await supabase
        .from('appointments')
        .select('service_id')
        .eq('id', args.booking_id)
        .single();

      if (appointment) {
        const { data: service } = await supabase
          .from('services')
          .select('*')
          .eq('id', appointment.service_id)
          .single();

        if (service) {
          updateData.payment_amount = service.base_price + (service.price_per_load! * args.number_of_loads);
        }
      }
    }

    const { data: updated, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', args.booking_id)
      .eq('client_id', clientId)
      .select()
      .single();

    if (error) {
      console.error('Update appointment error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      booking_id: updated.id,
      scheduled_at: updated.scheduled_at,
      number_of_loads: updated.number_of_loads,
      total_amount: updated.payment_amount,
    };
  } catch (error: any) {
    console.error('Update appointment error:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Helper: Format time
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
}
