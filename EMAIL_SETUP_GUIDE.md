# 📧 INTEGRACIÓN EMAIL - GUÍA PRODUCCIÓN

## OPCIÓN 1: Resend (Recomendado - Más Fácil)

### 1. Crear Cuenta en Resend
- Ir a: https://resend.com
- Registrarse con email
- Ir a Settings → API Keys
- Copiar API Key

### 2. Instalar Resend
```bash
npm install resend
```

### 3. Agregar Variable de Entorno
```bash
# .env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### 4. Usar en Backend (server.js)

```javascript
import { sendPaymentConfirmation } from './emailService.cjs';

// En el webhook de Stripe
if (event.type === 'checkout.session.completed') {
  const { object } = event.data;
  const { metadata, amount_total } = object;
  
  // Obtener usuario
  const { data: userData, error } = await supabaseClient.auth.admin.getUserById(metadata.userId);
  if (error || !userData.user) {
    console.error('❌ User not found');
    return;
  }
  
  // Enviar email
  await sendPaymentConfirmation(
    userData.user.email,
    amount_total,
    creditsMap[metadata.creditsPackage],
    metadata.creditsPackage
  );
}
```

---

## OPCIÓN 2: SendGrid

### 1. Crear Cuenta en SendGrid
- Ir a: https://sendgrid.com
- Registrarse
- Ir a Settings → API Keys
- Generar una API Key

### 2. Instalar SendGrid
```bash
npm install @sendgrid/mail
```

### 3. Agregar Variables de Entorno
```bash
# .env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@tuapp.com
```

---

## OPCIÓN 3: SMTP (Gmail, AWS SES, etc.)

### 1. Habilitar SMTP en Gmail

**Para Gmail:**
1. Habilitar "2-Step Verification"
2. Crear "App Password" en: https://myaccount.google.com/apppasswords
3. Usar la contraseña generada

### 2. Agregar Variables de Entorno
```bash
# .env - Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tumail@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # App password (con espacios)
SMTP_FROM=tumail@gmail.com
```

**Para AWS SES:**
```bash
# .env - AWS SES SMTP
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-user
SMTP_PASSWORD=your-ses-password
SMTP_FROM=verified@domain.com
```

---

## PASO 7: Integración Completa en server.js

Agregar al archivo `/server.js`:

```javascript
// Al inicio del archivo
import { sendPaymentConfirmation } from './emailService.cjs';

// En el webhook POST /api/stripe/webhook
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed');
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const sessionId = event.data.object.id;
      const { userId, creditsPackage } = event.data.object.metadata || {};

      if (!userId) {
        console.warn('⚠️ No userId in webhook metadata');
        return res.json({ received: true });
      }

      try {
        // 1. Obtener usuario
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
        if (userError || !userData.user) {
          console.error('❌ User not found:', userId);
          return res.json({ received: true });
        }

        const userEmail = userData.user.email;

        // 2. Calcular créditos
        const creditsMap = { 
          starter: 100,
          pro: 500,
          enterprise: 2000 
        };
        const creditsToAdd = creditsMap[creditsPackage] || 100;

        // 3. Agregar créditos
        const { error: creditError } = await addCreditTransaction(
          userId,
          creditsToAdd,
          'stripe_payment',
          { sessionId }
        );

        if (creditError) {
          console.error('❌ Credit update failed:', creditError);
        } else {
          console.log(`✅ Added ${creditsToAdd} credits to ${userId}`);

          // 4. ENVIAR EMAIL (NUEVO)
          const amountTotal = event.data.object.amount_total;
          const emailSent = await sendPaymentConfirmation(
            userEmail,
            amountTotal,
            creditsToAdd,
            creditsPackage
          );

          if (emailSent) {
            console.log(`✅ Confirmation email sent to ${userEmail}`);
          } else {
            console.warn(`⚠️ Email send failed for ${userEmail} (but credits were added)`);
          }
        }
      } catch (error) {
        console.error('❌ Webhook error:', error.message);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## ✅ CHECKLIST EMAIL PRODUCCIÓN

- [ ] Elegir proveedor de email (Resend/SendGrid/SMTP)
- [ ] Crear cuenta y obtener API Key
- [ ] Instalar dependencia (`npm install resend` u otro)
- [ ] Agregar variables de entorno en `.env`
- [ ] Integrar emailService.cjs en server.js
- [ ] Actualizar webhook para llamar `sendPaymentConfirmation()`
- [ ] Probar enviando email de prueba
- [ ] Verificar que emails llegan a bandeja

---

## 🧪 TESTING EMAIL

### Test 1: Email de Prueba Manual
```bash
# Desde Node.js REPL
import { sendPaymentConfirmation } from './emailService.cjs';

await sendPaymentConfirmation(
  'tumail@example.com',
  3999,           // $39.99 en cents
  500,            // 500 créditos
  'pro'           // paquete
);
```

### Test 2: Webhook de Prueba
```bash
stripe trigger charge.succeeded
```

### Test 3: Compra Real
1. Ir a http://localhost:5173/billing
2. Click "Buy Now"
3. Completar pago
4. Verificar email en bandeja

---

## 🔧 DEBUGGING EMAIL

### Email no llega
1. Verificar que API Key es correcta
2. Verificar que el email destino es válido
3. Ver logs del servidor: `console.log` debe mostrar ✅
4. Revisar carpeta SPAM

### Error "API Key not found"
1. Verificar que `.env` tiene la variable
2. Reiniciar servidor: `npm run start:api`
3. Revisar que la variable está exportada: `process.env.RESEND_API_KEY`

### Error "SMTP Authentication failed"
1. Verificar credenciales SMTP
2. Para Gmail: Usar "App Password" no contraseña normal
3. Para AWS SES: Verificar que el email está autorizado

---

## 📱 PRODUCCIÓN - DEPLOY

### En servidor de producción:

```bash
# 1. Instalar paquete
npm install resend

# 2. Agregar variables en producción
export RESEND_API_KEY=re_xxxxxxxxxxxxx
export STRIPE_WEBHOOK_SECRET=whsec_live_xxxxx

# 3. Reiniciar servidor
pm2 restart server.js
```

---

## 📊 TEMPLATES EMAIL LISTOS

El archivo `emailService.cjs` incluye templates para:

1. **Confirmación de Pago** ✅
   ```
   - Monto pagado
   - Créditos agregados
   - Link a dashboard
   ```

2. **Confirmación de Generación** (Opcional)
   ```
   - Nombre de app
   - Créditos usados
   - Créditos restantes
   ```

3. **Alerta de Créditos Bajos** (Opcional)
   ```
   - Créditos restantes
   - Link para comprar más
   ```

---

## 📞 SOPORTE

Si tienes problemas con email en producción:

1. Resend Support: https://resend.com/support
2. SendGrid Support: https://sendgrid.com/docs/
3. AWS SES Docs: https://docs.aws.amazon.com/ses/
