#!/bin/bash

# EU AI Act Lab - Vercel Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 EU AI Act Lab - Vercel Deployment"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${BLUE}📍 Current directory:${NC} $(pwd)"
echo ""

# Step 1: Initial Vercel deployment
echo -e "${YELLOW}Step 1: Initialize Vercel Project${NC}"
echo "-----------------------------------"
echo "This will deploy your app to Vercel"
echo ""
echo "During setup, please answer:"
echo "  - Set up and deploy? → Y"
echo "  - Which scope? → Select your account"
echo "  - Link to existing project? → N"
echo "  - Project name? → eu-ai-act-lab"
echo "  - Code location? → ./"
echo "  - Override settings? → N"
echo ""
read -p "Press Enter to start deployment..."

npx vercel

echo ""
echo -e "${GREEN}✅ Preview deployment complete!${NC}"
echo ""

# Step 2: Environment variables reminder
echo -e "${YELLOW}Step 2: Configure Environment Variables${NC}"
echo "----------------------------------------"
echo ""
echo "⚠️  IMPORTANT: Before deploying to production, you must set environment variables!"
echo ""
echo "Choose one of these methods:"
echo ""
echo "Method A - Via Vercel Dashboard (Recommended):"
echo "  1. Go to: https://vercel.com/dashboard"
echo "  2. Select your project: eu-ai-act-lab"
echo "  3. Settings → Environment Variables"
echo "  4. Add these variables (select 'Production'):"
echo ""
echo "     DATABASE_URL=<your-postgres-url>"
echo "     NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "     NEXTAUTH_URL=https://eu-ai-act.standarity.com"
echo "     GEMINI_API_KEY=<your-gemini-key>"
echo "     NEXT_PUBLIC_APP_URL=https://eu-ai-act.standarity.com"
echo "     NODE_ENV=production"
echo ""
echo "Method B - Via CLI:"
echo "  Run: npx vercel env add <VARIABLE_NAME> production"
echo "  Repeat for each variable above"
echo ""
read -p "Have you configured environment variables? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${RED}⚠️  Stopping deployment${NC}"
    echo "Please configure environment variables first, then run:"
    echo "  npx vercel --prod"
    exit 1
fi

# Step 3: Production deployment
echo ""
echo -e "${YELLOW}Step 3: Deploy to Production${NC}"
echo "------------------------------"
echo ""
read -p "Ready to deploy to production? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Deploying to production..."
    npx vercel --prod

    echo ""
    echo -e "${GREEN}✅ Production deployment complete!${NC}"
else
    echo ""
    echo -e "${YELLOW}Skipping production deployment${NC}"
    echo "To deploy later, run: npx vercel --prod"
fi

# Step 4: Custom domain
echo ""
echo -e "${YELLOW}Step 4: Add Custom Domain${NC}"
echo "-------------------------"
echo ""
read -p "Add custom domain eu-ai-act.standarity.com? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Adding custom domain..."
    npx vercel domains add eu-ai-act.standarity.com || true

    echo ""
    echo -e "${BLUE}📋 DNS Configuration Required:${NC}"
    echo ""
    echo "Add this DNS record to your domain registrar:"
    echo ""
    echo "  Type: CNAME"
    echo "  Name: eu-ai-act"
    echo "  Value: cname.vercel-dns.com"
    echo "  TTL: 3600"
    echo ""
    echo "DNS propagation may take 5-60 minutes"
else
    echo ""
    echo -e "${YELLOW}Skipping domain configuration${NC}"
    echo "To add later, run: npx vercel domains add eu-ai-act.standarity.com"
fi

# Summary
echo ""
echo "=================================="
echo -e "${GREEN}🎉 Deployment Process Complete!${NC}"
echo "=================================="
echo ""
echo "Next steps:"
echo "  1. Wait for DNS propagation (if you added domain)"
echo "  2. Visit: https://eu-ai-act.standarity.com"
echo "  3. Test all features (login, gap assessment, PDF export)"
echo "  4. Monitor logs: npx vercel logs"
echo ""
echo "Useful commands:"
echo "  - View deployments: npx vercel ls"
echo "  - View logs: npx vercel logs"
echo "  - Check domain: npx vercel domains ls"
echo "  - Pull env vars: npx vercel env pull"
echo ""
echo -e "${BLUE}📖 Full deployment guide: DEPLOYMENT_STEPS.md${NC}"
echo ""
