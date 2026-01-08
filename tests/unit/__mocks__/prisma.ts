/**
 * Mock Prisma Client for Unit Tests
 *
 * Provides a mock database client for isolated unit testing without
 * requiring a real database connection.
 */

import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});

// Mock Prisma Client singleton
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

/**
 * Factory function to create mock AI System data
 */
export const createMockAISystem = (overrides = {}) => ({
  id: 'test-system-id',
  name: 'Test AI System',
  description: 'Test system description',
  purpose: 'Automated recruitment screening',
  developmentStage: 'IN_PRODUCTION',
  intendedUsers: 'HR managers and recruiters',
  dataProcessed: 'Candidate CVs, cover letters, employment history',
  geographicScope: 'European Union',
  organizationId: 'test-org-id',
  createdAt: new Date('2026-01-08T00:00:00Z'),
  updatedAt: new Date('2026-01-08T00:00:00Z'),
  ...overrides,
});

/**
 * Factory function to create mock Classification data
 */
export const createMockClassification = (overrides = {}) => ({
  id: 'test-classification-id',
  systemId: 'test-system-id',
  riskLevel: 'HIGH_RISK',
  reasoning: 'System is used for employment decisions',
  prohibitedUse: false,
  article5Analysis: 'Not a prohibited AI system',
  annex3Analysis: 'Falls under Annex III category 4(a) - Employment',
  completedAt: new Date('2026-01-08T00:00:00Z'),
  createdAt: new Date('2026-01-08T00:00:00Z'),
  updatedAt: new Date('2026-01-08T00:00:00Z'),
  ...overrides,
});

/**
 * Factory function to create mock Gap Assessment data
 */
export const createMockGapAssessment = (overrides = {}) => ({
  id: 'test-gap-assessment-id',
  systemId: 'test-system-id',
  overallCompliance: 45.5,
  criticalGaps: 12,
  majorGaps: 8,
  minorGaps: 15,
  completedAt: new Date('2026-01-08T00:00:00Z'),
  createdAt: new Date('2026-01-08T00:00:00Z'),
  updatedAt: new Date('2026-01-08T00:00:00Z'),
  ...overrides,
});

/**
 * Factory function to create mock Organization data
 */
export const createMockOrganization = (overrides = {}) => ({
  id: 'test-org-id',
  name: 'TalentTech Solutions GmbH',
  country: 'Germany',
  industry: 'Technology - Recruitment',
  size: '50-200',
  createdAt: new Date('2026-01-08T00:00:00Z'),
  updatedAt: new Date('2026-01-08T00:00:00Z'),
  ...overrides,
});

/**
 * Factory function to create mock User data
 */
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@talenttech.de',
  name: 'Test User',
  role: 'ADMIN',
  organizationId: 'test-org-id',
  emailVerified: new Date('2026-01-08T00:00:00Z'),
  createdAt: new Date('2026-01-08T00:00:00Z'),
  updatedAt: new Date('2026-01-08T00:00:00Z'),
  ...overrides,
});

/**
 * Factory function to create mock Technical Documentation data
 */
export const createMockTechnicalDoc = (overrides = {}) => ({
  id: 'test-tech-doc-id',
  systemId: 'test-system-id',
  section1GeneralInfo: 'General information about the AI system',
  section2IntendedPurpose: 'System is designed for automated recruitment screening',
  section3Architecture: 'Machine learning model with data preprocessing pipeline',
  section4DataGovernance: 'Data governance and quality measures',
  section5Training: 'Training, validation, and testing procedures',
  section6Performance: 'Performance metrics and limitations',
  section7HumanOversight: 'Human oversight and intervention measures',
  section8Cybersecurity: 'Cybersecurity and robustness measures',
  completedAt: new Date('2026-01-08T00:00:00Z'),
  createdAt: new Date('2026-01-08T00:00:00Z'),
  updatedAt: new Date('2026-01-08T00:00:00Z'),
  ...overrides,
});

/**
 * Factory function to create mock Incident data
 */
export const createMockIncident = (overrides = {}) => ({
  id: 'test-incident-id',
  systemId: 'test-system-id',
  organizationId: 'test-org-id',
  title: 'Test Incident',
  description: 'Description of the incident',
  severity: 'MEDIUM',
  status: 'OPEN',
  detectedAt: new Date('2026-01-08T00:00:00Z'),
  reportedAt: new Date('2026-01-08T00:00:00Z'),
  createdAt: new Date('2026-01-08T00:00:00Z'),
  updatedAt: new Date('2026-01-08T00:00:00Z'),
  ...overrides,
});
