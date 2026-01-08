/**
 * Mock Gemini AI API for Unit Tests
 *
 * Provides mock responses for Gemini AI integration testing without
 * making actual API calls or incurring costs.
 */

import { vi } from 'vitest';

/**
 * Mock successful system description generation
 */
export const mockGenerateSystemDescription = vi.fn().mockResolvedValue({
  description: 'TalentMatch AI is an automated recruitment screening system that uses machine learning to analyze candidate CVs and match them against job requirements. The system processes candidate data including resumes, cover letters, and employment history to provide recruiters with ranked candidate lists.',
  tokensUsed: 245,
  timestamp: new Date('2026-01-08T00:00:00Z'),
});

/**
 * Mock successful risk assessment generation
 */
export const mockGenerateRiskAssessment = vi.fn().mockResolvedValue({
  riskLevel: 'HIGH_RISK',
  reasoning: 'This AI system falls under the HIGH_RISK category because it is used for employment, workers management, and access to self-employment decisions. According to Annex III of the EU AI Act, AI systems used for recruitment or selection of natural persons, particularly for advertising vacancies, screening or filtering applications, evaluating candidates during interviews or tests fall into the high-risk category.',
  prohibitedUse: false,
  article5Analysis: 'The system does not appear to engage in any prohibited practices under Article 5 of the EU AI Act. It does not manipulate human behavior through subliminal techniques, exploit vulnerabilities, engage in social scoring by public authorities, or use real-time remote biometric identification in publicly accessible spaces for law enforcement purposes.',
  annex3Analysis: 'The system clearly falls under Annex III, Category 4(a): Employment, workers management and access to self-employment - AI systems intended to be used for recruitment or selection of natural persons.',
  tokensUsed: 520,
  timestamp: new Date('2026-01-08T00:00:00Z'),
});

/**
 * Mock successful gap analysis generation
 */
export const mockGenerateGapAnalysis = vi.fn().mockResolvedValue({
  overallCompliance: 45.5,
  criticalGaps: [
    {
      requirement: 'Article 9: Risk Management System',
      status: 'MISSING',
      description: 'No documented risk management system in place',
      remediation: 'Establish and document a comprehensive risk management system',
      priority: 'CRITICAL',
    },
    {
      requirement: 'Article 10: Data and Data Governance',
      status: 'PARTIAL',
      description: 'Data governance measures are incomplete',
      remediation: 'Complete data quality, bias detection, and governance framework',
      priority: 'CRITICAL',
    },
  ],
  majorGaps: [
    {
      requirement: 'Article 11: Technical Documentation',
      status: 'MISSING',
      description: 'Technical documentation is not complete',
      remediation: 'Create comprehensive technical documentation per Article 11 requirements',
      priority: 'HIGH',
    },
  ],
  minorGaps: [
    {
      requirement: 'Article 13: Transparency and Information',
      status: 'PARTIAL',
      description: 'User information requirements partially met',
      remediation: 'Enhance transparency documentation and user communications',
      priority: 'MEDIUM',
    },
  ],
  tokensUsed: 890,
  timestamp: new Date('2026-01-08T00:00:00Z'),
});

/**
 * Mock successful technical documentation generation
 */
export const mockGenerateTechnicalDoc = vi.fn().mockResolvedValue({
  section1GeneralInfo: 'TalentMatch AI is a machine learning-based recruitment screening system developed by TalentTech Solutions GmbH. The system automates the initial screening of candidate applications by analyzing CVs, cover letters, and employment history against job requirements. Version 2.1, deployed in production since March 2024.',
  section2IntendedPurpose: 'The system is designed to assist HR professionals in the recruitment process by automatically screening and ranking candidates based on their qualifications, experience, and fit for specific job positions. It aims to reduce manual screening time while maintaining fairness and consistency in candidate evaluation.',
  section3Architecture: 'The system uses a neural network architecture trained on historical recruitment data. It consists of data preprocessing modules, feature extraction layers, the core ML model, and a ranking algorithm. The architecture includes bias detection mechanisms and explainability features to ensure transparent decision-making.',
  section4DataGovernance: 'Data governance measures include strict access controls, data quality validation, bias detection algorithms, and GDPR-compliant data handling procedures. All candidate data is encrypted at rest and in transit. Data retention policies comply with employment law requirements.',
  section5Training: 'The model was trained on 50,000 anonymized historical recruitment decisions. Training data underwent bias testing and quality validation. The training process included cross-validation, hyperparameter tuning, and fairness constraint optimization to ensure equitable outcomes across demographic groups.',
  section6Performance: 'The system achieves 87% accuracy in candidate-job matching with a false positive rate of 8%. Performance metrics are monitored continuously, with monthly audits for bias and fairness. Known limitations include reduced accuracy for novel job categories and sensitivity to CV formatting variations.',
  section7HumanOversight: 'All AI-generated rankings are reviewed by human recruiters before candidate contact. The system includes override mechanisms, explanation features, and audit logging. HR managers receive training on system limitations and proper use of AI recommendations.',
  section8Cybersecurity: 'Security measures include encrypted data storage, role-based access control, regular security audits, penetration testing, and incident response procedures. The system is hosted on SOC 2 compliant infrastructure with 99.9% uptime SLA.',
  tokensUsed: 1250,
  timestamp: new Date('2026-01-08T00:00:00Z'),
});

/**
 * Mock API error responses
 */
export const mockGeminiAPIError = vi.fn().mockRejectedValue({
  error: 'API_ERROR',
  message: 'Gemini API quota exceeded',
  statusCode: 429,
});

export const mockGeminiNetworkError = vi.fn().mockRejectedValue({
  error: 'NETWORK_ERROR',
  message: 'Failed to connect to Gemini API',
  statusCode: 503,
});

export const mockGeminiInvalidInput = vi.fn().mockRejectedValue({
  error: 'INVALID_INPUT',
  message: 'Invalid input provided to Gemini API',
  statusCode: 400,
});

/**
 * Mock rate limiting behavior
 */
export const mockRateLimitExceeded = vi.fn().mockRejectedValue({
  error: 'RATE_LIMIT_EXCEEDED',
  message: 'Rate limit exceeded. Please try again later.',
  retryAfter: 60,
  statusCode: 429,
});

/**
 * Mock token usage tracking
 */
export const mockTokenUsage = {
  totalTokens: 0,
  requestCount: 0,
  reset: () => {
    mockTokenUsage.totalTokens = 0;
    mockTokenUsage.requestCount = 0;
  },
  track: (tokens: number) => {
    mockTokenUsage.totalTokens += tokens;
    mockTokenUsage.requestCount += 1;
  },
};

/**
 * Helper to reset all Gemini mocks
 */
export const resetGeminiMocks = () => {
  mockGenerateSystemDescription.mockClear();
  mockGenerateRiskAssessment.mockClear();
  mockGenerateGapAnalysis.mockClear();
  mockGenerateTechnicalDoc.mockClear();
  mockGeminiAPIError.mockClear();
  mockGeminiNetworkError.mockClear();
  mockGeminiInvalidInput.mockClear();
  mockRateLimitExceeded.mockClear();
  mockTokenUsage.reset();
};

// Auto-reset before each test
beforeEach(() => {
  resetGeminiMocks();
});
