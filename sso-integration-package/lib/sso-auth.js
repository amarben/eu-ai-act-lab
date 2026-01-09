/**
 * SSO Authentication Library for Subdomain Apps
 *
 * This file provides a reusable NextAuth configuration for subdomain applications
 * (isms.standarity.com, qms.standarity.com, etc.) to authenticate against
 * standarity.com as the OAuth 2.0 identity provider.
 *
 * USAGE IN SUBDOMAIN APP:
 * 1. Copy this file to your subdomain app's lib/sso-auth.js
 * 2. Set environment variables (see below)
 * 3. Import and use in auth.js:
 *    import { createSSOAuth } from '@/lib/sso-auth';
 *    export const { handlers, signIn, signOut, auth } = createSSOAuth();
 */

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';

/**
 * Create NextAuth configuration for SSO subdomain app
 *
 * @param {object} options - Configuration options
 * @param {object} options.prisma - Prisma client instance (optional, for shared database)
 * @param {string} options.providerUrl - OAuth provider URL (default: https://standarity.com)
 * @param {string} options.appName - Application name for display
 * @returns NextAuth instance
 */
export function createSSOAuth(options = {}) {
  const {
    prisma = null,
    providerUrl = process.env.SSO_PROVIDER_URL || 'https://standarity.com',
    appName = process.env.NEXT_PUBLIC_APP_NAME || 'Application',
  } = options;

  const authConfig = {
    trustHost: true,

    // Use Prisma adapter if shared database
    ...(prisma && { adapter: PrismaAdapter(prisma) }),

    providers: [
      {
        id: 'standarity',
        name: 'Standarity SSO',
        type: 'oauth',
        version: '2.0',

        // OAuth 2.0 endpoints
        authorization: {
          url: `${providerUrl}/api/oauth/authorize`,
          params: {
            scope: 'openid profile email',
            response_type: 'code',
          },
        },
        token: `${providerUrl}/api/oauth/token`,
        userinfo: `${providerUrl}/api/oauth/userinfo`,

        // Client credentials from environment
        clientId: process.env.SSO_CLIENT_ID,
        clientSecret: process.env.SSO_CLIENT_SECRET,

        // Profile mapping (OpenID Connect standard claims)
        profile(profile) {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            emailVerified: profile.email_verified ? new Date() : null,
            role: profile.role || 'user',
          };
        },

        // Additional options
        checks: ['state'],
        idToken: true, // Support OpenID Connect ID tokens
      },
    ],

    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },

    callbacks: {
      async jwt({ token, account, profile, user }) {
        // Initial sign in
        if (account) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expiresAt = account.expires_at;
          token.id = profile?.sub || user?.id;
          token.role = profile?.role || user?.role || 'user';
        }

        // Token refresh logic (if needed)
        // Check if token is expired and refresh it
        if (token.expiresAt && Date.now() > token.expiresAt * 1000) {
          return await refreshAccessToken(token, providerUrl);
        }

        return token;
      },

      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id;
          session.user.role = token.role;
          session.accessToken = token.accessToken;
        }
        return session;
      },

      async signIn({ user, account, profile }) {
        // Allow sign in - additional checks can be added here
        return true;
      },
    },

    session: {
      strategy: prisma ? 'database' : 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    debug: process.env.NODE_ENV === 'development',
  };

  return NextAuth(authConfig);
}

/**
 * Refresh OAuth access token
 */
async function refreshAccessToken(token, providerUrl) {
  try {
    const response = await fetch(`${providerUrl}/api/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
        client_id: process.env.SSO_CLIENT_ID,
        client_secret: process.env.SSO_CLIENT_SECRET,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

/**
 * Environment variables required for SSO subdomain app:
 *
 * # OAuth Client Credentials (get from registration script)
 * SSO_CLIENT_ID="your-client-id"
 * SSO_CLIENT_SECRET="your-client-secret"
 *
 * # OAuth Provider (main standarity.com app)
 * SSO_PROVIDER_URL="https://standarity.com" # or http://localhost:4000 for dev
 *
 * # NextAuth Configuration
 * AUTH_SECRET="generate-with-openssl-rand-base64-32"
 * AUTH_URL="https://isms.standarity.com" # Your subdomain app URL
 * NEXTAUTH_URL="https://isms.standarity.com" # Your subdomain app URL
 * AUTH_TRUST_HOST=true
 *
 * # Database (if using shared database)
 * DATABASE_URL="postgresql://user:password@host:5432/standarity?schema=public"
 *
 * # App Info
 * NEXT_PUBLIC_APP_NAME="ISMS Application"
 */

/**
 * Example auth.js for subdomain app:
 *
 * ```javascript
 * // subdomain-app/auth.js
 * import { createSSOAuth } from '@/lib/sso-auth';
 * import { prisma } from '@/lib/prisma'; // If using shared database
 *
 * export const { handlers, signIn, signOut, auth } = createSSOAuth({
 *   prisma, // Optional: pass prisma instance for shared database
 *   appName: 'ISMS Application',
 * });
 * ```
 *
 * Example API route handler:
 * ```javascript
 * // subdomain-app/app/api/auth/[...nextauth]/route.js
 * export { handlers as GET, handlers as POST } from '@/auth';
 * ```
 */

export default createSSOAuth;
