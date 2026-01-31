/**
 * Test script for AI conversation agent
 * 
 * Run with: npx ts-node lib/ai/test-agent.ts
 * Or add to package.json scripts: "test:ai": "ts-node lib/ai/test-agent.ts"
 */

import { handleConversation } from './conversation-agent';

async function testConversation() {
  console.log('🧪 Testing AI Conversation Agent\n');

  const testPhone = '+15551234567';
  const clientId = process.env.DEFAULT_CLIENT_ID || 'test-client-id';

  // Test 1: Greeting
  console.log('Test 1: Greeting');
  console.log('Customer: "Hi"');
  const response1 = await handleConversation(
    testPhone,
    'Hi',
    [],
    clientId
  );
  console.log('AI:', response1);
  console.log('');

  // Test 2: Address inquiry
  console.log('Test 2: Address Check');
  console.log('Customer: "123 Main St, Toronto M5V 2T6"');
  const response2 = await handleConversation(
    testPhone,
    '123 Main St, Toronto M5V 2T6',
    [
      { direction: 'inbound', body: 'Hi' },
      { direction: 'outbound', body: response1 }
    ],
    clientId
  );
  console.log('AI:', response2);
  console.log('');

  // Test 3: Service selection
  console.log('Test 3: Service Selection');
  console.log('Customer: "Express please, 2 loads"');
  const response3 = await handleConversation(
    testPhone,
    'Express please, 2 loads',
    [
      { direction: 'inbound', body: 'Hi' },
      { direction: 'outbound', body: response1 },
      { direction: 'inbound', body: '123 Main St, Toronto M5V 2T6' },
      { direction: 'outbound', body: response2 }
    ],
    clientId
  );
  console.log('AI:', response3);
  console.log('');

  console.log('✅ Test complete!');
}

// Run tests
testConversation().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
