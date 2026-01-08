# Testing Guide
## EU AI Act Implementation Lab

**Version:** 1.0
**Date:** December 24, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Test Environment Setup](#test-environment-setup)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [End-to-End Testing](#end-to-end-testing)
7. [API Testing](#api-testing)
8. [Database Testing](#database-testing)
9. [Performance Testing](#performance-testing)
10. [Security Testing](#security-testing)
11. [Accessibility Testing](#accessibility-testing)
12. [Test Data Management](#test-data-management)
13. [Continuous Integration](#continuous-integration)
14. [Test Coverage](#test-coverage)
15. [Best Practices](#best-practices)

---

## Overview

### Testing Philosophy

Our testing approach follows the **Testing Pyramid**:

```
      /\
     /  \
    / E2E\          10% - End-to-End Tests (Playwright)
   /______\
  /        \
 /Integration\     30% - Integration Tests (API, DB)
/__________  \
/              \
/  Unit Tests   \   60% - Unit Tests (Vitest, React Testing Library)
/________________\
```

### Testing Goals

1. **Catch bugs early** - Unit tests catch issues during development
2. **Prevent regressions** - Integration tests ensure features work together
3. **Validate user flows** - E2E tests verify critical user journeys
4. **Ensure quality** - Maintain 80%+ code coverage
5. **Enable confidence** - Deploy with confidence knowing tests pass

### Testing Stack

| Type | Tool | Purpose |
|------|------|---------|
| Unit | Vitest | Fast unit tests for functions and components |
| Component | React Testing Library | Test React components in isolation |
| Integration | Vitest + Supertest | Test API routes and database operations |
| E2E | Playwright | Test complete user flows in browser |
| API | Postman/Newman | API contract testing |
| Performance | k6 | Load testing and performance benchmarks |
| Security | OWASP ZAP | Security vulnerability scanning |

---

## Testing Strategy

### Test Coverage Requirements

| Layer | Target Coverage | Priority |
|-------|----------------|----------|
| Critical paths (auth, classification, export) | 100% | Highest |
| Business logic (utils, services) | >90% | High |
| API routes | >85% | High |
| React components | >70% | Medium |
| UI/presentational components | >60% | Medium |

### What to Test

**✅ DO Test:**
- Business logic and calculations (risk scores, compliance percentages)
- Data transformations (API responses, database queries)
- User interactions (button clicks, form submissions)
- Error handling (validation errors, API failures)
- Edge cases (empty states, maximum values, special characters)
- Critical user flows (signup, login, create system, export)

**❌ DON'T Test:**
- Third-party libraries (trust they're tested)
- Next.js framework features (already tested by Vercel)
- Simple getters/setters with no logic
- CSS styles (use visual regression tools instead)

---

## Test Environment Setup

### Prerequisites

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm playwright install

# Setup test database
cp .env.test.example .env.test
```

### Environment Variables

**.env.test:**

```bash
# Test Database (use separate database)
DATABASE_URL="postgresql://test_user:test_pass@localhost:5432/euaiact_test"

# Test-specific settings
NODE_ENV=test
NEXTAUTH_SECRET=test-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Mock external services
GEMINI_API_KEY=test-api-key-not-real
S3_BUCKET=test-bucket
S3_ACCESS_KEY_ID=test-access-key
S3_SECRET_ACCESS_KEY=test-secret-key

# Disable external calls
SMTP_HOST=localhost
SMTP_PORT=1025
```

### Test Database Setup

```bash
# Create test database
createdb euaiact_test

# Run migrations
DATABASE_URL="postgresql://test_user:test_pass@localhost:5432/euaiact_test" pnpm prisma migrate deploy

# Seed test data
DATABASE_URL="postgresql://test_user:test_pass@localhost:5432/euaiact_test" pnpm prisma db seed
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test lib/utils/risk-score.test.ts

# Run tests matching pattern
pnpm test --grep "authentication"
```

---

## Unit Testing

### Testing Utilities and Pure Functions

**Example: lib/utils/risk-score.test.ts**

```typescript
import { describe, it, expect } from 'vitest';
import { calculateRiskScore, getRiskLevel, calculateResidualRisk } from './risk-score';

describe('calculateRiskScore', () => {
  it('should calculate risk score correctly', () => {
    expect(calculateRiskScore(5, 5)).toBe(25);
    expect(calculateRiskScore(1, 1)).toBe(1);
    expect(calculateRiskScore(3, 4)).toBe(12);
  });

  it('should handle edge cases', () => {
    expect(calculateRiskScore(0, 5)).toBe(0);
    expect(calculateRiskScore(5, 0)).toBe(0);
  });

  it('should throw error for invalid inputs', () => {
    expect(() => calculateRiskScore(-1, 5)).toThrow('Likelihood must be between 1 and 5');
    expect(() => calculateRiskScore(5, 6)).toThrow('Impact must be between 1 and 5');
  });
});

describe('getRiskLevel', () => {
  it('should return correct risk level', () => {
    expect(getRiskLevel(1)).toBe('LOW');
    expect(getRiskLevel(6)).toBe('LOW');
    expect(getRiskLevel(8)).toBe('MEDIUM');
    expect(getRiskLevel(12)).toBe('MEDIUM');
    expect(getRiskLevel(15)).toBe('HIGH');
    expect(getRiskLevel(25)).toBe('HIGH');
  });

  it('should handle boundary values', () => {
    expect(getRiskLevel(6)).toBe('LOW');
    expect(getRiskLevel(7)).toBe('LOW');
    expect(getRiskLevel(8)).toBe('MEDIUM');
    expect(getRiskLevel(14)).toBe('MEDIUM');
    expect(getRiskLevel(15)).toBe('HIGH');
  });
});

describe('calculateResidualRisk', () => {
  it('should calculate residual risk after mitigations', () => {
    const result = calculateResidualRisk({
      inherentLikelihood: 5,
      inherentImpact: 5,
      mitigationEffectiveness: 0.6, // 60% effective
    });

    expect(result.residualLikelihood).toBe(2); // 5 * 0.4 = 2
    expect(result.residualImpact).toBe(3); // 5 * 0.6 = 3
    expect(result.residualRiskScore).toBe(6); // 2 * 3 = 6
  });

  it('should not reduce risk below 1', () => {
    const result = calculateResidualRisk({
      inherentLikelihood: 2,
      inherentImpact: 2,
      mitigationEffectiveness: 0.9,
    });

    expect(result.residualLikelihood).toBeGreaterThanOrEqual(1);
    expect(result.residualImpact).toBeGreaterThanOrEqual(1);
  });
});
```

### Testing React Components

**Example: components/forms/SystemForm.test.tsx**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemForm } from './SystemForm';

describe('SystemForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render form fields', () => {
    render(<SystemForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/system name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/business purpose/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deployment status/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields', async () => {
    render(<SystemForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/business purpose is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate minimum length for business purpose', async () => {
    render(<SystemForm onSubmit={mockOnSubmit} />);

    const purposeInput = screen.getByLabelText(/business purpose/i);
    await userEvent.type(purposeInput, 'Short');

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    render(<SystemForm onSubmit={mockOnSubmit} />);

    await userEvent.type(
      screen.getByLabelText(/system name/i),
      'Fraud Detection System'
    );
    await userEvent.type(
      screen.getByLabelText(/business purpose/i),
      'Detect fraudulent financial transactions in real-time'
    );
    await userEvent.selectOptions(
      screen.getByLabelText(/deployment status/i),
      'PRODUCTION'
    );
    await userEvent.click(screen.getByLabelText(/internal employees/i));
    await userEvent.click(screen.getByLabelText(/financial data/i));

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Fraud Detection System',
        businessPurpose: 'Detect fraudulent financial transactions in real-time',
        deploymentStatus: 'PRODUCTION',
        primaryUsers: ['INTERNAL_EMPLOYEES'],
        dataCategories: ['FINANCIAL_DATA'],
      });
    });
  });

  it('should populate form when editing existing system', () => {
    const existingSystem = {
      name: 'Existing System',
      businessPurpose: 'Existing purpose description',
      deploymentStatus: 'TESTING',
      primaryUsers: ['EXTERNAL_CUSTOMERS'],
      dataCategories: ['PERSONAL_DATA'],
    };

    render(<SystemForm initialData={existingSystem} onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/system name/i)).toHaveValue('Existing System');
    expect(screen.getByLabelText(/business purpose/i)).toHaveValue('Existing purpose description');
    expect(screen.getByLabelText(/deployment status/i)).toHaveValue('TESTING');
  });
});
```

### Testing Custom Hooks

**Example: hooks/useAuth.test.ts**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import { useSession, signIn, signOut } from 'next-auth/react';

describe('useAuth', () => {
  it('should return authenticated user', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        expires: '2025-12-31',
      },
      status: 'authenticated',
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return null when not authenticated', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle login', async () => {
    vi.mocked(signIn).mockResolvedValue({ ok: true } as any);

    const { result } = renderHook(() => useAuth());

    await result.current.login('test@example.com', 'password');

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: 'password',
      redirect: false,
    });
  });

  it('should handle logout', async () => {
    const { result } = renderHook(() => useAuth());

    await result.current.logout();

    expect(signOut).toHaveBeenCalled();
  });
});
```

---

## Integration Testing

### Testing API Routes

**Example: app/api/systems/__tests__/create.test.ts**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import { prisma } from '@/lib/db/prisma';
import handler from '../route';

describe('POST /api/systems', () => {
  let userId: string;
  let organizationId: string;
  let authToken: string;

  beforeEach(async () => {
    // Create test user and organization
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
      },
    });
    userId = user.id;

    const organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        industry: 'TECHNOLOGY',
        region: 'DE',
        userRole: 'COMPLIANCE_OFFICER',
        userId,
      },
    });
    organizationId = organization.id;

    // Generate auth token (mock)
    authToken = 'mock-jwt-token';
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.aISystem.deleteMany({ where: { organizationId } });
    await prisma.organization.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it('should create a new AI system', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name: 'Test AI System',
            businessPurpose: 'Testing purposes only',
            primaryUsers: ['INTERNAL_EMPLOYEES'],
            deploymentStatus: 'DEVELOPMENT',
            dataCategories: ['PERSONAL_DATA'],
          }),
        });

        expect(res.status).toBe(201);

        const data = await res.json();
        expect(data.data).toMatchObject({
          name: 'Test AI System',
          businessPurpose: 'Testing purposes only',
          deploymentStatus: 'DEVELOPMENT',
        });
        expect(data.data.id).toBeDefined();
      },
    });
  });

  it('should return 400 for invalid data', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name: 'A', // Too short
            businessPurpose: 'Short', // Too short
          }),
        });

        expect(res.status).toBe(400);

        const data = await res.json();
        expect(data.error.code).toBe('validation_error');
        expect(data.error.details).toHaveLength(2);
      },
    });
  });

  it('should return 401 for unauthenticated requests', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Test System',
            businessPurpose: 'Testing',
            primaryUsers: ['INTERNAL_EMPLOYEES'],
            deploymentStatus: 'DEVELOPMENT',
            dataCategories: ['PERSONAL_DATA'],
          }),
        });

        expect(res.status).toBe(401);
      },
    });
  });

  it('should enforce unique system names per organization', async () => {
    // Create first system
    await prisma.aISystem.create({
      data: {
        name: 'Duplicate Name',
        businessPurpose: 'First system',
        primaryUsers: ['INTERNAL_EMPLOYEES'],
        deploymentStatus: 'PRODUCTION',
        dataCategories: ['PERSONAL_DATA'],
        organizationId,
      },
    });

    // Try to create second system with same name
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name: 'Duplicate Name',
            businessPurpose: 'Second system',
            primaryUsers: ['INTERNAL_EMPLOYEES'],
            deploymentStatus: 'PRODUCTION',
            dataCategories: ['PERSONAL_DATA'],
          }),
        });

        expect(res.status).toBe(409);
        const data = await res.json();
        expect(data.error.code).toBe('duplicate_resource');
      },
    });
  });
});
```

### Testing Database Operations

**Example: lib/db/__tests__/queries.test.ts**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../prisma';
import { createSystem, getSystemById, updateSystem, deleteSystem } from '../queries';

describe('Database Queries', () => {
  let organizationId: string;

  beforeEach(async () => {
    const org = await prisma.organization.create({
      data: {
        name: 'Test Org',
        industry: 'TECHNOLOGY',
        region: 'DE',
        userRole: 'COMPLIANCE_OFFICER',
        userId: 'test-user-id',
      },
    });
    organizationId = org.id;
  });

  afterEach(async () => {
    await prisma.aISystem.deleteMany({ where: { organizationId } });
    await prisma.organization.deleteMany({ where: { id: organizationId } });
  });

  describe('createSystem', () => {
    it('should create a new AI system', async () => {
      const system = await createSystem({
        name: 'Test System',
        businessPurpose: 'Testing database operations',
        primaryUsers: ['INTERNAL_EMPLOYEES'],
        deploymentStatus: 'DEVELOPMENT',
        dataCategories: ['PERSONAL_DATA'],
        organizationId,
      });

      expect(system).toMatchObject({
        name: 'Test System',
        businessPurpose: 'Testing database operations',
        organizationId,
      });
      expect(system.id).toBeDefined();
      expect(system.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error for duplicate name', async () => {
      await createSystem({
        name: 'Duplicate',
        businessPurpose: 'First',
        primaryUsers: ['INTERNAL_EMPLOYEES'],
        deploymentStatus: 'DEVELOPMENT',
        dataCategories: ['PERSONAL_DATA'],
        organizationId,
      });

      await expect(
        createSystem({
          name: 'Duplicate',
          businessPurpose: 'Second',
          primaryUsers: ['INTERNAL_EMPLOYEES'],
          deploymentStatus: 'DEVELOPMENT',
          dataCategories: ['PERSONAL_DATA'],
          organizationId,
        })
      ).rejects.toThrow();
    });
  });

  describe('getSystemById', () => {
    it('should retrieve system by ID', async () => {
      const created = await createSystem({
        name: 'Retrieve Test',
        businessPurpose: 'Testing retrieval',
        primaryUsers: ['INTERNAL_EMPLOYEES'],
        deploymentStatus: 'DEVELOPMENT',
        dataCategories: ['PERSONAL_DATA'],
        organizationId,
      });

      const retrieved = await getSystemById(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent ID', async () => {
      const result = await getSystemById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('updateSystem', () => {
    it('should update system fields', async () => {
      const system = await createSystem({
        name: 'Update Test',
        businessPurpose: 'Original purpose',
        primaryUsers: ['INTERNAL_EMPLOYEES'],
        deploymentStatus: 'DEVELOPMENT',
        dataCategories: ['PERSONAL_DATA'],
        organizationId,
      });

      const updated = await updateSystem(system.id, {
        businessPurpose: 'Updated purpose',
        deploymentStatus: 'PRODUCTION',
      });

      expect(updated.businessPurpose).toBe('Updated purpose');
      expect(updated.deploymentStatus).toBe('PRODUCTION');
      expect(updated.name).toBe('Update Test'); // Unchanged
    });
  });

  describe('deleteSystem', () => {
    it('should delete system and cascade related data', async () => {
      const system = await createSystem({
        name: 'Delete Test',
        businessPurpose: 'To be deleted',
        primaryUsers: ['INTERNAL_EMPLOYEES'],
        deploymentStatus: 'DEVELOPMENT',
        dataCategories: ['PERSONAL_DATA'],
        organizationId,
      });

      // Add related data
      await prisma.riskClassification.create({
        data: {
          aiSystemId: system.id,
          category: 'HIGH_RISK',
          prohibitedPractices: [],
          highRiskCategories: ['Test'],
          interactsWithPersons: true,
          reasoning: 'Test classification',
          applicableRequirements: [],
        },
      });

      await deleteSystem(system.id);

      // Verify system is deleted
      const deletedSystem = await getSystemById(system.id);
      expect(deletedSystem).toBeNull();

      // Verify related data is cascade deleted
      const classification = await prisma.riskClassification.findFirst({
        where: { aiSystemId: system.id },
      });
      expect(classification).toBeNull();
    });
  });
});
```

---

## End-to-End Testing

### Testing User Flows with Playwright

**Example: e2e/auth/signup-login.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should sign up, verify email, and login', async ({ page }) => {
    // 1. Navigate to signup page
    await page.goto('/signup');
    await expect(page).toHaveTitle(/Sign Up/);

    // 2. Fill signup form
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.fill('[name="confirmPassword"]', 'SecurePassword123!');
    await page.check('[name="terms"]');

    // 3. Submit form
    await page.click('button[type="submit"]');

    // 4. Verify success message
    await expect(page.locator('text=Verification email sent')).toBeVisible();

    // 5. In real scenario, would check email and click verification link
    // For testing, we'll mock email verification
    // ... (implementation depends on test email service)

    // 6. Navigate to login
    await page.goto('/login');

    // 7. Fill login form
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // 8. Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome, Test User')).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/signup');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Verify validation messages
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for weak password', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'weak');
    await page.fill('[name="confirmPassword"]', 'weak');
    await page.click('button[type="submit"]');

    await expect(
      page.locator('text=Password must be at least 12 characters')
    ).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('[name="email"]', 'existing@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Then logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');

    // Verify redirect to login
    await expect(page).toHaveURL('/login');

    // Verify cannot access protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});
```

**Example: e2e/systems/create-and-classify.spec.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('AI System Creation and Classification', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create and classify AI system as high-risk', async ({ page }) => {
    // 1. Navigate to AI Systems
    await page.click('text=AI Systems');
    await expect(page).toHaveURL('/systems');

    // 2. Click Add System
    await page.click('text=Add AI System');

    // 3. Fill system form
    await page.fill('[name="name"]', 'Fraud Detection System');
    await page.fill(
      '[name="businessPurpose"]',
      'Detect fraudulent financial transactions in real-time'
    );
    await page.selectOption('[name="deploymentStatus"]', 'PRODUCTION');
    await page.check('[data-testid="user-type-internal-employees"]');
    await page.check('[data-testid="data-category-financial-data"]');
    await page.check('[data-testid="data-category-behavioral-data"]');

    // 4. Save system
    await page.click('button:has-text("Save")');

    // 5. Verify system created
    await expect(page.locator('text=Fraud Detection System')).toBeVisible();

    // 6. Start classification wizard
    await page.click('text=Classify Now');

    // 7. Step 1: Prohibited practices (none selected)
    await page.click('button:has-text("Next")');

    // 8. Step 2: High-risk categories
    await page.check('text=Creditworthiness assessment');
    await page.click('button:has-text("Next")');

    // 9. Step 3: Interacts with persons
    await page.check('text=Yes');
    await page.click('button:has-text("Next")');

    // 10. Submit classification
    await page.fill(
      '[name="reasoning"]',
      'This system is used for creditworthiness assessment which is listed in Annex III of the EU AI Act.'
    );
    await page.click('button:has-text("Submit Classification")');

    // 11. Verify classification result
    await expect(page.locator('text=Classification Complete')).toBeVisible();
    await expect(page.locator('text=HIGH-RISK')).toBeVisible();
    await expect(
      page.locator('text=Risk management system (Article 9)')
    ).toBeVisible();

    // 12. Navigate to system details
    await page.click('text=View System Details');

    // 13. Verify classification appears in system details
    await expect(page.locator('[data-testid="risk-badge-high"]')).toBeVisible();
    await expect(page.locator('text=Creditworthiness assessment')).toBeVisible();
  });

  test('should create minimal risk system', async ({ page }) => {
    await page.click('text=AI Systems');
    await page.click('text=Add AI System');

    await page.fill('[name="name"]', 'Simple Chatbot');
    await page.fill('[name="businessPurpose"]', 'Answer FAQs about products');
    await page.selectOption('[name="deploymentStatus"]', 'PRODUCTION');
    await page.check('[data-testid="user-type-external-customers"]');
    await page.check('[data-testid="data-category-no-personal-data"]');

    await page.click('button:has-text("Save")');
    await page.click('text=Classify Now');

    // No prohibited practices
    await page.click('button:has-text("Next")');

    // No high-risk categories
    await page.click('button:has-text("Next")');

    // Does not interact with persons (automated responses)
    await page.check('text=No');
    await page.click('button:has-text("Next")');

    await page.fill('[name="reasoning"]', 'Simple FAQ chatbot with no personal data');
    await page.click('button:has-text("Submit Classification")');

    // Verify minimal risk classification
    await expect(page.locator('text=MINIMAL-RISK')).toBeVisible();
  });
});
```

**Example: e2e/export/generate-documents.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Document Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should generate and download executive summary PDF', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Click export button
    await page.click('text=Export Executive Summary');

    // Wait for export modal
    await expect(page.locator('text=Export Documentation')).toBeVisible();

    // Select systems
    await page.check('[data-testid="include-system-fraud-detection"]');
    await page.check('[data-testid="include-system-resume-screener"]');

    // Select format
    await page.check('text=PDF');

    // Start generation
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generate & Download")');

    // Wait for generation progress
    await expect(page.locator('text=Generating AI-powered narrative')).toBeVisible();

    // Wait for download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/executive-summary.*\.pdf/);

    // Save file
    const downloadPath = path.join(__dirname, '../../downloads', download.suggestedFilename());
    await download.saveAs(downloadPath);

    // Verify file exists and has content
    expect(fs.existsSync(downloadPath)).toBe(true);
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(10000); // At least 10KB

    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test('should handle export error gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/export/executive-summary', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({
          error: {
            code: 'export_generation_failed',
            message: 'Failed to generate document',
          },
        }),
      });
    });

    await page.goto('/dashboard');
    await page.click('text=Export Executive Summary');
    await page.click('button:has-text("Generate & Download")');

    // Verify error message
    await expect(
      page.locator('text=Failed to generate document')
    ).toBeVisible();
  });

  test('should show rate limit warning', async ({ page }) => {
    // Mock rate limit response
    await page.route('**/api/export/executive-summary', (route) => {
      route.fulfill({
        status: 429,
        headers: {
          'Retry-After': '60',
        },
        body: JSON.stringify({
          error: {
            code: 'rate_limit_exceeded',
            message: 'Too many export requests. Please try again in 60 seconds.',
          },
        }),
      });
    });

    await page.goto('/dashboard');
    await page.click('text=Export Executive Summary');
    await page.click('button:has-text("Generate & Download")');

    await expect(
      page.locator('text=Too many export requests')
    ).toBeVisible();
    await expect(page.locator('text=60 seconds')).toBeVisible();
  });
});
```

---

## API Testing

### Postman Collection

Create a Postman collection for API contract testing:

**euaiact-lab.postman_collection.json:**

```json
{
  "info": {
    "name": "EU AI Act Lab API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Sign Up",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"{{test_email}}\",\n  \"password\": \"{{test_password}}\",\n  \"name\": \"Test User\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{base_url}}/api/auth/signup",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "signup"]
            }
          },
          "response": []
        },
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response has access token\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.data.accessToken).to.exist;",
                  "    pm.environment.set(\"access_token\", jsonData.data.accessToken);",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"{{test_email}}\",\n  \"password\": \"{{test_password}}\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "AI Systems",
      "item": [
        {
          "name": "Create AI System",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 201\", function () {",
                  "    pm.response.to.have.status(201);",
                  "});",
                  "",
                  "pm.test(\"System has ID\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.data.id).to.exist;",
                  "    pm.environment.set(\"system_id\", jsonData.data.id);",
                  "});",
                  "",
                  "pm.test(\"System name matches\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.data.name).to.eql(\"Test AI System\");",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}",
                "type": "text"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test AI System\",\n  \"businessPurpose\": \"Testing API endpoints\",\n  \"primaryUsers\": [\"INTERNAL_EMPLOYEES\"],\n  \"deploymentStatus\": \"DEVELOPMENT\",\n  \"dataCategories\": [\"PERSONAL_DATA\"]\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{base_url}}/api/v1/systems",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "systems"]
            }
          },
          "response": []
        },
        {
          "name": "Get AI Systems",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Status code is 200\", function () {",
                  "    pm.response.to.have.status(200);",
                  "});",
                  "",
                  "pm.test(\"Response is array\", function () {",
                  "    var jsonData = pm.response.json();",
                  "    pm.expect(jsonData.data).to.be.an('array');",
                  "});"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{access_token}}",
                "type": "text"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/v1/systems",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "systems"]
            }
          },
          "response": []
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "type": "string"
    }
  ]
}
```

### Running Postman Tests with Newman

```bash
# Install Newman
npm install -g newman

# Run collection
newman run euaiact-lab.postman_collection.json \
  --environment euaiact-test.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export test-results.json

# Run with specific data file
newman run euaiact-lab.postman_collection.json \
  --iteration-data test-data.json

# Run in CI/CD
newman run euaiact-lab.postman_collection.json \
  --bail \
  --color off \
  --disable-unicode
```

---

## Performance Testing

### Load Testing with k6

**load-test.js:**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 10 },   // Stay at 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],     // Error rate < 1%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  // Login and get access token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const accessToken = loginRes.json('data.accessToken');
  return { accessToken };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.accessToken}`,
    'Content-Type': 'application/json',
  };

  // Test: List AI Systems
  const listRes = http.get(`${BASE_URL}/api/v1/systems`, { headers });
  check(listRes, {
    'list status 200': (r) => r.status === 200,
    'list response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test: Get specific system
  if (listRes.status === 200 && listRes.json('data').length > 0) {
    const systemId = listRes.json('data.0.id');
    const getRes = http.get(`${BASE_URL}/api/v1/systems/${systemId}`, { headers });
    check(getRes, {
      'get status 200': (r) => r.status === 200,
      'get response time < 300ms': (r) => r.timings.duration < 300,
    }) || errorRate.add(1);
  }

  sleep(1);
}
```

**Run load test:**

```bash
# Install k6
# macOS: brew install k6
# Linux: apt install k6

# Run test
k6 run load-test.js

# Run with custom parameters
k6 run --vus 100 --duration 5m load-test.js

# Run with environment variable
k6 run -e BASE_URL=https://app.euaiactlab.com load-test.js

# Output to InfluxDB for grafana visualization
k6 run --out influxdb=http://localhost:8086/k6 load-test.js
```

---

## Security Testing

### OWASP ZAP Automated Scan

```bash
# Pull ZAP Docker image
docker pull owasp/zap2docker-stable

# Run baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://app.euaiactlab.com \
  -r zap-report.html

# Run full scan
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t https://app.euaiactlab.com \
  -r zap-full-report.html

# Run API scan
docker run -t owasp/zap2docker-stable zap-api-scan.py \
  -t https://app.euaiactlab.com/api/openapi.json \
  -f openapi \
  -r zap-api-report.html
```

### Manual Security Checks

**security-checklist.md:**

```markdown
# Security Testing Checklist

## Authentication & Authorization
- [ ] Password complexity requirements enforced
- [ ] Account lockout after failed attempts
- [ ] Session timeout works correctly
- [ ] Logout invalidates session
- [ ] OAuth flows are secure
- [ ] JWT tokens expire correctly
- [ ] Refresh token rotation works

## Input Validation
- [ ] SQL injection protection (use parameterized queries)
- [ ] XSS protection (sanitize inputs, encode outputs)
- [ ] CSRF tokens present and validated
- [ ] File upload restrictions (type, size)
- [ ] Input length limits enforced
- [ ] Special characters handled properly

## API Security
- [ ] Rate limiting works
- [ ] Authentication required for protected endpoints
- [ ] Authorization checks user permissions
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS enforced (no HTTP)
- [ ] CORS properly configured

## Data Protection
- [ ] Passwords hashed with bcrypt (not MD5/SHA1)
- [ ] Sensitive data encrypted at rest
- [ ] TLS 1.2+ for data in transit
- [ ] Database credentials not in code
- [ ] Environment variables used for secrets
- [ ] No API keys in client-side code

## Headers & Configuration
- [ ] Security headers present (HSTS, CSP, X-Frame-Options)
- [ ] No sensitive data in URLs
- [ ] Cookies are HttpOnly and Secure
- [ ] No verbose error messages in production
- [ ] Server version hidden

## Third-Party Dependencies
- [ ] Dependencies up to date (npm audit)
- [ ] No known vulnerabilities
- [ ] License compliance
```

---

## Test Coverage

### Measuring Coverage

```bash
# Run tests with coverage
pnpm test:coverage

# View coverage report
open coverage/index.html

# Check coverage thresholds
pnpm test:coverage --coverage.statements=80 --coverage.branches=75
```

### Coverage Configuration

**vitest.config.ts:**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'coverage/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/types/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
});
```

---

## Continuous Integration

### GitHub Actions Workflow

**.github/workflows/test.yml:**

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: euaiact_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run database migrations
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/euaiact_test

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/euaiact_test

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/euaiact_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/login
            http://localhost:3000/dashboard
          uploadArtifacts: true
```

---

## Best Practices

### 1. Test Naming Conventions

```typescript
// ✅ Good: Descriptive test names
describe('calculateRiskScore', () => {
  it('should calculate score as likelihood × impact', () => {});
  it('should throw error when likelihood is out of range', () => {});
  it('should return correct risk level for boundary values', () => {});
});

// ❌ Bad: Vague test names
describe('risk', () => {
  it('test1', () => {});
  it('works', () => {});
});
```

### 2. AAA Pattern (Arrange-Act-Assert)

```typescript
it('should create AI system with valid data', async () => {
  // Arrange
  const systemData = {
    name: 'Test System',
    businessPurpose: 'Testing',
    // ... other fields
  };

  // Act
  const result = await createSystem(systemData);

  // Assert
  expect(result).toMatchObject(systemData);
  expect(result.id).toBeDefined();
});
```

### 3. Test Isolation

```typescript
// ✅ Good: Each test is independent
describe('SystemService', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('test A', async () => {
    const system = await createTestSystem();
    // test logic
  });

  it('test B', async () => {
    const system = await createTestSystem();
    // test logic
  });
});

// ❌ Bad: Tests depend on each other
describe('SystemService', () => {
  let systemId;

  it('should create system', async () => {
    const system = await createSystem({});
    systemId = system.id; // Don't do this
  });

  it('should update system', async () => {
    await updateSystem(systemId, {}); // Depends on previous test
  });
});
```

### 4. Mock External Dependencies

```typescript
// Mock Gemini API
vi.mock('@/lib/gemini/client', () => ({
  generateContent: vi.fn().mockResolvedValue('Generated content'),
}));

// Mock file system
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: { user: { id: 'test-user' } },
    status: 'authenticated',
  })),
}));
```

### 5. Snapshot Testing (Use Sparingly)

```typescript
// Good for stable UI components
it('should match snapshot', () => {
  const { container } = render(<SystemCard system={mockSystem} />);
  expect(container).toMatchSnapshot();
});

// Update snapshots when intentional changes made
// pnpm test -- -u
```

---

**End of Testing Guide**

This comprehensive testing guide covers all aspects of testing for the EU AI Act Implementation Lab. Use it as a reference for writing tests, setting up CI/CD, and maintaining high code quality.
