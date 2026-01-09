# Standarity SSO Integration Package

**One folder. One command. Done.** ✨

This package automatically configures any Next.js application to use Standarity SSO (Single Sign-On). Users login once to Standarity and are automatically logged into all your subdomain applications.

## 🚀 Quick Start (2 Minutes)

### Step 1: Copy this folder to your app

```bash
cp -r sso-integration-package /path/to/your-nextjs-app/
```

### Step 2: Run the automated setup

```bash
cd /path/to/your-nextjs-app/sso-integration-package
./setup.sh --app-name "ISMS Application" --subdomain "isms" --port 3001
```

### Step 3: Start your app

```bash
cd ..
npm run dev
```

**That's it!** Your app now has SSO enabled. 🎉

## 📖 What It Does

The setup script automatically:

1. ✅ Registers your app as an OAuth client with Standarity
2. ✅ Generates secure client credentials (client_id, client_secret)
3. ✅ Creates `.env.local` with all configuration
4. ✅ Installs required dependencies (next-auth, prisma, etc.)
5. ✅ Creates `auth.js` with SSO configuration
6. ✅ Creates API route at `app/api/auth/[...nextauth]/route.js`
7. ✅ Copies SSO library files to `lib/`
8. ✅ Updates package.json with correct dev port

## 🎯 Usage Examples

### Interactive Mode (Prompts for input)

```bash
./setup.sh
```

You'll be asked for:
- Application name (e.g., "ISMS Application")
- Subdomain (e.g., "isms" for isms.standarity.com)
- Development port (e.g., 3001)
- Path to main Standarity app (default: ../Standarity)

### Command Line Mode (No prompts)

```bash
./setup.sh \
  --app-name "ISMS Application" \
  --subdomain "isms" \
  --port 3001 \
  --standarity-path "../Standarity"
```

### For Multiple Apps

Run the script for each subdomain:

```bash
# ISMS app
cd /path/to/isms-app/sso-integration-package
./setup.sh --app-name "ISMS App" --subdomain "isms" --port 3001

# QMS app
cd /path/to/qms-app/sso-integration-package
./setup.sh --app-name "QMS App" --subdomain "qms" --port 3002

# EMS app
cd /path/to/ems-app/sso-integration-package
./setup.sh --app-name "EMS App" --subdomain "ems" --port 3003
```

## 📁 What Gets Created

After running setup, your app will have:

```
your-nextjs-app/
├── .env.local                              ← OAuth credentials
├── auth.js                                 ← NextAuth config
├── lib/
│   ├── sso-auth.js                        ← SSO library
│   └── prisma.js                          ← Database client
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.js                ← Auth API handler
└── package.json                            ← Updated with dependencies
```

## 🔧 Testing Your Setup

### 1. Start the main Standarity app

```bash
cd /path/to/Standarity
npm run dev
```

This starts Standarity on port 4000.

### 2. Start your subdomain app

```bash
cd /path/to/your-app
npm run dev
```

This starts your app on the configured port (e.g., 3001).

### 3. Test the SSO flow

1. Open browser: `http://localhost:4000`
2. Click "Sign In" and login with Google/GitHub
3. Open new tab: `http://localhost:3001`
4. Click "Sign In" → **You're automatically logged in!** ✨

## 🔐 How SSO Works

```
User Journey:
┌─────────────────────────────────────────────────────────────┐
│ 1. User visits your app (e.g., isms.standarity.com)        │
│ 2. Clicks "Sign in"                                         │
│ 3. Redirected to Standarity OAuth                           │
│ 4. Already logged in? → Auto-approved (trusted app)         │
│ 5. Not logged in? → Login with Google/GitHub                │
│ 6. Redirected back to your app → Logged in! ✨              │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- 🔒 OAuth 2.0 Authorization Code Flow
- 🆔 OpenID Connect (OIDC) support
- 🔄 Automatic token refresh
- ✅ Trusted apps skip consent screen
- 🗄️ Shared database (same users across all apps)
- 🔐 Secure credential storage

## 🛠️ Using SSO in Your App

### Get current user session

```javascript
import { auth } from '@/auth';

export default async function Page() {
  const session = await auth();

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

### Client-side session

```javascript
'use client';

import { useSession } from 'next-auth/react';

export default function ClientComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return <div>Hello, {session.user.name}!</div>;
}
```

### Sign in/out buttons

```javascript
'use client';

import { signIn, signOut } from 'next-auth/react';

export function LoginButton() {
  return <button onClick={() => signIn()}>Sign In</button>;
}

export function LogoutButton() {
  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

### Protect API routes

```javascript
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    message: 'Protected data',
    user: session.user
  });
}
```

## 🌍 Production Deployment

When deploying to production:

1. **Update environment variables:**

```env
# Production .env
SSO_PROVIDER_URL="https://standarity.com"
AUTH_URL="https://isms.standarity.com"
NEXTAUTH_URL="https://isms.standarity.com"
```

2. **Register production OAuth client:**

Run the setup script again with production URLs, or manually register via the admin dashboard at `https://standarity.com/admin/oauth-clients`

3. **Update redirect URIs:**

Make sure your OAuth client has the correct production redirect URIs:
- `https://isms.standarity.com/api/auth/callback/standarity`
- `https://isms.standarity.com/auth/callback`

## 📦 Package Contents

```
sso-integration-package/
├── README.md                    ← You are here
├── setup.sh                     ← Automated setup script
├── lib/
│   ├── sso-auth.js             ← SSO authentication library
│   └── prisma.js               ← Prisma database client
├── auth.js.template            ← NextAuth config template
├── route.js.template           ← API route template
├── .env.template               ← Environment variables template
└── package.json.additions      ← Required dependencies
```

## 🔍 Troubleshooting

### "Command not found: ./setup.sh"

Make the script executable:

```bash
chmod +x setup.sh
```

### "Failed to register OAuth client"

Check that:
- The Standarity app path is correct
- The Standarity database is running
- You have the latest code from Standarity

### "Module not found: next-auth"

The setup script should install dependencies automatically. If not, run:

```bash
npm install next-auth @auth/prisma-adapter @prisma/client bcryptjs
```

### "Database connection error"

Make sure:
- PostgreSQL is running
- The DATABASE_URL in .env.local is correct
- The database exists: `createdb standarity`
- Migrations are run: `cd /path/to/Standarity && npx prisma migrate dev`

### "Invalid client credentials"

Check that:
- `.env.local` has the correct SSO_CLIENT_ID and SSO_CLIENT_SECRET
- No extra spaces or quotes in the .env.local values
- The OAuth client is active in the admin dashboard

## 📚 Additional Resources

- **Full Integration Guide:** `/path/to/Standarity/docs/OAUTH-SSO-INTEGRATION-GUIDE.md`
- **Quick Start Guide:** `/path/to/Standarity/docs/SSO-QUICK-START.md`
- **Admin Dashboard:** `http://localhost:4000/admin/oauth-clients`
- **OIDC Discovery:** `http://localhost:4000/.well-known/openid-configuration`

## 🤝 Support

- Check the Standarity documentation
- Review server logs for detailed error messages
- Verify OAuth client configuration in admin dashboard

## 📄 License

This package is part of the Standarity project.

---

**Made with ❤️ by the Standarity team**

**Last Updated:** 2026-01-09
