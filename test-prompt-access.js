// Test if we can actually access the prompts (checking RLS)
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAccess() {
  console.log('🔍 Testing RLS access to system_prompts...\n');
  
  try {
    // Test the exact query the app uses
    console.log('Testing voice prompt query (exact app query)...');
    const { data: voiceData, error: voiceError } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('client_id', clientId)
      .eq('prompt_type', 'voice')
      .eq('is_active', true)
      .maybeSingle();
    
    if (voiceError) {
      console.error('❌ Voice prompt error:', voiceError);
      console.log('\n💡 This is likely an RLS policy issue.');
      console.log('   Run supabase-setup.sql to fix RLS policies.');
    } else if (voiceData) {
      console.log('✅ Voice prompt accessible!');
      console.log('   Company:', voiceData.company_name);
      console.log('   Agent:', voiceData.agent_name);
    } else {
      console.log('⚠️  No voice prompt found (but no error - RLS is OK)');
    }
    
    console.log('\nTesting SMS prompt query (exact app query)...');
    const { data: smsData, error: smsError } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('client_id', clientId)
      .eq('prompt_type', 'sms')
      .eq('is_active', true)
      .maybeSingle();
    
    if (smsError) {
      console.error('❌ SMS prompt error:', smsError);
      console.log('\n💡 This is likely an RLS policy issue.');
      console.log('   Run supabase-setup.sql to fix RLS policies.');
    } else if (smsData) {
      console.log('✅ SMS prompt accessible!');
      console.log('   Company:', smsData.company_name);
      console.log('   Agent:', smsData.agent_name);
    } else {
      console.log('⚠️  No SMS prompt found (but no error - RLS is OK)');
    }
    
    console.log('\n' + '='.repeat(60));
    if (!voiceError && !smsError) {
      console.log('✅ SUCCESS! RLS policies are working correctly.');
      console.log('   The app should work now. Try: npm run dev');
    } else {
      console.log('❌ RLS BLOCKING ACCESS');
      console.log('   Solution: Run supabase-setup.sql in Supabase SQL Editor');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testAccess();
