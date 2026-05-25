# VibeCoder - Production Deployment (Quick Start)

## Frontend ✅ DONE
- **Status:** Deployed to Vercel
- **URL:** https://vibecodernew.vercel.app
- **GitHub:** https://github.com/kike1996001/vibecoder
- **Commit:** Production ready with streaming carousel UX and actual app generation

---

## Backend - Deploy via Railway GitHub Integration (Recommended)

### Step 1: Go to Railway Dashboard
1. Visit: https://railway.app/dashboard
2. Login with your Railway account
3. Click **"New Project"**

### Step 2: Deploy from GitHub
1. Select **"Deploy from GitHub repo"**
2. Authorize Railway to access GitHub
3. Select repository: **kike1996001/vibecoder**
4. Select environment: **main** branch

### Step 3: Set Environment Variables
After deployment starts, set these in Railway dashboard:

```env
NODE_ENV=production
API_PORT=3000
FRONTEND_URL=https://vibecodernew.vercel.app
OPENAI_API_KEY=sk-[your-openai-key]
ANTHROPIC_API_KEY=sk-ant-[your-anthropic-key]
```

### Step 4: Get Backend URL
- Railway will assign a public URL (e.g., `https://vibecoder-prod.railway.app`)
- Copy this URL

### Step 5: Update Vercel with Backend URL
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Click on **vibecoder_new** project
3. Settings → Environment Variables
4. Add/Update:
   ```
   VITE_API_URL=https://vibecoder-prod.railway.app
   VITE_SUPABASE_URL=https://teedklgztytpogkjbtva.supabase.co
   VITE_SUPABASE_KEY=[get-from-supabase-dashboard]
   ```
5. Click **"Save"**
6. Go to **Deployments** → Click **"Redeploy"** on latest deployment

---

## Alternative: Deploy Backend to Render (if Railway fails)

1. Visit: https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo: **kike1996001/vibecoder**
4. Build command: `npm install && npm run build:server`
5. Start command: `node server.js`
6. Set environment variables (same as above)
7. Deploy and get URL

---

## Test Production Flow

After both frontend and backend are deployed:

1. Visit: https://vibecodernew.vercel.app
2. Enter prompt: **"Counter app with increment and decrement buttons"**
3. Select provider: **OpenAI** or **Claude**
4. Click **"Generate Application"**
5. Watch streaming carousel with 4-stage progress:
   - Stage 1: Structure (0-25%)
   - Stage 2: Styling (25-50%)
   - Stage 3: Interactions (50-75%)
   - Stage 4: Polish (75-100%)
6. Generated code appears in editor
7. Preview shows live app (or graceful "preview unavailable" message)

---

## Troubleshooting

### "Missing authorization token" error
- Backend needs valid API keys (OpenAI/Anthropic)
- Check FRONTEND_URL allows requests from Vercel domain

### Preview not showing
- Normal - WebContainer sandboxing may be unavailable in production
- Generation still succeeds, files are created in editor

### Carousel not animating
- Check Framer Motion is loaded
- Check browser console for CSS/JS errors

---

## Production Checklist
- [x] Frontend deployed to Vercel
- [ ] Backend deployed to Railway/Render
- [ ] Environment variables set (VITE_API_URL)
- [ ] Test generation flow end-to-end
- [ ] Monitor error logs
- [ ] Set up error tracking (Sentry optional)

---

## Support
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Code: https://github.com/kike1996001/vibecoder
