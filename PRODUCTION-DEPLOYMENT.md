# 🚀 VibeCoder - Production Deployment Guide (Railway + Vercel)

## Architecture
```
Frontend: React/Vite → Vercel (CDN + Caching)
Backend: Express.js → Railway (24/7 Server + SSE Streaming)
Database: PostgreSQL → Supabase (Auth + Data)
```

---

## ✅ Step 1: Frontend on Vercel (ALREADY DONE)
- **Status:** Deployed to https://vibecodernew.vercel.app
- **Framework:** Vite 6.4.2 with React 18.3
- **Build:** Production optimized (dist/ ready)

**Vercel Dashboard:** https://vercel.com/dashboard

---

## 🚀 Step 2: Backend on Railway (5 MINUTES)

### 2.1 Go to Railway Dashboard
1. Visit: https://railway.app
2. Create account or login
3. Click **"New Project"**

### 2.2 Deploy from GitHub
1. Select **"Deploy from GitHub repo"**
2. Authorize Railway to access your GitHub account
3. Search and select: **kike1996001/vibecoder**
4. Select branch: **main**
5. Railway will auto-detect Node.js and run `npm start`

### 2.3 Configure Environment Variables
After GitHub import, go to **Variables** tab in Railway:

**Add these variables:**
```
NODE_ENV = production
API_PORT = (Railway assigns automatically - typically 3000)
FRONTEND_URL = https://vibecodernew.vercel.app

ANTHROPIC_API_KEY = sk-ant-[your-key-here]
OPENAI_API_KEY = sk-[your-key-here]
GOOGLE_API_KEY = AIzaSy[your-key-here]
TOGETHER_API_KEY = [your-key-here]

SUPABASE_URL = https://teedklgztytpogkjbtva.supabase.co
SUPABASE_ANON_KEY = [get from Supabase dashboard]
SUPABASE_ADMIN_KEY = [get from Supabase dashboard - service role key]
```

**How to get API Keys:**

**Anthropic:**
- Visit: https://console.anthropic.com/api-keys
- Create key, copy entire value starting with `sk-ant-`

**OpenAI:**
- Visit: https://platform.openai.com/api-keys
- Create key, copy entire value starting with `sk-`

**Supabase Keys:**
- Visit: https://app.supabase.com/projects
- Select **vibecoder** project
- Settings → API → Copy `anon public key` and `service_role key`

### 2.4 Get Railway Backend URL
After deployment completes:
1. Go to Railway dashboard → your project
2. Click on the **web** service
3. Copy the **Domain** (will look like: `vibecoder-prod-123.railway.app`)

**Example:** `https://vibecoder-prod-abc123.railway.app`

---

## 🔗 Step 3: Connect Frontend to Backend (1 MINUTE)

### 3.1 Update Vercel Environment Variable

1. Go to **Vercel Dashboard:** https://vercel.com/dashboard
2. Click on **vibecoder_new** project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   ```
   Name: VITE_API_URL
   Value: https://vibecoder-prod-abc123.railway.app/api
   ```
   (Replace with your actual Railway domain)

### 3.2 Redeploy Frontend
1. In Vercel dashboard, click on **Deployments** tab
2. Find the latest deployment
3. Click **More** (...) → **Redeploy**
4. Wait for deployment to complete

---

## 🧪 Step 4: Test Production (2 MINUTES)

### 4.1 Test Backend API
```bash
# Check if providers are available
curl https://[your-railway-domain]/api/providers

# Should return:
# {"available":["anthropic","openai"],"default":"anthropic"}
```

### 4.2 Test Frontend
1. Visit: https://vibecodernew.vercel.app
2. Enter prompt: **"Counter app with increment and decrement buttons"**
3. Select provider: **OpenAI** (or Claude)
4. Click **"Generate Application"**

### 4.3 Expected Behavior
- ✅ Streaming carousel animates through 4 stages
- ✅ Code appears in editor as it streams
- ✅ Generation completes successfully
- ✅ Preview shows live app (or gracefully handles unavailable)

---

## 🔍 Troubleshooting

### "Cannot GET /api/providers"
- Backend not deployed or URL incorrect
- Check VITE_API_URL in Vercel
- Verify Railway domain is accessible

### "Missing authorization token"
- Backend requires valid API keys
- Check ANTHROPIC_API_KEY, OPENAI_API_KEY in Railway
- Verify Supabase keys are correct

### Generation fails after 5 seconds
- API key for provider (OpenAI/Anthropic) may be invalid
- Check Railway logs: `Railway Dashboard → Logs tab`
- Test API key directly: `curl -X POST https://[railway]/api/generate`

### Preview not showing in generated app
- Normal! WebContainer may be unavailable in production
- Generation still works, files are created correctly
- This is graceful degradation, not an error

### Railway logs show memory/timeout issues
- Railway free tier has 0.5GB memory limit
- Upgrade to Railway Hobby plan if needed
- Or increase timeout in vercel.json

---

## 📊 Production Monitoring

### Railway Logs
- Dashboard → Project → Logs tab
- Real-time server output
- Error tracking

### Vercel Analytics
- Vercel Dashboard → Analytics
- Frontend performance metrics
- Deployment history

### Supabase Logs
- https://app.supabase.com → Logs
- Database queries and auth events

---

## 🔐 Production Security Checklist

- [x] VITE_API_URL set in Vercel (points to Railway)
- [ ] All API keys configured in Railway env vars
- [ ] FRONTEND_URL in Railway matches Vercel domain
- [ ] CORS whitelist updated in server.js (should be automatic)
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting active in Express
- [ ] NODE_ENV = "production" in Railway

---

## 🚀 You're Live!

Your production stack:
- **Frontend:** https://vibecodernew.vercel.app
- **Backend API:** https://[your-railway-domain]/api
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase JWT

**Next steps:**
1. Monitor logs daily
2. Track user feedback
3. Plan feature releases
4. Scale based on usage

---

## Support & Docs

- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Repo:** https://github.com/kike1996001/vibecoder
