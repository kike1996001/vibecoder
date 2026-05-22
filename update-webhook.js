import https from 'https';

const STRIPE_SECRET_KEY = 'sk_test_51TZ9xM9BXGV6RzqvVPLdCtPZ5ue0ZEHJFdOby0JIyZJKcV5p6oUTfDf7aBtZ8pOCIKEfI4gT8P4KK6jAk0efXm1C00Fr8Ts13v';
const NEW_WEBHOOK_URL = 'https://vibecoder-1dgz2hu9t-eliseo-nguema-s-projects.vercel.app/api/stripe/webhook';

async function updateWebhook() {
  try {
    // Step 1: Get all webhooks
    console.log('📋 Fetching existing webhooks...');
    const webhooks = await makeRequest({
      method: 'GET',
      host: 'api.stripe.com',
      path: '/v1/webhook_endpoints',
      auth: `${STRIPE_SECRET_KEY}:`
    });

    if (!webhooks.data || webhooks.data.length === 0) {
      console.log('⚠️ No webhooks found. Creating new webhook...');
      return createWebhook();
    }

    // Find webhook with localhost endpoint
    const localWebhook = webhooks.data.find(w => w.url && w.url.includes('localhost'));
    
    if (!localWebhook) {
      console.log('⚠️ No localhost webhook found. Creating new webhook...');
      return createWebhook();
    }

    console.log(`✅ Found webhook: ${localWebhook.id}`);
    console.log(`   Current URL: ${localWebhook.url}`);
    console.log(`   Updating to: ${NEW_WEBHOOK_URL}`);

    // Step 2: Update the webhook
    const updated = await makeRequest({
      method: 'POST',
      host: 'api.stripe.com',
      path: `/v1/webhook_endpoints/${localWebhook.id}`,
      auth: `${STRIPE_SECRET_KEY}:`,
      data: {
        url: NEW_WEBHOOK_URL,
        enabled_events: ['charge.succeeded']
      }
    });

    console.log(`\n✨ Webhook updated successfully!`);
    console.log(`   ID: ${updated.id}`);
    console.log(`   URL: ${updated.url}`);
    console.log(`   Status: ${updated.status}`);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function createWebhook() {
  try {
    console.log(`Creating webhook for: ${NEW_WEBHOOK_URL}`);
    const created = await makeRequest({
      method: 'POST',
      host: 'api.stripe.com',
      path: '/v1/webhook_endpoints',
      auth: `${STRIPE_SECRET_KEY}:`,
      data: {
        url: NEW_WEBHOOK_URL,
        enabled_events: ['charge.succeeded']
      }
    });

    console.log(`\n✨ Webhook created successfully!`);
    console.log(`   ID: ${created.id}`);
    console.log(`   URL: ${created.url}`);
    return true;
  } catch (error) {
    console.error('❌ Error creating webhook:', error.message);
    process.exit(1);
  }
}

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    let body = '';
    
    if (options.data) {
      // Build form data manually to properly handle arrays
      const parts = [];
      for (const [key, value] of Object.entries(options.data)) {
        if (Array.isArray(value)) {
          value.forEach(item => {
            parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`);
          });
        } else {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      }
      body = parts.join('&');
      options.headers = options.headers || {};
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode}: ${parsed.error?.message || data}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

updateWebhook();
