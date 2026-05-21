# 📧 CONFIGURAR RESEND - GUÍA RÁPIDA

## 1️⃣ Crear Cuenta en Resend (2 minutos)

1. Ir a: https://resend.com
2. Click "Sign Up" o "Get Started"
3. Registrarse con email (usa tu email principal)
4. Verificar email
5. Dashboard abierto ✅

## 2️⃣ Obtener API Key (30 segundos)

1. En Resend Dashboard, click **"Developers"** (lado izquierdo)
2. Click **"API Keys"** 
3. Click **"Create API Key"**
4. Nombre: `vibecoder-production` (o cualquier nombre)
5. Click **"Create"**
6. **COPIAR** la key que aparece (empieza con `re_`)

**Tu key se verá así:**
```
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 3️⃣ Agregar en `.env`

Abre el archivo `.env` en la raíz del proyecto:

```bash
# Busca esta línea o agrégala:
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Reemplaza `re_xxx...` con tu API key real copiada**

## 4️⃣ Reiniciar Servidor

```bash
npm run start:api
```

Verifica que vea:
```
🚀 Backend Server running on http://localhost:5178
✅ Resend API configured
```

## 5️⃣ Testing Email

Haz una compra en `/billing`:
1. Click "Buy Now" → Stripe Checkout
2. Completa pago con tarjeta `4242 4242 4242 4242`
3. Verifica que llegó email a tu bandeja

---

## ✅ Listo

El email debe llegar automáticamente después de cada compra.

**Si no llega el email:**
1. Revisar carpeta SPAM
2. Verificar que API key es correcta en `.env`
3. Ver logs del servidor (buscas `📧 Sending email`)

---

**Próximo paso después de esto: Deploy a Producción**
