/**
 * Get User ID from Supabase and Test Webhook
 * This script queries Supabase to find the user ID, then simulates a webhook event
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'https://teedklgztytpogkjbtva.supabase.co',
  'sb_secret_TuU52WQwhRrYXYbqwEBIOA_vxLm6s-p' // Service role key
);

const email = 'delfinachemabiebeda@gmail.com';
const creditsPackage = 'pro';

async function testWebhook() {
  try {
    // 1. Get user from Supabase auth
    console.log('🔍 Looking up user:', email);
    
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error(`User not found: ${email}`);
    }
    
    const userId = user.id;
    console.log('✅ Found user ID:', userId);
    
    // 2. Check current balance
    console.log('\n📊 Checking current credit balance...');
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (creditsError) throw creditsError;
    console.log('Current balance:', credits.balance, 'credits');
    
    // 3. Create a mock Stripe event
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_' + Math.random().toString(36).substring(7),
          client_reference_id: userId,
          metadata: {
            creditsPackage: creditsPackage,
            credits: creditsPackage === 'starter' ? '100' : creditsPackage === 'pro' ? '500' : '2000'
          }
        }
      }
    };
    
    const creditsToAdd = creditsPackage === 'starter' ? 100 : creditsPackage === 'pro' ? 500 : 2000;
    
    console.log('\n📦 Simulating', creditsPackage, 'purchase (+' + creditsToAdd + ' credits)');
    console.log('📋 Webhook event:', JSON.stringify(event, null, 2));
    
    // 4. Send webhook to backend
    console.log('\n🚀 Sending test webhook to http://localhost:5178/api/stripe/webhook/test\n');
    
    const response = await fetch('http://localhost:5178/api/stripe/webhook/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event)
    });
    
    const responseData = await response.json();
    console.log('✅ Webhook Response:', responseData);
    
    // 5. Check new balance
    console.log('\n⏳ Waiting 1 second for database update...');
    await new Promise(r => setTimeout(r, 1000));
    
    const { data: newCredits, error: newCreditsError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (newCreditsError) throw newCreditsError;
    console.log('✅ New balance:', newCredits.balance, 'credits');
    
    if (newCredits.balance === credits.balance + creditsToAdd) {
      console.log('\n🎉 SUCCESS! Credits were added correctly!');
      console.log('   Expected:', credits.balance + creditsToAdd);
      console.log('   Actual:', newCredits.balance);
    } else {
      console.log('\n⚠️  WARNING: Balance did not update as expected');
      console.log('   Expected:', credits.balance + creditsToAdd);
      console.log('   Actual:', newCredits.balance);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testWebhook();
