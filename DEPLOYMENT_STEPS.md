# EU AI Act Lab - Deployment to eu-ai-act.standarity.com

## Quick Reference

**Repository:** https://github.com/amarben/eu-ai-act-lab
**Target Domain:** https://eu-ai-act.standarity.com
**Latest Commit:** e0a3db8 (Quick Wins AI enhancements)

---

## Step 1: Deploy to Vercel via SSH

Run these commands in your terminal:

```bash
# Navigate to project directory
cd "/Users/amarbendou/Documents/Claude/EU AI Act Lab"

# Deploy using npx (interactive)
npx vercel
```

### During Interactive Setup:

1. **Login prompt**: Follow the authentication flow
2. **Set up and deploy?** → `Y` (Yes)
3. **Which scope?** → Select your Vercel account
4. **Link to existing project?** → `N` (No - create new)
5. **What's your project's name?** → `eu-ai-act-lab`
6. **In which directory is your code located?** → `./` (press Enter)
7. **Override settings?** → `N` (No - use detected settings)

This will create a preview deployment. Note the URL provided (e.g., `eu-ai-act-lab-xyz.vercel.app`)

---

## Step 2: Configure Production Environment Variables

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project: `eu-ai-act-lab`
3. Go to **Settings** → **Environment Variables**
4. Add the following variables (select **Production** environment):

```env
# Database (Required)
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require

# Authentication (Required)
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://eu-ai-act.standarity.com

# AI Integration (Required)
GEMINI_API_KEY=<your-gemini-api-key>

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://eu-ai-act.standarity.com

# Optional but Recommended
GEMINI_RATE_LIMIT_PER_MINUTE=60
GEMINI_RATE_LIMIT_PER_DAY=1500
```

### Option B: Via CLI

```bash
# Add environment variables one by one
npx vercel env add DATABASE_URL production
# Paste value when prompted

npx vercel env add NEXTAUTH_SECRET production
# Generate and paste: openssl rand -base64 32

npx vercel env add NEXTAUTH_URL production
# Value: https://eu-ai-act.standarity.com

npx vercel env add GEMINI_API_KEY production
# Paste your Gemini API key

npx vercel env add NEXT_PUBLIC_APP_URL production
# Value: https://eu-ai-act.standarity.com

npx vercel env add NODE_ENV production
# Value: production
```

---

## Step 3: Set Up Production Database

### Recommended: Vercel Postgres

```bash
# In Vercel Dashboard:
1. Go to your project
2. Storage tab → Create Database → Postgres
3. DATABASE_URL will be automatically added to env vars
```

### Alternative: Neon (Serverless Postgres)

1. Sign up at https://neon.tech
2. Create new project
3. Copy connection string
4. Add as DATABASE_URL environment variable

### Alternative: Supabase

1. Sign up at https://supabase.com
2. Create new project
3. Go to Project Settings → Database
4. Copy connection string (select "Connection pooling" mode)
5. Add as DATABASE_URL environment variable

---

## Step 4: Deploy to Production

```bash
# Deploy to production with environment variables
npx vercel --prod

# This will:
# - Build the Next.js app
# - Run database migrations
# - Deploy to production
# - Provide production URL
```

---

## Step 5: Add Custom Domain

### Via Vercel Dashboard (Easier):

1. Go to Project Settings → **Domains**
2. Click **Add Domain**
3. Enter: `eu-ai-act.standarity.com`
4. Click **Add**
5. Follow DNS configuration instructions shown

### Via CLI:

```bash
npx vercel domains add eu-ai-act.standarity.com

# Follow prompts to verify domain ownership
```

---

## Step 6: Configure DNS

Go to your DNS provider (where standarity.com is registered) and add:

### Option A: CNAME Record (Recommended)

```
Type: CNAME
Name: eu-ai-act
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

### Option B: A Record

```
Type: A
Name: eu-ai-act
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

**DNS Propagation**: May take 5-60 minutes

---

## Step 7: Verify Deployment

Once DNS propagates:

```bash
# Test the deployment
curl https://eu-ai-act.standarity.com

# Or visit in browser
open https://eu-ai-act.standarity.com
```

### Post-Deployment Checklist

- [ ] Homepage loads correctly
- [ ] User can register/login
- [ ] Can create a gap assessment
- [ ] Can export gap assessment as PDF
- [ ] AI-generated content appears in PDFs (all 5 Quick Wins)
- [ ] Technical documentation works
- [ ] Risk management works
- [ ] No console errors

---

## Quick Commands Summary

```bash
# Full deployment sequence
cd "/Users/amarbendou/Documents/Claude/EU AI Act Lab"

# Initial deployment (interactive)
npx vercel

# Set environment variables (use dashboard instead for easier setup)
# See Step 2 above

# Deploy to production
npx vercel --prod

# Add custom domain
npx vercel domains add eu-ai-act.standarity.com

# Check deployment status
npx vercel ls

# View deployment logs
npx vercel logs
```

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `NEXTAUTH_SECRET` | Auth secret (32+ chars) | Output of `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Production URL | `https://eu-ai-act.standarity.com` |
| `GEMINI_API_KEY` | Google Gemini API key | Get from https://aistudio.google.com/app/apikey |
| `NODE_ENV` | Environment | `production` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `https://eu-ai-act.standarity.com` |

### Optional but Recommended

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_RATE_LIMIT_PER_MINUTE` | AI API rate limit | `60` |
| `GEMINI_RATE_LIMIT_PER_DAY` | Daily AI API limit | `1500` |
| `SENTRY_DSN` | Error tracking | - |
| `EMAIL_FROM` | Notification email | `noreply@standarity.com` |

---

## Troubleshooting

### Build Fails

```bash
# Check build logs
npx vercel logs

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Type errors (run: npm run type-check)
```

### Domain Not Working

```bash
# Check DNS configuration
npx vercel domains inspect eu-ai-act.standarity.com

# Common issues:
# - DNS not propagated yet (wait 5-60 min)
# - Wrong DNS records
# - SSL certificate pending
```

### Database Migration Issues

```bash
# Run migrations manually
npx vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-) npx prisma migrate deploy
```

### AI Features Not Working

- Check `GEMINI_API_KEY` is set correctly
- Verify API key has quota remaining
- Check Vercel function logs for errors

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Support**: https://vercel.com/support

---

**Last Updated**: January 9, 2026
**Deployment Status**: Ready for production
**Latest Commit**: e0a3db8 - Quick Wins AI enhancements
