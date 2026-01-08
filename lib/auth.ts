import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] authorize() called with email:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH] Missing credentials');
          throw new Error('Invalid credentials');
        }

        console.log('🔍 [AUTH] Looking up user in database...');
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            organization: true,
          },
        });

        if (!user || !user.passwordHash) {
          console.log('❌ [AUTH] User not found or no password hash');
          throw new Error('Invalid credentials');
        }

        console.log('✅ [AUTH] User found, comparing password...');
        const isPasswordValid = await compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          console.log('❌ [AUTH] Password invalid');
          throw new Error('Invalid credentials');
        }

        console.log('✅ [AUTH] Password valid, returning user object');
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Log sign in event
      // Could add analytics or audit logging here
    },
    async signOut({ token }) {
      // Log sign out event
      // Could add analytics or audit logging here
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
