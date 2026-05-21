# ============================================
# CONFIGURACIÓN SUPABASE - VibeCoder
# ============================================

# 🔧 PASOS DE CONFIGURACIÓN:

## 1. Copia tu secret key completa
# Ve a: Supabase Dashboard → Settings → API
# Copia toda la secret key (no solo sb_secret_...)
# La secret key siempre comienza con: sb_secret_

## 2. Crea archivo .env en la raíz del proyecto
# (Si ya existe, solo actualiza estos valores)

# Backend - SUPABASE (NUNCA compartir publicamente)
SUPABASE_URL=https://teedklgztytpogkjbtva.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_TuU52... # 👈 COPIA AQUÍ tu secret key completa

# Frontend - SUPABASE (Estos SÍ son públicos)
VITE_SUPABASE_URL=https://teedklgztytpogkjbtva.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_goLj7l6-C3n6vKxdFjst_w_82W7PRUn

# ============================================
# CÓMO OBTENER TU SECRET KEY COMPLETA
# ============================================

# Opción 1: Desde Supabase Dashboard
# 1. Ir a: https://app.supabase.com
# 2. Selecciona tu proyecto
# 3. Settings → API
# 4. En "Secret keys" → Copia el valor de "default"
# 5. Pégalo aquí: SUPABASE_SERVICE_ROLE_KEY=<AQUI>

# Opción 2: Desde Terminal (si usas Supabase CLI)
# supabase projects api-keys list

# ⚠️ IMPORTANTE:
# - NUNCA hagas commit de .env al Git
# - NUNCA compartas tu service role key públicamente
# - Solo guarda en .env local

# ============================================
# VERIFICACIÓN
# ============================================

# Una vez configurado, el backend podrá:
# ✅ Leer balance de créditos
# ✅ Escribir transacciones
# ✅ Actualizar usuario créditos
# ✅ Procesar webhook de Stripe

echo "✅ Configuración lista. Reinicia el servidor: npm run start:api"
