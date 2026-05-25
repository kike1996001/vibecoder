#!/bin/bash
# Deploy VibeCoder to Production
# Usage: ./deploy.sh

set -e

echo "🚀 VibeCoder Production Deployment"
echo "===================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm install -g vercel"
    exit 1
fi

# Step 1: Build
echo "📦 Building frontend..."
npm run build

# Step 2: Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - VITE_API_URL: [Your backend URL]"
echo "   - VITE_SUPABASE_URL: https://teedklgztytpogkjbtva.supabase.co"
echo "   - VITE_SUPABASE_KEY: [Your Supabase anon key]"
echo ""
echo "2. Deploy backend to Railway/Render"
echo "3. Update VITE_API_URL with backend URL"
echo "4. Visit your Vercel URL to test"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
