# 🚀 Quick Start: Supabase Configuration

## ✅ Lo que ya hiciste:
- Creaste las 3 tablas en Supabase ✅
- Configuraste RLS y triggers ✅
- Backend está listo para conectar ✅

## 📋 Ahora solo necesitas 2 pasos:

### Paso 1: Obtener tu SECRET KEY

1. Ve a **Supabase Dashboard** → Tu Proyecto → **Settings** → **API**
2. En **Secret Keys**, busca la fila "default"
3. Haz clic en el botón "Copy" (o el ícono de copiar)
4. Copia **toda** la key (comienza con `sb_secret_`)

**Ejemplo de cómo se ve:**
```
sb_secret_TuU52jKv3L8mP9qR2sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7sT8u
```

---

### Paso 2: Actualizar `.env.local`

1. Abre el archivo `.env.local` en tu editor
2. Busca esta línea:
   ```
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_TuU52...
   ```
3. Reemplaza `sb_secret_TuU52...` con tu secret key completa
4. **Guarda el archivo** (Ctrl+S)

**Resultado final:**
```env
SUPABASE_URL=https://teedklgztytpogkjbtva.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_TuU52jKv3L8mP9qR2sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7sT8u
```

---

## 🧪 Verificar que funciona

### Test 1: Verificar conexión
```bash
node api/testSupabaseConnection.js
```

**Resultado esperado:**
```
✅ Environment variables configured
✅ user_credits - User credit balance
✅ credit_ledger - Credit transaction history
✅ subscriptions - Subscription plans
✅ RLS is working
✅ ALL TESTS PASSED!
```

---

## 🎯 Próximos comandos

### Terminal 1: Backend
```bash
npm run start:api
```
Debería ver:
```
🚀 VibeCoder API Server
✅ Port: 5178
✅ CORS: http://localhost:5173
✅ Rate Limiting: Enabled
```

### Terminal 2: Frontend
```bash
npm run dev
```
Debería abrir en: `http://localhost:5173`

---

## 🧪 Testing del Sistema Completo

### 1. Login en la app
```
Email: test@example.com
Password: cualquiera
```

### 2. Ver créditos
```
Header → Avatar → Billing
Debería mostrar: 10 créditos (gratis iniciales)
```

### 3. Generar una app
```
Home → Crear app
Debería deducir créditos automáticamente
```

### 4. Verificar historial
```
Header → Avatar → Billing → Credit History
Debería mostrar la transacción
```

---

## ⚠️ Troubleshooting

### "Missing Supabase configuration"
✅ **Solución**: Verificar que `.env.local` tiene ambas variables

### "Failed to fetch balance"
✅ **Solución**: Las tablas no se crearon. Re-ejecutar SQL en Supabase

### "RLS policy violation"
✅ **Solución**: Verificar que JWT token es válido

### "Connection refused"
✅ **Solución**: Backend no está corriendo. Ejecutar `npm run start:api`

---

## ✨ Listo! 

Una vez completado esto, tu sistema de créditos estará **100% funcional**:

- ✅ Balance real en Supabase
- ✅ Deducción automática de créditos
- ✅ Historial de transacciones
- ✅ Webhook de Stripe → Supabase
- ✅ RLS policies protegiendo datos

**¿Necesitas ayuda? Comparte los errores que ves en la terminal** 🚀
