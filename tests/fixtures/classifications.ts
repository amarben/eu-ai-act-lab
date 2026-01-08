/**
 * Test Fixtures: Risk Classifications
 *
 * Reusable test data for AI system risk classifications.
 */

/**
 * High-risk classification for TalentMatch AI (employment)
 */
export const talentMatchClassification = {
  id: 'classification-talent-match-001',
  systemId: 'talent-match-ai-001',
  riskLevel: 'HIGH_RISK',
  reasoning: 'This AI system falls under the HIGH_RISK category because it is used for employment, workers management, and access to self-employment decisions. According to Annex III of the EU AI Act, AI systems used for recruitment or selection of natural persons, particularly for advertising vacancies, screening or filtering applications, evaluating candidates during interviews or tests fall into the high-risk category.',
  prohibitedUse: false,
  article5Analysis: 'The system does not appear to engage in any prohibited practices under Article 5 of the EU AI Act. It does not manipulate human behavior through subliminal techniques, exploit vulnerabilities, engage in social scoring by public authorities, or use real-time remote biometric identification in publicly accessible spaces for law enforcement purposes.',
  annex3Analysis: 'The system clearly falls under Annex III, Category 4(a): Employment, workers management and access to self-employment - AI systems intended to be used for recruitment or selection of natural persons, notably for placing targeted job advertisements, analysing and filtering job applications, and evaluating candidates.',
  completedAt: new Date('2024-03-20T14:30:00Z'),
  createdAt: new Date('2024-03-20T14:30:00Z'),
  updatedAt: new Date('2024-03-20T14:30:00Z'),
};

/**
 * High-risk classification for CreditScore AI (financial services)
 */
export const creditScoreClassification = {
  id: 'classification-credit-score-002',
  systemId: 'credit-score-ai-002',
  riskLevel: 'HIGH_RISK',
  reasoning: 'This AI system is classified as HIGH_RISK under Annex III, Category 5(a) of the EU AI Act. It is used for creditworthiness assessment and credit scoring, which determines access to essential financial services. The system makes decisions that can significantly impact individuals\' access to loans and financial products.',
  prohibitedUse: false,
  article5Analysis: 'The system does not engage in prohibited AI practices. It does not manipulate behavior, exploit vulnerabilities, engage in social scoring by public authorities, or use real-time remote biometric identification for law enforcement.',
  annex3Analysis: 'Falls under Annex III, Category 5(a): Access to and enjoyment of essential private services and public services and benefits - AI systems intended to be used to evaluate the creditworthiness of natural persons or establish their credit score.',
  completedAt: new Date('2023-11-25T10:15:00Z'),
  createdAt: new Date('2023-11-25T10:15:00Z'),
  updatedAt: new Date('2023-11-25T10:15:00Z'),
};

/**
 * High-risk classification for HealthDiag AI (medical device)
 */
export const healthDiagClassification = {
  id: 'classification-health-diag-003',
  systemId: 'health-diag-ai-003',
  riskLevel: 'HIGH_RISK',
  reasoning: 'This AI system is classified as HIGH_RISK under Annex III, Category 1: Biometric identification and categorisation of natural persons, and Category 2: Management and operation of critical infrastructure. Medical diagnosis systems that influence medical decisions are considered safety components of medical devices and fall under high-risk classification.',
  prohibitedUse: false,
  article5Analysis: 'The system does not engage in prohibited practices. However, if it were to use biometric data for categorization beyond medical diagnosis purposes, it could potentially violate Article 5 restrictions.',
  annex3Analysis: 'Falls under medical device regulations and Annex III due to its role in influencing critical health decisions. The system assists in disease detection, which directly impacts patient safety and health outcomes.',
  completedAt: new Date('2025-06-15T16:00:00Z'),
  createdAt: new Date('2025-06-15T16:00:00Z'),
  updatedAt: new Date('2025-06-15T16:00:00Z'),
};

/**
 * Limited-risk classification for ChatBot Assistant
 */
export const chatBotClassification = {
  id: 'classification-chatbot-004',
  systemId: 'chatbot-assistant-004',
  riskLevel: 'LIMITED_RISK',
  reasoning: 'This AI system is classified as LIMITED_RISK because it interacts directly with natural persons through conversational interfaces. Under Article 52 of the EU AI Act, AI systems that interact with humans must comply with transparency obligations to ensure users are aware they are interacting with AI.',
  prohibitedUse: false,
  article5Analysis: 'The system does not engage in any prohibited practices. It provides transparent customer support services without manipulation or exploitation.',
  annex3Analysis: 'Does not fall under any Annex III high-risk categories. The system provides customer service support and does not make decisions about employment, creditworthiness, access to services, or other high-risk areas.',
  completedAt: new Date('2024-01-20T13:45:00Z'),
  createdAt: new Date('2024-01-20T13:45:00Z'),
  updatedAt: new Date('2024-01-20T13:45:00Z'),
};

/**
 * Minimal-risk classification for SpamFilter AI
 */
export const spamFilterClassification = {
  id: 'classification-spam-filter-005',
  systemId: 'spam-filter-ai-005',
  riskLevel: 'MINIMAL_RISK',
  reasoning: 'This AI system is classified as MINIMAL_RISK because it performs a purely technical function (spam filtering) that does not fall under any high-risk or limited-risk categories. It does not interact directly with users in a way that requires transparency obligations, and its decisions do not significantly impact fundamental rights.',
  prohibitedUse: false,
  article5Analysis: 'No concerns under Article 5. The system protects users from spam and malicious content without engaging in prohibited practices.',
  annex3Analysis: 'Does not fall under any Annex III categories. Email spam filtering is a standard security function that does not involve high-risk decision-making.',
  completedAt: new Date('2023-05-15T11:30:00Z'),
  createdAt: new Date('2023-05-15T11:30:00Z'),
  updatedAt: new Date('2023-05-15T11:30:00Z'),
};

/**
 * Prohibited use flag for FacialRecog Security (real-time biometric in public spaces)
 */
export const facialRecogClassification = {
  id: 'classification-facial-recog-006',
  systemId: 'facial-recog-security-006',
  riskLevel: 'HIGH_RISK',
  reasoning: 'This AI system is classified as HIGH_RISK due to its use of biometric identification. Depending on deployment context, it may be subject to strict prohibitions under Article 5 if used for real-time remote biometric identification in publicly accessible spaces for law enforcement purposes.',
  prohibitedUse: false,
  article5Analysis: 'The system uses biometric facial recognition for building access control. If deployed in publicly accessible spaces without explicit consent and proper safeguards, it could potentially violate Article 5(1)(d) regarding real-time remote biometric identification. Current use for employee access control in private facilities does not constitute prohibited use.',
  annex3Analysis: 'Falls under Annex III, Category 1: Biometric identification and categorisation of natural persons. The system must comply with all high-risk AI system requirements including human oversight, accuracy, robustness, and cybersecurity measures.',
  completedAt: new Date('2025-09-10T15:20:00Z'),
  createdAt: new Date('2025-09-10T15:20:00Z'),
  updatedAt: new Date('2025-09-10T15:20:00Z'),
};

/**
 * Minimal-risk classification for RecommendationEngine
 */
export const recommendationEngineClassification = {
  id: 'classification-recommendation-007',
  systemId: 'recommendation-engine-007',
  riskLevel: 'MINIMAL_RISK',
  reasoning: 'This AI system is classified as MINIMAL_RISK because it provides product recommendations in an e-commerce context without making high-stakes decisions affecting fundamental rights. The system does not determine access to essential services, employment, or creditworthiness.',
  prohibitedUse: false,
  article5Analysis: 'No concerns under Article 5. The system provides helpful product suggestions without manipulation or exploitation of user vulnerabilities.',
  annex3Analysis: 'Does not fall under any Annex III high-risk categories. Product recommendations for e-commerce are not considered high-risk unless they involve essential services or exploit user vulnerabilities.',
  completedAt: new Date('2023-08-25T12:00:00Z'),
  createdAt: new Date('2023-08-25T12:00:00Z'),
  updatedAt: new Date('2023-08-25T12:00:00Z'),
};

/**
 * Array of all test classifications
 */
export const allClassifications = [
  talentMatchClassification,
  creditScoreClassification,
  healthDiagClassification,
  chatBotClassification,
  spamFilterClassification,
  facialRecogClassification,
  recommendationEngineClassification,
];

/**
 * Get classification by system ID
 */
export const getClassificationBySystemId = (systemId: string) => {
  return allClassifications.find(classification => classification.systemId === systemId);
};

/**
 * Get classifications by risk level
 */
export const getClassificationsByRiskLevel = (riskLevel: 'HIGH_RISK' | 'LIMITED_RISK' | 'MINIMAL_RISK') => {
  return allClassifications.filter(classification => classification.riskLevel === riskLevel);
};
