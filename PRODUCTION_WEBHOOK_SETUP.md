# 🚀 CONFIGURACIÓN WEBHOOKS REALES - PRODUCCIÓN

## PASO 1: Autenticarse con Stripe CLI

```bash
stripe login
```

**Qué hace:**
- Abre una ventana del navegador con URL: https://dashboard.stripe.com/stripecli/confirm_auth?t=...
- Muestra un código de emparejamiento (ej: avidly-stable-praise-wonder)
- Copia este código y pégalo en la terminal

**Esperado:**
```
✔ Authenticated with Stripe account (punto9)
Saved API key to /Users/osman/.config/stripe/config.json
```

---

## PASO 2: Escuchar Webhooks Locales

```bash
stripe listen --forward-to localhost:5178/api/stripe/webhook
```

**Qué hace:**
- Abre un túnel entre Stripe y tu servidor local
- Redirecciona eventos de Stripe a `localhost:5178/api/stripe/webhook`
- Genera un webhook signing secret

**Esperado:**
```
> Ready! You are now listening for Stripe events on your cmd line Dashboard.

Ready to accept incoming webhook events. To view events in the real-time logs, head over to the Stripe CLI documentation.

Your webhook signing secret is: whsec_test_4eC39HqLyjWDarH5ynHfEeYb (for testing)
whsec_live_xxxxxxxxxxxxx (para producción)

Keep this secret safe! 🔐
```

---

## PASO 3: Copiar Webhook Secret

El comando anterior genera una línea como:
```
Your webhook signing secret is: whsec_test_4eC39HqLyjWDarH5ynHfEeYb
```

**O en producción:**
```
Your webhook signing secret is: whsec_live_xxxxxxxxxxxxx
```

---

## PASO 4: Actualizar `.env`

Reemplaza la línea en `.env`:

```bash
# ANTES:
STRIPE_WEBHOOK_SECRET=whsec_test_4eC39HqLyjWDarH5ynHfEeYb

# DESPUÉS (pega el nuevo secret de Stripe CLI):
STRIPE_WEBHOOK_SECRET=whsec_test_4eC39HqLyjWDarH5ynHfEeYb
```

---

## PASO 5: Reiniciar Servidor Backend

```bash
npm run start:api
```

Verifica que se inicia sin errores:
```
🚀 Backend Server running on http://localhost:5178
✅ Stripe webhook secret loaded: whsec_test_...
```

---

## PASO 6: Testing Webhooks Reales

### Test 1: Webhook de Prueba Manual
```bash
# En otra terminal, MIENTRAS Stripe CLI está escuchando:
curl -X POST http://localhost:5178/api/stripe/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123456",
        "metadata": {
          "userId": "tu-user-id",
          "creditsPackage": "pro"
        }
      }
    }
  }'
```

### Test 2: Compra Real Vía UI
1. Ir a http://localhost:5173/billing
2. Click "Buy Now" en cualquier paquete
3. Completar pago con tarjeta de prueba: `4242 4242 4242 4242`
4. Verificar en terminal de Stripe CLI:
   ```
   checkout.session.completed event received!
   ✅ Credits updated in database
   ```

---

## PASO 7: Email Confirmación (OPCIONAL - PRODUCCIÓN)

### 7.1: Instalar Proveedor Email (Resend, SendGrid, o Mailgun)

**Opción A: Resend (Recomendado)**
```bash
npm install resend
```

**Opción B: SendGrid**
```bash
npm install @sendgrid/mail
```

### 7.2: Agregar Variable de Entorno

```bash
# .env
RESEND_API_KEY=re_xxxxxxxxxxxxx
# O
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

### 7.3: Crear Servicio de Email

**Archivo: `src/services/emailService.ts`**

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentConfirmation(email: string, amount: number, credits: number) {
  try {
    const result = await resend.emails.send({
      from: 'noreply@vibecoder.com',
      to: email,
      subject: '🎉 Payment Confirmed - Credits Added',
      html: `
        <h2>Payment Successful!</h2>
        <p>Your payment of $${(amount / 100).toFixed(2)} was processed successfully.</p>
        <p><strong>${credits} credits</strong> have been added to your account.</p>
        <p><a href="http://localhost:5173/billing">View your account</a></p>
      `,
    });
    
    console.log('✅ Email sent:', result.id);
    return result;
  } catch (error) {
    console.error('❌ Email send failed:', error);
  }
}
```

### 7.4: Integrar en Webhook

**Archivo: `server.js` - Endpoint `POST /api/stripe/webhook`**

```javascript
import { sendPaymentConfirmation } from './src/services/emailService.js';

// En el event handler
if (event.type === 'checkout.session.completed') {
  const sessionId = event.data.object.id;
  const userId = event.data.object.metadata.userId;
  const creditsPackage = event.data.object.metadata.creditsPackage;
  
  // 1. Obtener usuario
  const user = await supabaseClient.auth.admin.getUserById(userId);
  const userEmail = user.user.email;
  
  // 2. Calcular credits
  const creditsMap = { starter: 100, pro: 500, enterprise: 2000 };
  const credits = creditsMap[creditsPackage] || 100;
  
  // 3. Agregar créditos
  await addCreditTransaction(userId, credits, 'stripe_payment', { sessionId });
  
  // 4. Enviar email
  await sendPaymentConfirmation(userEmail, event.data.object.amount_total, credits);
}
```

---

## ✅ CHECKLIST PRODUCCIÓN

- [ ] Stripe CLI autenticado (`stripe login`)
- [ ] Webhook secret actualizado en `.env`
- [ ] Servidor backend reiniciado
- [ ] Prueba manual de webhook exitosa
- [ ] Prueba de compra real exitosa
- [ ] Email de confirmación en producción (opcional)
- [ ] Monitoreo de webhooks en Stripe Dashboard

---

## 🔍 DEBUGGING WEBHOOKS

### Ver Eventos en Tiempo Real
```bash
stripe events list  # En otra terminal mientras escuchas
```

### Ver Logs del Servidor
El backend imprime eventos:
```
✅ [Webhook] Received checkout.session.completed
📝 User ID: e6606ad0-3ebf-4208-a059-ff8797a76252
💳 Credits: 500
✅ [Webhook] Credits added successfully
```

### Reenviar Webhooks Fallidos
En dashboard de Stripe:
1. Ir a: https://dashboard.stripe.com/acct_1TZ9xM9BXGV6Rzqv/test/webhook_endpoints
2. Click en el webhook endpoint
3. Click "Send test event" → "checkout.session.completed"

---

## 📱 PRODUCCIÓN (DESPUÉS DE DEPLOY)

Cuando subas a producción:

```bash
# En servidor producción:
stripe login --api-key sk_live_xxxxxxxxxxxxx

stripe listen --forward-to https://tuapp.com/api/stripe/webhook

# Actualizar .env en producción:
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxxxxxxxxxx
```

---

## ❌ PROBLEMAS COMUNES

### "Webhook signature verification failed"
**Solución**: Asegurate que:
- El webhook secret en `.env` coincide con Stripe CLI output
- Reiniciaste el servidor backend
- El body del request no fue modificado

### "No webhook events appearing"
**Solución**:
- Verifica que Stripe CLI está corriendo: `stripe listen --forward-to...`
- Verifica que el backend escucha en puerto 5178
- Comprueba firewall/antivirus no bloquea conexiones

### "Endpoint `/api/stripe/webhook` returns 404"
**Solución**:
- Asegúrate que el servidor backend está corriendo
- Verifica que el endpoint existe en `server.js`
- Intenta con `/api/stripe/webhook/test` (no requiere verificación)

---

## 📝 REFERENCIAS

- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Webhook Signature Verification](https://stripe.com/docs/webhooks/signatures)
- [Event Types](https://stripe.com/docs/api/events)
