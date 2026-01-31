// Quick test script to verify Supabase connection and system_prompts table
// Run with: node test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const clientId = envVars.NEXT_PUBLIC_DEFAULT_CLIENT_ID;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test 1: Check if system_prompts table exists
    console.log('1️⃣ Checking system_prompts table...');
    const { data: prompts, error: promptsError } = await supabase
      .from('system_prompts')
      .select('*')
      .limit(1);
    
    if (promptsError) {
      console.error('❌ Error accessing system_prompts:', promptsError.message);
      console.log('\n💡 Solution: Run the SQL in supabase-setup.sql');
      return;
    }
    
    console.log('✅ system_prompts table exists');
    
    // Test 2: Check for existing prompts
    console.log('\n2️⃣ Checking for existing prompts...');
    const { data: allPrompts, error: allError } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('client_id', clientId);
    
    if (allError) {
      console.error('❌ Error querying prompts:', allError.message);
      return;
    }
    
    console.log(`✅ Found ${allPrompts?.length || 0} prompts for client ${clientId}`);
    
    if (allPrompts && allPrompts.length > 0) {
      allPrompts.forEach(p => {
        console.log(`   - ${p.prompt_type}: ${p.system_prompt.substring(0, 50)}...`);
      });
    } else {
      console.log('⚠️  No prompts found. They will be auto-created on first page load.');
    }
    
    // Test 3: Try to query with filters (like the app does)
    console.log('\n3️⃣ Testing query with filters (voice)...');
    const { data: voicePrompt, error: voiceError } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('client_id', clientId)
      .eq('prompt_type', 'voice')
      .eq('is_active', true)
      .maybeSingle();
    
    if (voiceError) {
      console.error('❌ Error querying voice prompt:', voiceError.message);
      return;
    }
    
    if (voicePrompt) {
      console.log('✅ Voice prompt found');
    } else {
      console.log('⚠️  No voice prompt found (will be auto-created)');
    }
    
    // Test 4: Try SMS prompt
    console.log('\n4️⃣ Testing query with filters (sms)...');
    const { data: smsPrompt, error: smsError } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('client_id', clientId)
      .eq('prompt_type', 'sms')
      .eq('is_active', true)
      .maybeSingle();
    
    if (smsError) {
      console.error('❌ Error querying SMS prompt:', smsError.message);
      return;
    }
    
    if (smsPrompt) {
      console.log('✅ SMS prompt found');
    } else {
      console.log('⚠️  No SMS prompt found (will be auto-created)');
    }
    
    console.log('\n✅ All tests passed! System prompts should work correctly.');
    console.log('\n📝 Next steps:');
    console.log('   1. If no prompts were found, run: npm run dev');
    console.log('   2. Navigate to /dashboard/prompts');
    console.log('   3. Prompts will be auto-created on first load');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n💡 Make sure you have run supabase-setup.sql in your Supabase SQL Editor');
  }
}

testConnection();
