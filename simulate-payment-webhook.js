/**
 * Simula un webhook de Stripe para prueba de pago
 * Usa el endpoint /api/stripe/webhook/test (sin validación de firma)
 */

const userId = 'e6606ad0-3ebf-4208-a059-ff8797a76252'; // Tu ID real de usuario de Supabase

// El ID de sesión del pago que acabas de hacer
const sessionId = 'cs_test_a1KCR5FThOhu821Vd9CtuvqI1noqUObRepydTYJUvphiObuxtPR5dMGrJp';

const webhookPayload = {
  id: 'evt_test_' + Date.now(),
  type: 'checkout.session.completed',
  data: {
    object: {
      id: sessionId,
      object: 'checkout.session',
      client_reference_id: userId,
      amount_total: 3999, // $39.99 en centavos
      currency: 'usd',
      payment_status: 'paid',
      metadata: {
        creditsPackage: 'pro'
      },
      customer_details: {
        email: 'delfinachemabiebeda@gmail.com'
      }
    }
  }
};

console.log('📤 Enviando webhook simulado...');
console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

fetch('http://localhost:5178/api/stripe/webhook/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(webhookPayload)
})
  .then(res => res.json())
  .then(data => {
    console.log('\n✅ Webhook enviado exitosamente!');
    console.log('Response:', data);
    console.log('\n📋 Lo que debería haber pasado:');
    console.log('  1. ✅ Webhook recibido en /api/stripe/webhook/test');
    console.log('  2. ✅ Créditos añadidos a la BD (500 créditos más)');
    console.log('  3. ✅ Email enviado a delfinachemabiebeda@gmail.com');
    console.log('\n💡 Tip: Verifica tu email en 30 segundos');
  })
  .catch(err => {
    console.error('\n❌ Error al enviar webhook:', err.message);
  });
