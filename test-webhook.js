/**
 * Test Webhook Script - Simulates a Stripe webhook event locally
 * This helps verify the webhook handler works without Stripe CLI
 */

const crypto = require('crypto');

// Get the user ID from command line or use the test user email
const userId = process.argv[2] || '6f84e7c2-9e3d-4234-9c5b-1a2b3c4d5e6f'; // Will use the actual user ID
const creditsPackage = process.argv[3] || 'pro';
const sessionId = 'cs_test_' + crypto.randomBytes(16).toString('hex');

// Create a mock Stripe event
const event = {
  type: 'checkout.session.completed',
  data: {
    object: {
      id: sessionId,
      client_reference_id: userId,
      metadata: {
        creditsPackage: creditsPackage,
        credits: creditsPackage === 'starter' ? '100' : creditsPackage === 'pro' ? '500' : '2000'
      }
    }
  }
};

console.log('📧 User ID:', userId);
console.log('📦 Package:', creditsPackage);
console.log('📋 Event:', JSON.stringify(event, null, 2));
console.log('\n🚀 Sending test webhook to http://localhost:5178/api/stripe/webhook/test\n');

// Send the test webhook (no signature validation)
fetch('http://localhost:5178/api/stripe/webhook/test', {
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  body: JSON.stringify(event)
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ Webhook Response:', data);
    console.log('\n✨ Test webhook sent successfully!');
    console.log('⏳ Check the backend logs for confirmation...\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error sending webhook:', err.message);
    process.exit(1);
  });

