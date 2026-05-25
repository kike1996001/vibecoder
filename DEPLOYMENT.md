# 🚀 Deployment Guide - VibeCoder

## Frontend Deployment (Vercel)

### Step 1: Connect to GitHub
```bash
# Push to GitHub first
git add .
git commit -m "Ready for production"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select "Next.js" as framework (or Vite)
4. Set environment variables:
   - `VITE_API_URL`: Your backend API URL (e.g., https://vibecoder-api.railway.app)
   - `VITE_SUPABASE_URL`: https://teedklgztytpogkjbtva.supabase.co
   - `VITE_SUPABASE_KEY`: Your Supabase anon key

### Step 3: Deploy Backend (Express Server)

#### Option A: Railway.app (Recommended)
1. Go to https://railway.app
2. Create new project → Deploy from GitHub
3. Select your repository
4. Add these environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ANTHROPIC_API_KEY`: Your Anthropic API key  
   - `API_PORT`: 5178 (Railway will override this)
   - `FRONTEND_URL`: Your Vercel frontend URL

#### Option B: Render.com
1. Go to https://render.com
2. Create new → Web Service
3. Connect GitHub repository
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add same environment variables as above

#### Option C: Railway (via CLI)
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

## Database Setup

### Supabase (Already Configured)
Database is already set up at: https://teedklgztytpogkjbtva.supabase.co

Make sure tables exist:
- `projects`
- `generation_history`
- `credits`
- `users`

## Environment Variables Checklist

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.com
VITE_SUPABASE_URL=https://teedklgztytpogkjbtva.supabase.co
VITE_SUPABASE_KEY=your_anon_key
```

### Backend (.env)
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
API_PORT=5178
FRONTEND_URL=https://your-frontend.vercel.app
DATABASE_URL=postgresql://...
NODE_ENV=production
```

## Testing Production Deployment

1. Visit your Vercel URL
2. Try generating a counter app
3. Check network requests go to correct API URL
4. Verify database writes work (Supabase)

## Troubleshooting

### CORS Issues
- Update `ALLOWED_ORIGINS` in server.js
- Make sure frontend URL is whitelisted

### API Timeouts
- Increase timeout in Render/Railway settings
- Check backend logs for errors

### WebContainer Issues
- WebContainer will still fail (Stackblitz API blocked)
- Generation will work without preview (as designed)

## Domain Setup (Optional)

```bash
# Point your custom domain to Vercel
# In your domain registrar:
# - Add CNAME: your-domain.com → cname.vercel.com
# - Add CNAME: api.your-domain.com → railway endpoint
```

## Monitoring

- **Frontend**: Vercel Analytics Dashboard
- **Backend**: Railway/Render logs
- **Database**: Supabase Dashboard

---

**Next Steps:**
1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Update API URL in Vercel env vars
4. Test generation flow
5. Monitor performance
