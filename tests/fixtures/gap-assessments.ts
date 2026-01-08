/**
 * Test Fixtures: Gap Assessments
 *
 * Reusable test data for compliance gap assessments.
 */

/**
 * Gap assessment for TalentMatch AI (45.5% compliance)
 */
export const talentMatchGapAssessment = {
  id: 'gap-assessment-talent-match-001',
  systemId: 'talent-match-ai-001',
  overallCompliance: 45.5,
  criticalGaps: 12,
  majorGaps: 8,
  minorGaps: 15,
  gaps: [
    {
      category: 'Risk Management',
      requirement: 'Article 9: Risk Management System',
      status: 'MISSING',
      description: 'No comprehensive risk management system documented. Missing continuous identification, analysis, and mitigation of risks throughout the AI system lifecycle.',
      remediation: 'Establish a risk management system covering:\n- Risk identification process\n- Risk analysis and evaluation methodology\n- Risk mitigation measures\n- Testing and validation procedures\n- Post-market monitoring\n- Documentation and updates',
      priority: 'CRITICAL',
      estimatedEffort: '40-60 hours',
      article: 'Article 9',
    },
    {
      category: 'Data Governance',
      requirement: 'Article 10: Data and Data Governance',
      status: 'PARTIAL',
      description: 'Data governance measures are incomplete. Missing comprehensive data quality checks, bias detection procedures, and data validation processes.',
      remediation: 'Complete data governance framework:\n- Implement data quality validation\n- Establish bias detection and mitigation\n- Create data lineage documentation\n- Set up data versioning procedures\n- Document data selection criteria',
      priority: 'CRITICAL',
      estimatedEffort: '30-40 hours',
      article: 'Article 10',
    },
    {
      category: 'Technical Documentation',
      requirement: 'Article 11: Technical Documentation',
      status: 'MISSING',
      description: 'Technical documentation does not meet Article 11 requirements. Missing detailed descriptions of system architecture, training procedures, and performance metrics.',
      remediation: 'Create comprehensive technical documentation covering all 8 required sections:\n1. General system information\n2. Intended purpose\n3. System architecture\n4. Data governance\n5. Training methodology\n6. Performance metrics\n7. Human oversight\n8. Cybersecurity',
      priority: 'CRITICAL',
      estimatedEffort: '20-30 hours',
      article: 'Article 11',
    },
    {
      category: 'Record-Keeping',
      requirement: 'Article 12: Record-Keeping',
      status: 'MISSING',
      description: 'Automated logging system not implemented. Missing comprehensive records of system operations, decisions, and human oversight actions.',
      remediation: 'Implement automated record-keeping system:\n- Log all system decisions\n- Track human oversight actions\n- Record input data characteristics\n- Store audit trails\n- Enable records search and retrieval',
      priority: 'CRITICAL',
      estimatedEffort: '25-35 hours',
      article: 'Article 12',
    },
    {
      category: 'Transparency',
      requirement: 'Article 13: Transparency and Information Provision',
      status: 'PARTIAL',
      description: 'User information and transparency requirements partially met. Missing comprehensive instructions for use and deployment.',
      remediation: 'Enhance transparency documentation:\n- Create detailed user instructions\n- Document system capabilities and limitations\n- Provide performance metrics\n- Establish user communication channels\n- Create FAQ and troubleshooting guides',
      priority: 'HIGH',
      estimatedEffort: '15-20 hours',
      article: 'Article 13',
    },
    {
      category: 'Human Oversight',
      requirement: 'Article 14: Human Oversight',
      status: 'PARTIAL',
      description: 'Human oversight measures are implemented but not fully documented. Missing comprehensive oversight procedures and intervention mechanisms.',
      remediation: 'Document and enhance human oversight:\n- Formalize oversight procedures\n- Implement intervention mechanisms\n- Create escalation protocols\n- Train oversight personnel\n- Establish monitoring schedules',
      priority: 'HIGH',
      estimatedEffort: '20-25 hours',
      article: 'Article 14',
    },
    {
      category: 'Accuracy & Robustness',
      requirement: 'Article 15: Accuracy, Robustness and Cybersecurity',
      status: 'PARTIAL',
      description: 'Accuracy metrics tracked but robustness testing and cybersecurity measures incomplete.',
      remediation: 'Complete accuracy and robustness framework:\n- Implement comprehensive testing procedures\n- Establish accuracy thresholds\n- Conduct robustness validation\n- Enhance cybersecurity measures\n- Create incident response procedures',
      priority: 'HIGH',
      estimatedEffort: '30-40 hours',
      article: 'Article 15',
    },
  ],
  completedAt: new Date('2024-03-22T11:00:00Z'),
  createdAt: new Date('2024-03-22T11:00:00Z'),
  updatedAt: new Date('2024-03-22T11:00:00Z'),
};

/**
 * Gap assessment for CreditScore AI (38% compliance)
 */
export const creditScoreGapAssessment = {
  id: 'gap-assessment-credit-score-002',
  systemId: 'credit-score-ai-002',
  overallCompliance: 38.0,
  criticalGaps: 15,
  majorGaps: 10,
  minorGaps: 12,
  gaps: [
    {
      category: 'Risk Management',
      requirement: 'Article 9: Risk Management System',
      status: 'MISSING',
      description: 'No formal risk management system in place for the credit scoring AI.',
      remediation: 'Establish comprehensive risk management system with continuous monitoring and mitigation procedures.',
      priority: 'CRITICAL',
      estimatedEffort: '50-70 hours',
      article: 'Article 9',
    },
  ],
  completedAt: new Date('2023-11-28T09:30:00Z'),
  createdAt: new Date('2023-11-28T09:30:00Z'),
  updatedAt: new Date('2023-11-28T09:30:00Z'),
};

/**
 * Gap assessment for HealthDiag AI (52% compliance - better due to pilot stage)
 */
export const healthDiagGapAssessment = {
  id: 'gap-assessment-health-diag-003',
  systemId: 'health-diag-ai-003',
  overallCompliance: 52.0,
  criticalGaps: 8,
  majorGaps: 6,
  minorGaps: 10,
  gaps: [
    {
      category: 'Technical Documentation',
      requirement: 'Article 11: Technical Documentation',
      status: 'PARTIAL',
      description: 'Technical documentation exists but needs enhancement for medical device compliance.',
      remediation: 'Enhance technical documentation to meet both EU AI Act and Medical Device Regulation requirements.',
      priority: 'CRITICAL',
      estimatedEffort: '25-35 hours',
      article: 'Article 11',
    },
  ],
  completedAt: new Date('2025-06-18T14:45:00Z'),
  createdAt: new Date('2025-06-18T14:45:00Z'),
  updatedAt: new Date('2025-06-18T14:45:00Z'),
};

/**
 * Gap assessment for ChatBot Assistant (85% compliance - limited-risk, mostly compliant)
 */
export const chatBotGapAssessment = {
  id: 'gap-assessment-chatbot-004',
  systemId: 'chatbot-assistant-004',
  overallCompliance: 85.0,
  criticalGaps: 0,
  majorGaps: 2,
  minorGaps: 5,
  gaps: [
    {
      category: 'Transparency',
      requirement: 'Article 52: Transparency Obligations',
      status: 'PARTIAL',
      description: 'Transparency disclosure needs enhancement. Users should be clearly informed they are interacting with AI.',
      remediation: 'Add clear AI disclosure at the beginning of chat sessions and in user interface.',
      priority: 'MEDIUM',
      estimatedEffort: '5-10 hours',
      article: 'Article 52',
    },
  ],
  completedAt: new Date('2024-01-25T10:00:00Z'),
  createdAt: new Date('2024-01-25T10:00:00Z'),
  updatedAt: new Date('2024-01-25T10:00:00Z'),
};

/**
 * Gap assessment for FacialRecog Security (25% compliance - significant gaps due to biometric use)
 */
export const facialRecogGapAssessment = {
  id: 'gap-assessment-facial-recog-006',
  systemId: 'facial-recog-security-006',
  overallCompliance: 25.0,
  criticalGaps: 20,
  majorGaps: 15,
  minorGaps: 8,
  gaps: [
    {
      category: 'Prohibited Use',
      requirement: 'Article 5: Prohibited AI Practices',
      status: 'MISSING',
      description: 'System must ensure it does not violate Article 5 prohibitions on real-time biometric identification in public spaces.',
      remediation: 'Implement strict controls to prevent use in publicly accessible spaces without legal authorization. Limit deployment to private facilities with explicit consent.',
      priority: 'CRITICAL',
      estimatedEffort: '60-80 hours',
      article: 'Article 5',
    },
  ],
  completedAt: new Date('2025-09-15T12:30:00Z'),
  createdAt: new Date('2025-09-15T12:30:00Z'),
  updatedAt: new Date('2025-09-15T12:30:00Z'),
};

/**
 * Array of all test gap assessments
 */
export const allGapAssessments = [
  talentMatchGapAssessment,
  creditScoreGapAssessment,
  healthDiagGapAssessment,
  chatBotGapAssessment,
  facialRecogGapAssessment,
];

/**
 * Get gap assessment by system ID
 */
export const getGapAssessmentBySystemId = (systemId: string) => {
  return allGapAssessments.find(assessment => assessment.systemId === systemId);
};

/**
 * Get assessments by compliance level
 */
export const getAssessmentsByComplianceLevel = (minCompliance: number, maxCompliance: number) => {
  return allGapAssessments.filter(
    assessment => assessment.overallCompliance >= minCompliance && assessment.overallCompliance <= maxCompliance
  );
};
