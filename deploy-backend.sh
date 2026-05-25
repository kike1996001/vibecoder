#!/bin/bash
# Deploy VibeCoder Backend to Railway
# Usage: ./deploy-backend.sh

set -e

echo "🚀 VibeCoder Backend Deployment to Railway"
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Logging into Railway..."
    railway login
fi

# Link to project or create new one
if [ ! -f "railway.json" ]; then
    echo "🔗 Creating new Railway project..."
    railway init
else
    echo "🔗 Using existing Railway project..."
    railway link
fi

# Set environment variables
echo "🔧 Setting environment variables..."
railway variable set OPENAI_API_KEY=$OPENAI_API_KEY
railway variable set ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
railway variable set FRONTEND_URL=$FRONTEND_URL
railway variable set NODE_ENV=production

# Deploy
echo "🌐 Deploying to Railway..."
railway up

echo ""
echo "✅ Backend deployment complete!"
echo ""
echo "📝 Your backend URL: $(railway status | grep 'Railway URL')"
echo ""
echo "⚠️  Update VITE_API_URL in Vercel with the Railway URL above"
