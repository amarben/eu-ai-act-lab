# How SSO Integration Works

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Copy folder → Run setup.sh → Done!                        │
│                                                             │
│  Users login once to Standarity                            │
│  → Automatically logged into all apps ✨                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Setup Flow

```
┌──────────────────┐
│   Your Next.js   │
│   Application    │
└────────┬─────────┘
         │
         │ 1. Copy sso-integration-package folder
         ↓
┌──────────────────────────────────────┐
│   sso-integration-package/           │
│   ├── setup.sh                       │
│   ├── lib/sso-auth.js               │
│   └── templates/...                  │
└────────┬─────────────────────────────┘
         │
         │ 2. Run: ./setup.sh --app-name "ISMS" --subdomain "isms" --port 3001
         ↓
┌──────────────────────────────────────────────────────────┐
│  Setup Script Does:                                      │
│  ✅ Register OAuth client with Standarity               │
│  ✅ Generate secure credentials                         │
│  ✅ Create .env.local                                   │
│  ✅ Install dependencies                                │
│  ✅ Create auth.js                                      │
│  ✅ Create API routes                                   │
│  ✅ Copy library files                                  │
└────────┬─────────────────────────────────────────────────┘
         │
         │ 3. Start app: npm run dev
         ↓
┌──────────────────────────────────────┐
│   ✨ App with SSO Enabled! ✨       │
│                                      │
│   Users can login with Standarity   │
│   credentials                        │
└──────────────────────────────────────┘
```

## Authentication Flow

```
User Journey:

┌─────────┐                                    ┌─────────────┐
│  User   │                                    │ Standarity  │
│ Browser │                                    │   (OAuth)   │
└────┬────┘                                    └──────┬──────┘
     │                                                │
     │ 1. Visit isms.standarity.com                  │
     │────────────────────────────────────────────→  │
     │                                                │
     │ 2. Click "Sign In"                            │
     │────────────────────────────────────────────→  │
     │                                                │
     │ 3. Redirect to OAuth authorization            │
     │ <───────────────────────────────────────────  │
     │   /api/oauth/authorize?client_id=...          │
     │                                                │
     │ 4a. Already logged in?                        │
     │     → Auto-approve (trusted app)              │
     │     → Skip to step 5                          │
     │                                                │
     │ 4b. Not logged in?                            │
     │     → Login with Google/GitHub                │
     │────────────────────────────────────────────→  │
     │                                                │
     │ 5. Redirect back with auth code               │
     │ <───────────────────────────────────────────  │
     │   /api/auth/callback?code=abc123              │
     │                                                │
┌────┴─────┐                                         │
│   App    │                                         │
│ Backend  │                                         │
└────┬─────┘                                         │
     │                                                │
     │ 6. Exchange code for tokens                   │
     │────────────────────────────────────────────→  │
     │   POST /api/oauth/token                       │
     │                                                │
     │ 7. Return access_token + id_token             │
     │ <───────────────────────────────────────────  │
     │                                                │
     │ 8. Get user info                              │
     │────────────────────────────────────────────→  │
     │   GET /api/oauth/userinfo                     │
     │                                                │
     │ 9. Return user data                           │
     │ <───────────────────────────────────────────  │
     │   { name, email, picture, role }              │
     │                                                │
┌────┴─────┐
│  User is │
│ Logged   │
│    In! ✨│
└──────────┘
```

## Multi-App SSO Flow

```
Scenario: User accesses multiple apps

Step 1: Login to Standarity
┌──────────────────────────────────────────┐
│  User visits: standarity.com             │
│  Signs in with: Google/GitHub            │
│  Status: ✅ Logged in to Standarity     │
└──────────────────────────────────────────┘

Step 2: Visit ISMS App
┌──────────────────────────────────────────┐
│  User visits: isms.standarity.com        │
│  Clicks "Sign In"                        │
│  → Redirected to Standarity OAuth        │
│  → Already logged in! Auto-approved      │
│  → Redirected back                       │
│  Status: ✅ Logged in to ISMS           │
└──────────────────────────────────────────┘

Step 3: Visit QMS App
┌──────────────────────────────────────────┐
│  User visits: qms.standarity.com         │
│  Clicks "Sign In"                        │
│  → Redirected to Standarity OAuth        │
│  → Already logged in! Auto-approved      │
│  → Redirected back                       │
│  Status: ✅ Logged in to QMS            │
└──────────────────────────────────────────┘

Step 4: Visit EMS App
┌──────────────────────────────────────────┐
│  User visits: ems.standarity.com         │
│  Clicks "Sign In"                        │
│  → Redirected to Standarity OAuth        │
│  → Already logged in! Auto-approved      │
│  → Redirected back                       │
│  Status: ✅ Logged in to EMS            │
└──────────────────────────────────────────┘

Result:
✨ ONE login → Access to ALL apps! ✨
```

## System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      Standarity.com                        │
│                   (OAuth 2.0 Provider)                     │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │    OAuth     │  │  User Auth   │  │   Database   │   │
│  │  Endpoints   │  │   (Google/   │  │  (Shared)    │   │
│  │              │  │    GitHub)    │  │              │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                  │                  │           │
└─────────┼──────────────────┼──────────────────┼───────────┘
          │                  │                  │
          │ OAuth 2.0        │ Auth             │ Shared DB
          │                  │                  │
    ┌─────┼──────────────────┼──────────────────┼─────┐
    │     ↓                  ↓                  ↓     │
    │  ┌─────────────────────────────────────────┐   │
    │  │        Subdomain Applications           │   │
    │  ├─────────────────────────────────────────┤   │
    │  │                                         │   │
    │  │  ┌──────────┐  ┌──────────┐  ┌────────┐ │  │
    │  │  │  ISMS    │  │   QMS    │  │  EMS   │ │  │
    │  │  │  App     │  │   App    │  │  App   │ │  │
    │  │  │          │  │          │  │        │ │  │
    │  │  │ Port     │  │ Port     │  │ Port   │ │  │
    │  │  │ 3001     │  │ 3002     │  │ 3003   │ │  │
    │  │  └──────────┘  └──────────┘  └────────┘ │  │
    │  │                                         │   │
    │  │  All apps use:                          │   │
    │  │  ✅ Same OAuth provider                │   │
    │  │  ✅ Same user database                 │   │
    │  │  ✅ Same authentication                │   │
    │  │  ✅ Shared SSO library                 │   │
    │  └─────────────────────────────────────────┘   │
    └───────────────────────────────────────────────┘
```

## What Happens During Setup

```
./setup.sh execution:

1. Collect Information
   ├─ App name: "ISMS Application"
   ├─ Subdomain: "isms"
   ├─ Port: 3001
   └─ Standarity path: ../Standarity

2. Register OAuth Client
   ├─ Generate client_id: "client_abc123..."
   ├─ Generate client_secret: "secret_xyz789..."
   ├─ Hash client_secret with bcrypt
   ├─ Store in database (oauth_clients table)
   ├─ Mark as trusted (skip consent)
   └─ Set redirect URIs

3. Install Dependencies
   ├─ next-auth@latest
   ├─ @auth/prisma-adapter@latest
   ├─ @prisma/client@latest
   └─ bcryptjs@latest

4. Create Configuration Files
   ├─ .env.local (with credentials)
   ├─ auth.js (NextAuth config)
   ├─ lib/sso-auth.js (SSO library)
   ├─ lib/prisma.js (DB client)
   └─ app/api/auth/[...nextauth]/route.js

5. Update package.json
   └─ Set dev script to port 3001

6. Display Success
   ├─ Show credentials
   ├─ List created files
   └─ Provide next steps
```

## Token Lifecycle

```
1. Authorization Code
   ├─ Created: When user authorizes
   ├─ Lifetime: 10 minutes
   ├─ Used: Once (then deleted)
   └─ Purpose: Exchange for tokens

2. Access Token (JWT)
   ├─ Created: After code exchange
   ├─ Lifetime: 1 hour
   ├─ Used: API authentication
   └─ Contains: User ID, email, role

3. Refresh Token
   ├─ Created: With access token
   ├─ Lifetime: 30 days
   ├─ Used: Get new access token
   └─ Can be revoked

4. Session
   ├─ Created: After successful auth
   ├─ Lifetime: 30 days (configurable)
   ├─ Storage: Database or JWT
   └─ Refresh: Automatic with tokens
```

## Security Features

```
┌───────────────────────────────────────────┐
│  Multiple Layers of Security:            │
├───────────────────────────────────────────┤
│                                           │
│  🔒 Client Credentials                   │
│     ├─ Hashed with bcrypt (10 rounds)   │
│     └─ Never stored in plain text        │
│                                           │
│  🔐 JWT Tokens                           │
│     ├─ Signed with secret key            │
│     ├─ Includes expiration               │
│     └─ Validated on each request         │
│                                           │
│  ✅ Authorization Codes                  │
│     ├─ Single-use only                   │
│     ├─ 10-minute expiration              │
│     └─ Deleted after exchange            │
│                                           │
│  🛡️ PKCE (for public clients)           │
│     ├─ Code verifier                     │
│     ├─ Code challenge                    │
│     └─ Challenge method: S256            │
│                                           │
│  🔑 State Parameter                      │
│     ├─ CSRF protection                   │
│     ├─ Random value                      │
│     └─ Validated on callback             │
│                                           │
│  📍 Redirect URI Validation              │
│     ├─ Must match registered URI         │
│     ├─ Exact match (no wildcards)        │
│     └─ Prevents token theft              │
│                                           │
│  🔄 Token Refresh                        │
│     ├─ Automatic renewal                 │
│     ├─ No user interruption              │
│     └─ Revocable if compromised          │
│                                           │
└───────────────────────────────────────────┘
```

## Database Schema

```
Key Tables:

oauth_clients
├─ id (UUID)
├─ client_id (unique)
├─ client_secret (hashed)
├─ name
├─ redirect_uris (array)
├─ allowed_scopes (array)
├─ is_trusted (boolean)
└─ is_active (boolean)

authorization_codes
├─ code (unique)
├─ client_id
├─ user_id
├─ redirect_uri
├─ expires_at
└─ used (boolean)

access_tokens
├─ token (unique)
├─ client_id
├─ user_id
├─ scopes (array)
└─ expires_at

refresh_tokens
├─ token (unique)
├─ client_id
├─ user_id
└─ expires_at

users (shared across all apps)
├─ id
├─ email
├─ name
├─ image
└─ role
```

## Summary

The SSO integration package provides:

✅ **Automated setup** - One command does everything
✅ **OAuth 2.0 standard** - Industry-standard protocol
✅ **Secure by default** - Multiple security layers
✅ **Token management** - Automatic refresh
✅ **Shared database** - Same users everywhere
✅ **Trusted apps** - Seamless UX (no consent screen)
✅ **Reusable** - Same package for all apps

**Result**: Users login once to Standarity, access all apps automatically! ✨
