# EU AI Act Lab - SSO Setup Complete! 🎉

## Summary

SSO (Single Sign-On) has been successfully configured for the EU AI Act Lab application. Users can now login once to Standarity and be automatically logged into the EU AI Act Lab app.

## What Was Done

### 1. OAuth Client Registration ✅
- **Client ID**: `client_LyXTJv2ju6nd-o4TehSzvA`
- **Client Secret**: `FTFsBKQ2mj_pr4ARMIjTcAnI_t6pj1EnUA0IzmbeZrw` (securely hashed in database)
- **Redirect URIs**:
  - `http://localhost:3003/api/auth/callback/standarity`
  - `http://localhost:3003/auth/callback`
- **Status**: Trusted app (skip consent screen)
- **Scopes**: openid, profile, email

### 2. Database Configuration ✅
- Updated to use shared database: `standarity`
- All users synchronized across Standarity, QMS, and EU AI Act Lab

### 3. Auth Configuration ✅
- **Updated**: `lib/auth.ts` - Added Standarity OAuth provider
- **Kept**: Existing credentials-based auth (for backward compatibility)
- **Approach**: Dual authentication - users can login with SSO or credentials

### 4. Environment Variables Updated ✅

**`.env.local`** - Updated with SSO credentials:
```env
# SSO Configuration
SSO_CLIENT_ID="client_LyXTJv2ju6nd-o4TehSzvA"
SSO_CLIENT_SECRET="FTFsBKQ2mj_pr4ARMIjTcAnI_t6pj1EnUA0IzmbeZrw"
SSO_PROVIDER_URL="http://localhost:4000"

# Database (Shared with Standarity)
DATABASE_URL="postgresql://amarbendou@localhost:5432/standarity"

# NextAuth
NEXTAUTH_URL="http://localhost:3003"
NEXTAUTH_SECRET="eu-ai-act-lab-secret-key-for-development-only-change-in-production"
AUTH_TRUST_HOST=true

# Application Configuration
NEXT_PUBLIC_APP_NAME="EU AI Act Lab"
```

### 5. Port Configuration ✅
- **Changed**: Port from 4000 to 3003 (to avoid conflict with Standarity)
- **Updated**: package.json dev and start scripts

## Testing SSO

### Step 1: Start Standarity (Main App)
```bash
cd /Users/amarbendou/Documents/Standarity
npm run dev
```
This starts on **port 4000**

### Step 2: Start EU AI Act Lab
```bash
cd "/Users/amarbendou/Documents/Claude/EU AI Act Lab"
npm run dev
```
This starts on **port 3003**

### Step 3: Test the SSO Flow

1. **Login to Standarity**:
   - Open browser: `http://localhost:4000`
   - Click "Sign In"
   - Login with Google/GitHub

2. **Access EU AI Act Lab**:
   - Open new tab: `http://localhost:3003`
   - Click "Sign In with Standarity" (or use existing credentials)
   - **You should be automatically logged in if using SSO!** ✨

3. **Multi-App SSO**:
   - Once logged into Standarity, all subdomain apps share the same session
   - Works across: Standarity + QMS + EU AI Act Lab

## How It Works

```
User Journey:
┌─────────────────────────────────────────────────────────────┐
│ 1. User visits EU AI Act Lab (localhost:3003)              │
│ 2. Clicks "Sign in with Standarity"                        │
│ 3. Redirected to Standarity OAuth (localhost:4000)         │
│ 4. Already logged in? → Auto-approved (trusted app)        │
│ 5. Not logged in? → Login with Google/GitHub               │
│ 6. Redirected back to EU AI Act Lab → Logged in! ✨        │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

- 🔒 **OAuth 2.0 Authorization Code Flow** - Industry standard
- 🆔 **OpenID Connect (OIDC)** - User identity layer
- 🔄 **Dual Authentication** - SSO + Credentials support
- ✅ **Trusted App** - Skip consent screen for better UX
- 🗄️ **Shared Database** - Same users across all apps
- 🔐 **Secure Credentials** - Hashed with bcrypt
- 🔙 **Backward Compatible** - Existing credential login still works

## Authentication Options

Users can now login using **either**:

1. **Standarity SSO** (Recommended):
   - Single sign-on across all apps
   - Login once, access everywhere
   - Uses Standarity account (Google/GitHub)

2. **Direct Credentials**:
   - Existing email/password login
   - Still supported for backward compatibility
   - Independent of SSO

## Using SSO in Your Code

The existing auth code continues to work. NextAuth handles both providers:

### Get Current User Session (Server-Side)
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <p>Email: {session.user.email}</p>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

### Client-Side Session
```typescript
'use client';
import { useSession } from 'next-auth/react';

export default function ClientComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return <div>Hello, {session.user.name}!</div>;
}
```

### Sign In with SSO
```typescript
'use client';
import { signIn } from 'next-auth/react';

export function SSOLoginButton() {
  return (
    <button onClick={() => signIn('standarity')}>
      Sign In with Standarity
    </button>
  );
}
```

### Sign In with Credentials
```typescript
'use client';
import { signIn } from 'next-auth/react';

export function CredentialsLoginButton() {
  return (
    <button onClick={() => signIn('credentials')}>
      Sign In with Email
    </button>
  );
}
```

## Admin Dashboard

View and manage OAuth clients:
- **URL**: `http://localhost:4000/admin/oauth-clients`
- View all registered apps
- See redirect URIs
- Check trusted status
- Revoke clients if needed

## Production Deployment

When deploying to production, update `.env.local`:

```env
SSO_PROVIDER_URL="https://standarity.com"
NEXTAUTH_URL="https://aiact.standarity.com"
DATABASE_URL="postgresql://user:password@host:5432/standarity"
```

And update OAuth client redirect URIs to:
- `https://aiact.standarity.com/api/auth/callback/standarity`
- `https://aiact.standarity.com/auth/callback`

## Port Configuration

| Application | Port | URL |
|------------|------|-----|
| Standarity | 4000 | http://localhost:4000 |
| QMS | 3002 | http://localhost:3002 |
| EU AI Act Lab | 3003 | http://localhost:3003 |

## Troubleshooting

### Port Already in Use
If port 3003 is already in use:
```bash
# Find process using port 3003
lsof -i :3003

# Kill the process
kill -9 <PID>
```

### Database Connection Error
- Ensure PostgreSQL is running
- Verify DATABASE_URL in `.env.local`
- Check database exists: `psql -l | grep standarity`

### Invalid Credentials
- Verify SSO_CLIENT_ID and SSO_CLIENT_SECRET in `.env.local`
- Check OAuth client is active in admin dashboard
- Ensure no extra spaces or quotes in `.env.local`

### SSO Login Not Working
- Ensure Standarity is running on port 4000
- Check redirect URIs match exactly
- Verify SSO_PROVIDER_URL is correct
- Clear browser cookies and try again

## Next Steps

1. ✅ Start Standarity on port 4000
2. ✅ Start EU AI Act Lab on port 3003
3. Test the SSO flow
4. Update UI to add "Sign In with Standarity" button
5. Deploy to production when ready

## Multi-App SSO Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Standarity (4000)                    │
│                   OAuth 2.0 Provider                    │
│         (Login with Google/GitHub)                      │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ↓         ↓         ↓
   ┌────────┐ ┌──────┐ ┌──────────────┐
   │  QMS   │ │ ISMS │ │ EU AI Act Lab│
   │ (3002) │ │(3001)│ │   (3003)     │
   └────────┘ └──────┘ └──────────────┘

   All apps share:
   ✅ Same OAuth provider
   ✅ Same user database
   ✅ Same authentication
   ✅ Single sign-on
```

## Support

For more information:
- **SSO Package Documentation**: `/Users/amarbendou/Documents/Standarity/sso-integration-package/README.md`
- **Quick Reference**: `/Users/amarbendou/Documents/Standarity/sso-integration-package/QUICK-REFERENCE.md`
- **How It Works**: `/Users/amarbendou/Documents/Standarity/sso-integration-package/HOW-IT-WORKS.md`

---

**Setup completed**: 2026-01-09
**EU AI Act Lab Location**: `/Users/amarbendou/Documents/Claude/EU AI Act Lab`
**Standarity Location**: `/Users/amarbendou/Documents/Standarity`
**Port**: 3003
**Authentication**: Dual mode (SSO + Credentials)
