/**
 * Mock NextAuth for Unit Tests
 *
 * Provides mock authentication contexts and session management for testing
 * protected routes and authentication-dependent functionality.
 */

import { vi } from 'vitest';
import { Session } from 'next-auth';

/**
 * Mock authenticated user session
 */
export const mockAuthenticatedSession: Session = {
  user: {
    id: 'test-user-id',
    email: 'test@talenttech.de',
    name: 'Test User',
    role: 'ADMIN',
    organizationId: 'test-org-id',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
};

/**
 * Mock unauthenticated session (null)
 */
export const mockUnauthenticatedSession = null;

/**
 * Mock session for regular user (non-admin)
 */
export const mockRegularUserSession: Session = {
  user: {
    id: 'regular-user-id',
    email: 'user@talenttech.de',
    name: 'Regular User',
    role: 'USER',
    organizationId: 'test-org-id',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Mock session for viewer role (read-only)
 */
export const mockViewerSession: Session = {
  user: {
    id: 'viewer-user-id',
    email: 'viewer@talenttech.de',
    name: 'Viewer User',
    role: 'VIEWER',
    organizationId: 'test-org-id',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Mock getServerSession for authenticated requests
 */
export const mockGetServerSession = vi.fn().mockResolvedValue(mockAuthenticatedSession);

/**
 * Mock getServerSession for unauthenticated requests
 */
export const mockGetServerSessionUnauthenticated = vi.fn().mockResolvedValue(null);

/**
 * Mock getSession (client-side)
 */
export const mockGetSession = vi.fn().mockResolvedValue(mockAuthenticatedSession);

/**
 * Mock useSession hook
 */
export const mockUseSession = vi.fn(() => ({
  data: mockAuthenticatedSession,
  status: 'authenticated',
  update: vi.fn(),
}));

/**
 * Mock useSession hook for unauthenticated state
 */
export const mockUseSessionUnauthenticated = vi.fn(() => ({
  data: null,
  status: 'unauthenticated',
  update: vi.fn(),
}));

/**
 * Mock useSession hook for loading state
 */
export const mockUseSessionLoading = vi.fn(() => ({
  data: null,
  status: 'loading',
  update: vi.fn(),
}));

/**
 * Mock signIn function
 */
export const mockSignIn = vi.fn().mockResolvedValue({
  error: null,
  status: 200,
  ok: true,
  url: '/dashboard',
});

/**
 * Mock signIn with error
 */
export const mockSignInWithError = vi.fn().mockResolvedValue({
  error: 'Invalid credentials',
  status: 401,
  ok: false,
  url: null,
});

/**
 * Mock signOut function
 */
export const mockSignOut = vi.fn().mockResolvedValue({
  url: '/login',
});

/**
 * Mock NextAuth configuration
 */
export const mockAuthOptions = {
  providers: [],
  callbacks: {
    session: vi.fn(({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    })),
    jwt: vi.fn(({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    }),
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
};

/**
 * Helper to set session for current test
 */
export const setMockSession = (session: Session | null) => {
  mockGetServerSession.mockResolvedValue(session);
  mockGetSession.mockResolvedValue(session);

  if (session) {
    mockUseSession.mockReturnValue({
      data: session,
      status: 'authenticated',
      update: vi.fn(),
    });
  } else {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    });
  }
};

/**
 * Helper to reset all NextAuth mocks
 */
export const resetNextAuthMocks = () => {
  mockGetServerSession.mockClear();
  mockGetServerSessionUnauthenticated.mockClear();
  mockGetSession.mockClear();
  mockUseSession.mockClear();
  mockUseSessionUnauthenticated.mockClear();
  mockUseSessionLoading.mockClear();
  mockSignIn.mockClear();
  mockSignInWithError.mockClear();
  mockSignOut.mockClear();

  // Reset to default authenticated session
  setMockSession(mockAuthenticatedSession);
};

// Auto-reset before each test
beforeEach(() => {
  resetNextAuthMocks();
});

// Mock next-auth module
vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: mockGetServerSession,
}));

vi.mock('next-auth/react', () => ({
  useSession: mockUseSession,
  signIn: mockSignIn,
  signOut: mockSignOut,
  getSession: mockGetSession,
}));
