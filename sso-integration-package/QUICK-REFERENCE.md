# SSO Integration - Quick Reference

## One-Line Setup

```bash
./setup.sh --app-name "ISMS Application" --subdomain "isms" --port 3001
```

## Environment Variables (Auto-Generated)

```env
SSO_CLIENT_ID="client_abc123..."           # OAuth client ID
SSO_CLIENT_SECRET="secret_xyz789..."        # OAuth client secret
SSO_PROVIDER_URL="http://localhost:4000"    # Main Standarity URL
AUTH_SECRET="random_secret..."              # NextAuth secret
AUTH_URL="http://localhost:3001"            # Your app URL
NEXTAUTH_URL="http://localhost:3001"        # Your app URL
AUTH_TRUST_HOST=true                        # Trust host header
NEXT_PUBLIC_APP_NAME="ISMS Application"     # App display name
DATABASE_URL="postgresql://..."             # Shared database
```

## Files Created

| File | Purpose |
|------|---------|
| `.env.local` | OAuth credentials and config |
| `auth.js` | NextAuth SSO configuration |
| `lib/sso-auth.js` | SSO authentication library |
| `lib/prisma.js` | Database client |
| `app/api/auth/[...nextauth]/route.js` | Auth API handler |

## Common Commands

```bash
# Interactive setup
./setup.sh

# With all options
./setup.sh --app-name "App Name" --subdomain "sub" --port 3001 --standarity-path "../Standarity"

# Start main app
cd /path/to/Standarity && npm run dev

# Start your app
npm run dev

# Test SSO
# 1. Login to http://localhost:4000
# 2. Visit http://localhost:3001
# 3. Already logged in!
```

## Using Auth in Your App

### Server Components

```javascript
import { auth } from '@/auth';

const session = await auth();
console.log(session.user);
```

### Client Components

```javascript
'use client';
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
```

### Sign In/Out

```javascript
import { signIn, signOut } from 'next-auth/react';

<button onClick={() => signIn()}>Sign In</button>
<button onClick={() => signOut()}>Sign Out</button>
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Script not executable | `chmod +x setup.sh` |
| Registration failed | Check Standarity path and database |
| Deps not installed | `npm install next-auth @auth/prisma-adapter @prisma/client bcryptjs` |
| Database error | Check DATABASE_URL, ensure PostgreSQL running |
| Invalid credentials | Verify .env.local values, check admin dashboard |

## URLs

| Service | URL |
|---------|-----|
| Main App | http://localhost:4000 |
| Your App | http://localhost:3001 (or configured port) |
| Admin Dashboard | http://localhost:4000/admin/oauth-clients |
| OIDC Discovery | http://localhost:4000/.well-known/openid-configuration |

## Production Checklist

- [ ] Run setup with production URLs
- [ ] Update SSO_PROVIDER_URL to https://standarity.com
- [ ] Update AUTH_URL to https://yourapp.standarity.com
- [ ] Register production OAuth client
- [ ] Update redirect URIs in admin dashboard
- [ ] Test login flow in production
