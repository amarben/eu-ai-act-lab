/**
 * Test Fixtures: AI Systems
 *
 * Reusable test data for AI systems across unit and integration tests.
 */

/**
 * TalentMatch AI - High-risk recruitment system (primary test case)
 */
export const talentMatchAI = {
  id: 'talent-match-ai-001',
  name: 'TalentMatch AI',
  description: 'Automated recruitment screening system using machine learning to analyze candidate CVs and match them against job requirements.',
  purpose: 'Automate initial candidate screening to reduce manual review time while maintaining fairness and consistency in recruitment decisions.',
  developmentStage: 'IN_PRODUCTION',
  intendedUsers: 'HR managers, recruiters, and hiring managers at TalentTech Solutions',
  dataProcessed: 'Candidate CVs, cover letters, employment history, educational qualifications, skills assessments, and interview notes.',
  geographicScope: 'European Union (Germany, France, Netherlands, Belgium)',
  organizationId: 'talenttech-solutions-de',
  createdAt: new Date('2024-03-15T10:00:00Z'),
  updatedAt: new Date('2026-01-08T10:00:00Z'),
};

/**
 * CreditScore AI - High-risk financial system
 */
export const creditScoreAI = {
  id: 'credit-score-ai-002',
  name: 'CreditScore AI',
  description: 'AI-powered credit scoring system for loan application assessment.',
  purpose: 'Evaluate creditworthiness of loan applicants using machine learning models trained on historical financial data.',
  developmentStage: 'IN_PRODUCTION',
  intendedUsers: 'Financial analysts, loan officers, credit risk teams',
  dataProcessed: 'Financial history, income data, employment records, credit bureau reports, transaction history.',
  geographicScope: 'European Union (Germany, Austria, Switzerland)',
  organizationId: 'fintech-bank-eu',
  createdAt: new Date('2023-11-20T14:30:00Z'),
  updatedAt: new Date('2026-01-05T09:15:00Z'),
};

/**
 * HealthDiag AI - High-risk medical diagnosis system
 */
export const healthDiagAI = {
  id: 'health-diag-ai-003',
  name: 'HealthDiag AI',
  description: 'Medical imaging analysis system for early disease detection.',
  purpose: 'Assist radiologists in detecting anomalies in medical imaging (X-rays, CT scans, MRIs) with AI-powered image analysis.',
  developmentStage: 'PILOT',
  intendedUsers: 'Radiologists, oncologists, medical imaging specialists',
  dataProcessed: 'Medical imaging data (DICOM files), patient demographics, medical history, physician annotations.',
  geographicScope: 'European Union (Germany)',
  organizationId: 'medtech-diagnostics-gmbh',
  createdAt: new Date('2025-06-10T08:00:00Z'),
  updatedAt: new Date('2026-01-07T16:45:00Z'),
};

/**
 * ChatBot Assistant - Limited-risk customer service system
 */
export const chatBotAssistant = {
  id: 'chatbot-assistant-004',
  name: 'ChatBot Assistant',
  description: 'Customer service chatbot for handling common support inquiries.',
  purpose: 'Provide 24/7 automated customer support for frequently asked questions and basic troubleshooting.',
  developmentStage: 'IN_PRODUCTION',
  intendedUsers: 'Customer service team, end customers',
  dataProcessed: 'Customer inquiries, chat transcripts, product usage data, support ticket history.',
  geographicScope: 'Global',
  organizationId: 'customer-support-tech',
  createdAt: new Date('2024-01-15T12:00:00Z'),
  updatedAt: new Date('2025-12-20T11:30:00Z'),
};

/**
 * SpamFilter AI - Minimal-risk email filtering system
 */
export const spamFilterAI = {
  id: 'spam-filter-ai-005',
  name: 'SpamFilter AI',
  description: 'Machine learning-based spam detection for email security.',
  purpose: 'Automatically detect and filter spam, phishing, and malicious emails to protect users.',
  developmentStage: 'IN_PRODUCTION',
  intendedUsers: 'IT security team, all email users',
  dataProcessed: 'Email headers, sender information, email content (text analysis), attachment metadata.',
  geographicScope: 'European Union',
  organizationId: 'email-security-corp',
  createdAt: new Date('2023-05-10T09:00:00Z'),
  updatedAt: new Date('2025-11-30T14:20:00Z'),
};

/**
 * FacialRecog Security - Prohibited/High-risk biometric system
 */
export const facialRecogSecurity = {
  id: 'facial-recog-security-006',
  name: 'FacialRecog Security',
  description: 'Real-time facial recognition for building access control.',
  purpose: 'Provide secure building access using biometric facial recognition technology.',
  developmentStage: 'DEVELOPMENT',
  intendedUsers: 'Security personnel, facility managers, employees',
  dataProcessed: 'Facial biometric data, access logs, employee photos, real-time video feeds.',
  geographicScope: 'European Union (Germany)',
  organizationId: 'security-systems-eu',
  createdAt: new Date('2025-09-01T10:00:00Z'),
  updatedAt: new Date('2026-01-06T13:00:00Z'),
};

/**
 * RecommendationEngine - Minimal-risk product recommendation system
 */
export const recommendationEngine = {
  id: 'recommendation-engine-007',
  name: 'RecommendationEngine',
  description: 'Product recommendation system for e-commerce platform.',
  purpose: 'Provide personalized product recommendations to enhance shopping experience and increase sales.',
  developmentStage: 'IN_PRODUCTION',
  intendedUsers: 'E-commerce platform users, marketing team',
  dataProcessed: 'Browsing history, purchase history, product views, cart data, user preferences.',
  geographicScope: 'European Union',
  organizationId: 'ecommerce-platform-eu',
  createdAt: new Date('2023-08-20T11:00:00Z'),
  updatedAt: new Date('2025-12-15T10:45:00Z'),
};

/**
 * Array of all test AI systems
 */
export const allAISystems = [
  talentMatchAI,
  creditScoreAI,
  healthDiagAI,
  chatBotAssistant,
  spamFilterAI,
  facialRecogSecurity,
  recommendationEngine,
];

/**
 * Filter systems by risk level (helper for tests)
 */
export const getSystemsByRiskLevel = (riskLevel: 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK') => {
  const highRiskSystems = [talentMatchAI, creditScoreAI, healthDiagAI, facialRecogSecurity];
  const limitedRiskSystems = [chatBotAssistant];
  const minimalRiskSystems = [spamFilterAI, recommendationEngine];

  switch (riskLevel) {
    case 'HIGH_RISK':
      return highRiskSystems;
    case 'LIMITED_RISK':
      return limitedRiskSystems;
    case 'MINIMAL_RISK':
      return minimalRiskSystems;
    default:
      return [];
  }
};

/**
 * Get system by ID (helper for tests)
 */
export const getSystemById = (id: string) => {
  return allAISystems.find(system => system.id === id);
};
